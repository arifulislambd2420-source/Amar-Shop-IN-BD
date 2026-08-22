import { randomBytes } from "crypto";
import mysql from "mysql2/promise";
import { getDb } from "./db";
import { SHIPPING_FEE } from "./format";
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
  items: { productId: number; quantity: number; variantId?: number }[];
};

function normPhone(raw: string) {
  return (raw || "").replace(/[^0-9]/g, "");
}

export async function createOrder(input: NewOrderInput): Promise<{ orderId: number; orderToken: string }> {
  const pool = await getDb();
  if (!input.items?.length) throw new Error("Cart is empty");

  const orderToken = randomBytes(20).toString("hex");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock each product row (FOR UPDATE) so concurrent orders can't both
    // pass the stock check and oversell the last item.
    const lineItems = [];
    for (const it of input.items) {
      const [rows] = await conn.execute(
        "SELECT id, name, price, sale_price, stock FROM products WHERE id = ? FOR UPDATE",
        [it.productId]
      );
      const product = (rows as { id: number; name: string; price: number; sale_price: number | null; stock: number }[])[0];
      if (!product) throw new Error(`Product ${it.productId} not found`);

      let unitPrice = product.sale_price ?? product.price;
      let productName = product.name;
      let variantId: number | null = null;

      if (it.variantId) {
        const [vRows] = await conn.execute(
          "SELECT id, label, price, stock FROM product_variants WHERE id = ? AND product_id = ? FOR UPDATE",
          [it.variantId, it.productId]
        );
        const variant = (vRows as { id: number; label: string; price: number; stock: number }[])[0];
        if (!variant) throw new Error(`Variant ${it.variantId} not found`);
        if (variant.stock < it.quantity) {
          throw new Error(`"${product.name} ${variant.label}" এর জন্য পর্যাপ্ত স্টক নেই (আছে: ${variant.stock})`);
        }
        unitPrice = variant.price;
        productName = `${product.name} (${variant.label})`;
        variantId = variant.id;
      } else if (product.stock < it.quantity) {
        throw new Error(`"${product.name}" এর জন্য পর্যাপ্ত স্টক নেই (আছে: ${product.stock})`);
      }

      lineItems.push({
        product_id: product.id,
        variant_id: variantId,
        product_name: productName,
        unit_price: unitPrice,
        quantity: it.quantity,
        line_total: unitPrice * it.quantity,
      });
    }

    const subtotal = lineItems.reduce((s, li) => s + li.line_total, 0);
    const shippingFee = SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (order_token, customer_name, phone, email, district, thana, postcode, address, payment_method, status, subtotal, shipping_fee, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cod', 'pending', ?, ?, ?, ?)`,
      [
        orderToken,
        input.customer_name,
        normPhone(input.phone),
        input.email || null,
        input.district,
        input.thana,
        input.postcode || null,
        input.address,
        subtotal,
        shippingFee,
        total,
        input.notes || "",
      ]
    );
    const orderId = (orderResult as mysql.ResultSetHeader).insertId;

    for (const li of lineItems) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, li.product_id, li.product_name, li.unit_price, li.quantity, li.line_total]
      );
      if (li.variant_id) {
        await conn.execute("UPDATE product_variants SET stock = stock - ? WHERE id = ?", [li.quantity, li.variant_id]);
      } else {
        await conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [li.quantity, li.product_id]);
      }
    }

    await conn.commit();
    return { orderId, orderToken };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Public order-confirmation lookup — by the unguessable token issued at
 * checkout, not by the sequential numeric ID (which would let anyone
 * enumerate other customers' orders/addresses).
 */
export async function getOrderByToken(token: string): Promise<{ order: Order; items: OrderItem[] } | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM orders WHERE order_token = ?", [token]);
  const order = (rows as Order[])[0];
  if (!order) return undefined;
  return { order, items: await getOrderItems(order.id) };
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
  return rows as OrderItem[];
}

export async function getOrderByIdUnsafe(orderId: number): Promise<Order | undefined> {
  // INTERNAL ONLY — no phone check. Never expose to a public/customer-facing endpoint.
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
  return (rows as Order[])[0];
}

/**
 * Secure order lookup for customer-facing "track order" — a phone number is
 * ALWAYS required (full number, or paired with the order ID we still verify
 * the order's phone matches at least the last 4 digits given). This avoids
 * the IDOR mistake where guessing an order ID alone reveals someone else's
 * address/phone/items.
 */
export async function trackOrder(
  orderIdRaw: string,
  phoneRaw: string
): Promise<{ order: Order; items: OrderItem[] } | { error: string }> {
  const phone = normPhone(phoneRaw);
  const orderId = orderIdRaw ? parseInt(orderIdRaw, 10) : NaN;

  if (!phone) {
    return { error: "অনুগ্রহ করে Phone Number দিন।" };
  }

  const db = await getDb();

  if (!Number.isNaN(orderId)) {
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    const order = (rows as Order[])[0];
    if (!order) return { error: "এই Order ID এর কোনো অর্ডার পাওয়া যায়নি।" };
    const orderPhone = normPhone(order.phone);
    const ok = orderPhone === phone || (phone.length >= 4 && orderPhone.endsWith(phone));
    if (!ok) return { error: "Order ID ও Phone Number মিলছে না।" };
    return { order, items: await getOrderItems(order.id) };
  }

  if (phone.length < 7) {
    return { error: "শুধু Phone দিয়ে খুঁজতে হলে পুরো নম্বর দিন (অন্তত ৭ ডিজিট)।" };
  }
  const [candRows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
  const candidates = candRows as Order[];
  const match = candidates.find((o) => normPhone(o.phone) === phone);
  if (!match) return { error: "এই Phone Number দিয়ে কোনো অর্ডার পাওয়া যায়নি।" };
  return { order: match, items: await getOrderItems(match.id) };
}

export async function listOrders(limit = 50): Promise<Order[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows as Order[];
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
}

export async function dashboardStats() {
  const db = await getDb();
  const [[{ c: totalOrders }]] = (await db.query("SELECT COUNT(*) c FROM orders")) as [{ c: number }[], unknown];
  const [[{ c: todayOrders }]] = (await db.query(
    "SELECT COUNT(*) c FROM orders WHERE DATE(created_at) = CURDATE()"
  )) as [{ c: number }[], unknown];
  const [[{ c: totalProducts }]] = (await db.query(
    "SELECT COUNT(*) c FROM products WHERE is_active = 1"
  )) as [{ c: number }[], unknown];
  const [[{ s: totalStock }]] = (await db.query("SELECT COALESCE(SUM(stock),0) s FROM products")) as [
    { s: number }[],
    unknown
  ];
  const [[{ v: stockValue }]] = (await db.query(
    "SELECT COALESCE(SUM(price * stock),0) v FROM products"
  )) as [{ v: number }[], unknown];
  const [[{ v: totalSales }]] = (await db.query(
    "SELECT COALESCE(SUM(total),0) v FROM orders WHERE status != 'cancelled'"
  )) as [{ v: number }[], unknown];
  const [[{ c: completedOrders }]] = (await db.query(
    "SELECT COUNT(*) c FROM orders WHERE status = 'completed'"
  )) as [{ c: number }[], unknown];
  const [[{ c: uniqueCustomers }]] = (await db.query(
    "SELECT COUNT(DISTINCT phone) c FROM orders"
  )) as [{ c: number }[], unknown];
  const [[{ c: registeredUsers }]] = (await db.query("SELECT COUNT(*) c FROM users")) as [{ c: number }[], unknown];

  return {
    totalOrders,
    todayOrders,
    totalProducts,
    totalStock,
    stockValue,
    totalSales,
    completedOrders,
    uniqueCustomers,
    registeredUsers,
  };
}

export type OrderWithProductSummary = Order & { productSummary: string };

export async function listOrdersWithProductSummary(limit = 10): Promise<OrderWithProductSummary[]> {
  const orders = await listOrders(limit);
  const withItems = await Promise.all(
    orders.map(async (o) => {
      const items = await getOrderItems(o.id);
      const productSummary = items.length
        ? items.length === 1
          ? items[0].product_name
          : `${items[0].product_name} +${items.length - 1} more`
        : "-";
      return { ...o, productSummary };
    })
  );
  return withItems;
}
