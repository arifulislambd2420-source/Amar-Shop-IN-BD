import { randomBytes } from "crypto";
import mysql from "mysql2/promise";
import { getDb } from "./db";
import { SHIPPING_FEE } from "./format";
import type { Order, OrderItem, OrderStatus } from "./types";
import { sendSMS } from "./sms";

export type NewOrderInput = {
  customer_name: string;
  phone: string;
  email?: string;
  district: string;
  thana: string;
  postcode?: string;
  address: string;
  notes?: string;
  couponCode?: string;
  payment_method?: string;
  advance_amount?: number;
  payment_status?: string;
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
    
    let discount = 0;
    if (input.couponCode) {
      const [cRows] = await conn.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1 FOR UPDATE", [input.couponCode]);
      const coupon = (cRows as any[])[0];
      if (coupon && (!coupon.valid_until || new Date(coupon.valid_until) >= new Date()) && 
          (coupon.max_uses === null || coupon.uses < coupon.max_uses) &&
          subtotal >= coupon.min_spend) {
        if (coupon.discount_type === "percent") {
          discount = (subtotal * coupon.discount_value) / 100;
        } else {
          discount = coupon.discount_value;
        }
        discount = Math.min(discount, subtotal);
        // Increment coupon usage
        await conn.execute("UPDATE coupons SET uses = uses + 1 WHERE id = ?", [coupon.id]);
      } else {
        throw new Error("কুপন কোডটি সঠিক নয় অথবা শর্ত পূরণ করেনি");
      }
    }

    const total = subtotal + shippingFee - discount;

    // Check if orders table has discount column, we assume it does via types/schema. Actually db.ts might not have discount column on orders. Let's add discount to subtotal/total calculation without a discount column if it doesn't exist, but wait, updateOrderWithItems uses `discount` column. Oh, I should ensure orders table has `discount` column in db.ts! Let me check db.ts again if it had discount column. I will use subtotal = subtotal - discount maybe? Wait, order schema in db.ts originally has total, subtotal. Let's add discount column to orders if not present.
    // wait, we can just insert discount if the table has it. updateOrderWithItems in orders.ts already references `discount` column. Wait, line 235: `UPDATE orders SET ... discount = ?`. So `discount` column already exists in `orders`! Wait, let me check the INSERT INTO below.

    const paymentMethod = input.payment_method || 'cod';
    const advanceAmount = input.advance_amount || 0;
    const paymentStatus = input.payment_status || 'unpaid';

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (order_token, customer_name, phone, email, district, thana, postcode, address, payment_method, status, subtotal, shipping_fee, total, notes, discount, advance_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderToken,
        input.customer_name,
        normPhone(input.phone),
        input.email || null,
        input.district,
        input.thana,
        input.postcode || null,
        input.address,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
        input.notes || "",
        discount,
        advanceAmount,
        paymentStatus
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
    
    // Send order confirmation SMS
    try {
      await sendSMS(
        input.phone,
        `ধন্যবাদ! আপনার অর্ডার (#${orderId}) গ্রহণ করা হয়েছে। মোট বিল: ৳${total}। AmarShopBD`
      );
    } catch (e) {
      console.error("Failed to send order SMS", e);
    }

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
  const [rows] = await db.execute("SELECT phone FROM orders WHERE id = ?", [orderId]);
  const order = (rows as any[])[0];

  await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

  // Send status update SMS
  if (order && order.phone) {
    let msg = "";
    if (status === "processing") msg = `আপনার অর্ডার (#${orderId}) কনফার্ম করা হয়েছে। AmarShopBD`;
    else if (status === "shipped") msg = `আপনার অর্ডার (#${orderId}) কুরিয়ারে পাঠানো হয়েছে। AmarShopBD`;
    else if (status === "out_for_delivery") msg = `আপনার অর্ডার (#${orderId}) ডেলিভারির জন্য বের হয়েছে। AmarShopBD`;
    else if (status === "delivered") msg = `আপনার অর্ডার (#${orderId}) সফলভাবে ডেলিভারি হয়েছে। ধন্যবাদ! AmarShopBD`;
    
    if (msg) {
      sendSMS(order.phone, msg).catch(console.error);
    }
  }
}

export type OrderItemInput = {
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  discount: number;
};

export type OrderUpdateInput = {
  customer_name: string;
  phone: string;
  address: string;
  shipping_fee: number;
  discount: number;
  payment_method?: string;
  payment_status?: string;
  items: OrderItemInput[];
};

/**
 * Edits an already-placed order's recorded data (customer info, totals, line
 * items). Deletes and re-inserts order_items inside a transaction — the
 * simplest correct way to replace the set. Does NOT touch product/variant
 * stock; that deduction only happens once, at createOrder() time.
 */
export async function updateOrderWithItems(orderId: number, input: OrderUpdateInput): Promise<void> {
  const pool = await getDb();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const subtotal = input.items.reduce(
      (s, li) => s + (li.unit_price * li.quantity - li.discount),
      0
    );
    const total = subtotal + input.shipping_fee - input.discount;

    const paymentMethod = input.payment_method || 'cod';
    const paymentStatus = input.payment_status || 'unpaid';

    await conn.execute(
      `UPDATE orders SET customer_name = ?, phone = ?, address = ?, shipping_fee = ?, discount = ?, subtotal = ?, total = ?, payment_method = ?, payment_status = ? WHERE id = ?`,
      [input.customer_name, normPhone(input.phone), input.address, input.shipping_fee, input.discount, subtotal, total, paymentMethod, paymentStatus, orderId]
    );

    await conn.execute("DELETE FROM order_items WHERE order_id = ?", [orderId]);

    for (const li of input.items) {
      const lineTotal = li.unit_price * li.quantity - li.discount;
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total, discount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, li.product_id, li.product_name, li.unit_price, li.quantity, lineTotal, li.discount]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function dashboardStats() {
  const db = await getDb();

  // All order metrics in one pass (SUM over a boolean counts matching rows).
  const [[o]] = (await db.query(
    `SELECT
       COUNT(*) totalOrders,
       COALESCE(SUM(DATE(created_at) = CURDATE()),0) todayOrders,
       COALESCE(SUM(status = 'pending'),0) pendingOrders,
       COALESCE(SUM(status = 'processing'),0) processingOrders,
       COALESCE(SUM(status = 'completed'),0) completedOrders,
       COALESCE(SUM(status = 'cancelled'),0) cancelledOrders,
       COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END),0) totalSales,
       COALESCE(SUM(CASE WHEN status <> 'cancelled' AND DATE(created_at) = CURDATE() THEN total END),0) todaySales,
       COALESCE(SUM(CASE WHEN status <> 'cancelled' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN total END),0) monthSales,
       COUNT(DISTINCT phone) uniqueCustomers
     FROM orders`
  )) as [Record<string, number>[], unknown];

  const [[p]] = (await db.query(
    `SELECT
       COALESCE(SUM(is_active = 1),0) totalProducts,
       COALESCE(SUM(stock),0) totalStock,
       COALESCE(SUM(price * stock),0) stockValue,
       COALESCE(SUM(is_active = 1 AND stock > 0),0) inStockProducts,
       COALESCE(SUM(is_active = 1 AND stock = 0),0) outOfStockProducts
     FROM products`
  )) as [Record<string, number>[], unknown];

  const [[{ registeredUsers }]] = (await db.query("SELECT COUNT(*) registeredUsers FROM users")) as [
    { registeredUsers: number }[],
    unknown
  ];

  return {
    totalOrders: Number(o.totalOrders),
    todayOrders: Number(o.todayOrders),
    pendingOrders: Number(o.pendingOrders),
    processingOrders: Number(o.processingOrders),
    completedOrders: Number(o.completedOrders),
    cancelledOrders: Number(o.cancelledOrders),
    totalSales: Number(o.totalSales),
    todaySales: Number(o.todaySales),
    monthSales: Number(o.monthSales),
    uniqueCustomers: Number(o.uniqueCustomers),
    totalProducts: Number(p.totalProducts),
    totalStock: Number(p.totalStock),
    stockValue: Number(p.stockValue),
    inStockProducts: Number(p.inStockProducts),
    outOfStockProducts: Number(p.outOfStockProducts),
    registeredUsers: Number(registeredUsers),
  };
}

export async function topSellingProducts(
  limit = 5,
  from?: string,
  to?: string
): Promise<{ name: string; qty: number; revenue: number }[]> {
  const db = await getDb();
  const rangeSql = from && to ? "AND DATE(o.created_at) BETWEEN ? AND ?" : "";
  const params: (string | number)[] = from && to ? [from, to, limit] : [limit];
  const [rows] = await db.query(
    `SELECT oi.product_name name, SUM(oi.quantity) qty, SUM(oi.line_total) revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'cancelled' ${rangeSql}
     GROUP BY oi.product_name
     ORDER BY qty DESC
     LIMIT ?`,
    params
  );
  return (rows as { name: string; qty: number; revenue: number }[]).map((r) => ({
    name: r.name,
    qty: Number(r.qty),
    revenue: Number(r.revenue),
  }));
}

export type SalesGranularity = "daily" | "weekly" | "monthly";

export async function salesSeries(
  from: string,
  to: string,
  granularity: SalesGranularity
): Promise<{ date: string; total: number; orders: number }[]> {
  const db = await getDb();
  const fmt = granularity === "monthly" ? "%Y-%m" : granularity === "weekly" ? "%x-W%v" : "%Y-%m-%d";
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(created_at, ?) date,
            COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END),0) total,
            COUNT(*) orders
     FROM orders
     WHERE DATE(created_at) BETWEEN ? AND ?
     GROUP BY date
     ORDER BY MIN(created_at) ASC`,
    [fmt, from, to]
  );
  return (rows as { date: string; total: number; orders: number }[]).map((r) => ({
    date: r.date,
    total: Number(r.total),
    orders: Number(r.orders),
  }));
}

export async function salesReport(from: string, to: string) {
  const db = await getDb();
  const [[{ c: totalOrders, v: totalSales }]] = (await db.query(
    "SELECT COUNT(*) c, COALESCE(SUM(total),0) v FROM orders WHERE DATE(created_at) BETWEEN ? AND ?",
    [from, to]
  )) as [{ c: number; v: number }[], unknown];

  const [statusRows] = await db.query(
    "SELECT status, COUNT(*) c FROM orders WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY status",
    [from, to]
  );
  const byStatus: Record<OrderStatus, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0, completed: 0, cancelled: 0 };
  for (const row of statusRows as { status: OrderStatus; c: number }[]) {
    byStatus[row.status] = row.c;
  }

  return { totalOrders, totalSales, byStatus };
}

export type OrderWithProductSummary = Order & { productSummary: string };

export async function listOrdersWithProductSummary(
  limit = 10,
  from?: string,
  to?: string
): Promise<OrderWithProductSummary[]> {
  const db = await getDb();
  const rangeSql = from && to ? "WHERE DATE(created_at) BETWEEN ? AND ?" : "";
  const params: (string | number)[] = from && to ? [from, to, limit] : [limit];
  const [rows] = await db.query(`SELECT * FROM orders ${rangeSql} ORDER BY created_at DESC LIMIT ?`, params);
  const orders = rows as Order[];
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
