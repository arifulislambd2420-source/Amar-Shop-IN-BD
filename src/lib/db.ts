import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "shop.db");

// Singleton across hot-reloads in dev
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.__db) return globalForDb.__db;

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      sale_price REAL,
      image TEXT DEFAULT '',
      category_id INTEGER REFERENCES categories(id),
      stock INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_token TEXT UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      district TEXT NOT NULL,
      thana TEXT NOT NULL,
      postcode TEXT,
      address TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cod',
      status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
    CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(order_token);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  `);

  seedIfEmpty(db);

  globalForDb.__db = db;
  return db;
}

function seedIfEmpty(db: Database.Database) {
  const productCount = (db.prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number }).c;
  if (productCount === 0) {
    const insertCat = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
    const cats = [
      ["মধু (Honey)", "honey"],
      ["সরিষার তেল (Mustard Oil)", "mustard-oil"],
      ["ঘি (Ghee)", "ghee"],
      ["খেজুর (Dates)", "dates"],
    ];
    const catIds: Record<string, number> = {};
    for (const [name, slug] of cats) {
      const info = insertCat.run(name, slug);
      catIds[slug] = info.lastInsertRowid as number;
    }

    const insertProd = db.prepare(`
      INSERT INTO products (name, slug, description, price, sale_price, image, category_id, stock)
      VALUES (@name, @slug, @description, @price, @sale_price, @image, @category_id, @stock)
    `);

    const products = [
      { name: "সুন্দরবন মধু ১kg", slug: "sundarban-honey-1kg", description: "খাঁটি সুন্দরবন মধু, ১ কেজি বোতল।", price: 2500, sale_price: null, image: "/products/honey1.svg", category_id: catIds["honey"], stock: 20 },
      { name: "লিচু ফুলের মধু ৫০০g", slug: "lychee-honey-500g", description: "খাঁটি লিচু ফুলের মধু।", price: 600, sale_price: 550, image: "/products/honey2.svg", category_id: catIds["honey"], stock: 35 },
      { name: "দেশি সরিষার তেল ১ লিটার", slug: "deshi-mustard-oil-1l", description: "কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল।", price: 340, sale_price: null, image: "/products/mustard1.svg", category_id: catIds["mustard-oil"], stock: 50 },
      { name: "দেশি সরিষার তেল ৫ লিটার", slug: "deshi-mustard-oil-5l", description: "কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল, বড় বোতল।", price: 1700, sale_price: null, image: "/products/mustard2.svg", category_id: catIds["mustard-oil"], stock: 15 },
      { name: "খাঁটি গাওয়া ঘি ৫০০g", slug: "pure-ghee-500g", description: "খাঁটি দুধের গাওয়া ঘি।", price: 900, sale_price: null, image: "/products/ghee1.svg", category_id: catIds["ghee"], stock: 25 },
      { name: "সুক্কারি মরিয়ম খেজুর ১kg", slug: "sukkari-dates-1kg", description: "প্রিমিয়াম মানের সুক্কারি খেজুর।", price: 1500, sale_price: 1400, image: "/products/dates1.svg", category_id: catIds["dates"], stock: 18 },
    ];
    for (const p of products) insertProd.run(p);
  }

  const adminCount = (db.prepare("SELECT COUNT(*) AS c FROM admin_users").get() as { c: number }).c;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run("admin", hash);
  }
}
