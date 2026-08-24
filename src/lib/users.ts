import { getDb } from "./db";
import type { User } from "./types";

export async function listUsers(limit = 50): Promise<User[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT id, name, phone, created_at FROM users ORDER BY created_at DESC LIMIT ?", [
    limit,
  ]);
  return rows as User[];
}

export async function countUsers(): Promise<number> {
  const db = await getDb();
  const [[{ c }]] = (await db.query("SELECT COUNT(*) c FROM users")) as [{ c: number }[], unknown];
  return c;
}

export type RecentCustomer = {
  id: number;
  name: string;
  phone: string;
  created_at: string;
  status: string;
};

export async function getLatestCustomers(limit = 10): Promise<RecentCustomer[]> {
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, name, phone, created_at, 'active' AS status FROM users ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  const userList = rows as RecentCustomer[];
  if (userList.length >= limit) {
    return userList;
  }

  // Also pull unique customers from orders if users table is small
  const needed = limit - userList.length;
  const [orderRows] = await db.query(
    `SELECT MIN(id) AS id, customer_name AS name, phone, MAX(created_at) AS created_at, 'active' AS status
     FROM orders
     GROUP BY customer_name, phone
     ORDER BY MAX(created_at) DESC
     LIMIT ?`,
    [needed * 2]
  );
  const orderCusts = orderRows as RecentCustomer[];
  const existingPhones = new Set(userList.map((u) => u.phone));
  const combined = [...userList];
  for (const c of orderCusts) {
    if (!existingPhones.has(c.phone)) {
      existingPhones.add(c.phone);
      combined.push(c);
      if (combined.length >= limit) break;
    }
  }
  return combined;
}

