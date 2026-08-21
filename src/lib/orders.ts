import { randomBytes } from "crypto";
import { getDb } from "./db";
import { getProductById } from "./products";
import type { Order, OrderItem, OrderStatus } from "./types";

export type NewOrderInput = {
  customer_name: string;
  phone: string;
  email?: string;
  district: string;
  thana: string;
  postcode?: string;
  address: string;
  notes?: string;
  items: { productId: number; quantity: number }[];
};

function normPhone(raw: string) {
  return (raw || "").replace(/[^0-9]/g, "");
}

export function createOrder(input: NewOrderInput): { orderId: number; orderToken: string } {
  const db = getDb();
  if (!input.items?.length) throw new Error("Cart is empty");

  const lineItems = input.items.map((it) => {
    const product = getProductById(it.productId);
    if (!product) throw new Error(`Product ${it.productId} not found`);
    if (product.stock < it.quantity) {
      throw new Error(`"${product.name}" এর জন্য পর্যাপ্ত স্টক নেই (আছে: ${product.stock})`);
    }
    const unitPrice = product.sale_price ?? product.price;
    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: it.quantity,
      line_total: unitPrice * it.quantity,
    };
  });

  const subtotal = lineItems.reduce((s, li) => s + li.line_total, 0);
  const total = subtotal; // no shipping/tax logic yet

  const orderToken = randomBytes(20).toString("hex");

  const tx = db.transaction(() => {
    const orderInfo = db
      .prepare(
        `INSERT INTO orders (order_token, customer_name, phone, email, district, thana, postcode, address, payment_method, status, subtotal, total, notes)
         VALUES (@order_token, @customer_name, @phone, @email, @district, @thana, @postcode, @address, 'cod', 'pending', @subtotal, @total, @notes)`
      )
      .run({
        order_token: orderToken,
        customer_name: input.customer_name,
        phone: normPhone(input.phone),
        email: input.email || null,
        district: input.district,
        thana: input.thana,
        postcode: input.postcode || null,
        address: input.address,
        subtotal,
        total,
        notes: input.notes || "",
      });
    const orderId = orderInfo.lastInsertRowid as number;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
       VALUES (@order_id, @product_id, @product_name, @unit_price, @quantity, @line_total)`
    );
    const decrementStock = db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`);
    for (const li of lineItems) {
      insertItem.run({ order_id: orderId, ...li });
      decrementStock.run(li.quantity, li.product_id);
    }
    return orderId;
  });

  const orderId = tx();
  return { orderId, orderToken };
}

/**
 * Public order-confirmation lookup — by the unguessable token issued at
 * checkout, not by the sequential numeric ID (which would let anyone
 * enumerate other customers' orders/addresses).
 */
export function getOrderByToken(token: string): { order: Order; items: OrderItem[] } | undefined {
  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE order_token = ?").get(token) as Order | undefined;
  if (!order) return undefined;
  return { order, items: getOrderItems(order.id) };
}

export function getOrderItems(orderId: number): OrderItem[] {
  return getDb().prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId) as OrderItem[];
}

export function getOrderByIdUnsafe(orderId: number): Order | undefined {
  // INTERNAL ONLY — no phone check. Never expose to a public/customer-facing endpoint.
  return getDb().prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order | undefined;
}

/**
 * Secure order lookup for customer-facing "track order" — a phone number is
 * ALWAYS required (full number, or paired with the order ID we still verify
 * the order's phone matches at least the last 4 digits given). This avoids
 * the IDOR mistake where guessing an order ID alone reveals someone else's
 * address/phone/items.
 */
export function trackOrder(orderIdRaw: string, phoneRaw: string): { order: Order; items: OrderItem[] } | { error: string } {
  const phone = normPhone(phoneRaw);
  const orderId = orderIdRaw ? parseInt(orderIdRaw, 10) : NaN;

  if (!phone) {
    return { error: "অনুগ্রহ করে Phone Number দিন।" };
  }

  const db = getDb();

  if (!Number.isNaN(orderId)) {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order | undefined;
    if (!order) return { error: "এই Order ID এর কোনো অর্ডার পাওয়া যায়নি।" };
    const orderPhone = normPhone(order.phone);
    const ok =
      orderPhone === phone || (phone.length >= 4 && orderPhone.endsWith(phone));
    if (!ok) return { error: "Order ID ও Phone Number মিলছে না।" };
    return { order, items: getOrderItems(order.id) };
  }

  if (phone.length < 7) {
    return { error: "শুধু Phone দিয়ে খুঁজতে হলে পুরো নম্বর দিন (অন্তত ৭ ডিজিট)।" };
  }
  const candidates = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100")
    .all() as Order[];
  const match = candidates.find((o) => normPhone(o.phone) === phone);
  if (!match) return { error: "এই Phone Number দিয়ে কোনো অর্ডার পাওয়া যায়নি।" };
  return { order: match, items: getOrderItems(match.id) };
}

export function listOrders(limit = 50): Order[] {
  return getDb().prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?").all(limit) as Order[];
}

export function updateOrderStatus(orderId: number, status: OrderStatus) {
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
}

export function dashboardStats() {
  const db = getDb();
  const totalOrders = (db.prepare("SELECT COUNT(*) c FROM orders").get() as { c: number }).c;
  const todayOrders = (
    db.prepare("SELECT COUNT(*) c FROM orders WHERE date(created_at) = date('now')").get() as { c: number }
  ).c;
  const totalProducts = (db.prepare("SELECT COUNT(*) c FROM products WHERE is_active = 1").get() as { c: number }).c;
  const totalStock = (db.prepare("SELECT COALESCE(SUM(stock),0) s FROM products").get() as { s: number }).s;
  const stockValue = (
    db.prepare("SELECT COALESCE(SUM(price * stock),0) v FROM products").get() as { v: number }
  ).v;
  const totalSales = (
    db.prepare("SELECT COALESCE(SUM(total),0) v FROM orders WHERE status != 'cancelled'").get() as { v: number }
  ).v;
  const completedOrders = (
    db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'completed'").get() as { c: number }
  ).c;
  const uniqueCustomers = (
    db.prepare("SELECT COUNT(DISTINCT phone) c FROM orders").get() as { c: number }
  ).c;

  return {
    totalOrders,
    todayOrders,
    totalProducts,
    totalStock,
    stockValue,
    totalSales,
    completedOrders,
    uniqueCustomers,
  };
}
