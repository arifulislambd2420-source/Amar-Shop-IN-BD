import { getDb } from "./db";

export type NewContactMessage = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

export async function createContactMessage(input: NewContactMessage): Promise<number> {
  const db = await getDb();
  const [result] = await db.execute(
    `INSERT INTO contact_messages (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)`,
    [input.name, input.phone, input.email, input.subject, input.message]
  );
  return (result as import("mysql2/promise").ResultSetHeader).insertId;
}
