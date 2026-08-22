import { getDb } from "./db";

export type ReviewWithProduct = {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  approved: number;
  created_at: string;
};

export async function listReviewsWithProduct(): Promise<ReviewWithProduct[]> {
  const db = await getDb();
  const [rows] = await db.query(
    `SELECT r.id, r.product_id, p.name AS product_name, r.customer_name, r.rating,
            r.comment, r.approved, r.created_at
     FROM reviews r
     JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC`
  );
  return rows as ReviewWithProduct[];
}

export async function setReviewApproved(id: number, approved: boolean): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE reviews SET approved = ? WHERE id = ?", [approved ? 1 : 0, id]);
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM reviews WHERE id = ?", [id]);
}
