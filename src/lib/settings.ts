import { getDb } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT setting_value FROM site_settings WHERE setting_key = ?", [key]);
  const row = (rows as { setting_value: string }[])[0];
  return row ? row.setting_value : null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  if (keys.length === 0) return {};
  const db = await getDb();
  const [rows] = await db.query(
    `SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (${keys.map(() => "?").join(",")})`,
    keys
  );
  const result: Record<string, string | null> = {};
  for (const key of keys) result[key] = null;
  for (const row of rows as { setting_key: string; setting_value: string }[]) {
    result[row.setting_key] = row.setting_value;
  }
  return result;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    [key, value]
  );
}
