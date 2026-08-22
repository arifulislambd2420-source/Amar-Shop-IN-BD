import { getDb } from "./db";
import type { FraudApiConfig } from "./types";

export async function listFraudConfigs(): Promise<FraudApiConfig[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM fraud_api_configs ORDER BY type");
  return rows as FraudApiConfig[];
}

export async function upsertFraudConfig(input: {
  type: "free" | "paid";
  api_url: string;
  api_key: string;
  active: number;
}): Promise<void> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT id FROM fraud_api_configs WHERE type = ?", [input.type]);
  const existing = (rows as { id: number }[])[0];
  if (existing) {
    await db.execute("UPDATE fraud_api_configs SET api_url = ?, api_key = ?, active = ? WHERE id = ?", [
      input.api_url,
      input.api_key,
      input.active,
      existing.id,
    ]);
  } else {
    await db.execute("INSERT INTO fraud_api_configs (type, api_url, api_key, active) VALUES (?, ?, ?, ?)", [
      input.type,
      input.api_url,
      input.api_key,
      input.active,
    ]);
  }
}
