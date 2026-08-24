import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// Singleton pool across hot-reloads in dev
const globalForDb = globalThis as unknown as {
  __pool?: mysql.Pool;
  __dbReady?: Promise<void>;
};

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shop",
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

async function initSchema(pool: mysql.Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo VARCHAR(500)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      sale_price DECIMAL(10,2),
      image VARCHAR(500) DEFAULT '',
      category_id INT,
      stock INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_token VARCHAR(64) UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NOT NULL,
      email VARCHAR(255),
      district VARCHAR(255) NOT NULL,
      thana VARCHAR(255) NOT NULL,
      postcode VARCHAR(32),
      address TEXT NOT NULL,
      payment_method VARCHAR(32) NOT NULL DEFAULT 'cod',
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      subtotal DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT,
      product_name VARCHAR(255) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      line_total DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      label VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      alt VARCHAR(255),
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // rating 1-5; CHECK constraints are enforced from MySQL 8.0.16+
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      approved TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      cover VARCHAR(500),
      category VARCHAR(255),
      content TEXT NOT NULL,
      read_time INT,
      published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image VARCHAR(500) NOT NULL,
      link VARCHAR(500),
      position VARCHAR(32) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      setting_value TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fraud_api_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(16) NOT NULL,
      api_url VARCHAR(500) NOT NULL,
      api_key VARCHAR(500) NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ip_blocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(64) NOT NULL UNIQUE,
      reason TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
      discount_value DECIMAL(10,2) NOT NULL,
      min_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
      uses INT NOT NULL DEFAULT 0,
      max_uses INT,
      valid_until DATETIME,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS flash_sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      end_time DATETIME NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS flash_sale_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      flash_sale_id INT NOT NULL,
      product_id INT NOT NULL,
      flash_price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_contents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(100) NOT NULL,
      section_key VARCHAR(100) NOT NULL,
      element_key VARCHAR(100) NOT NULL,
      content_type VARCHAR(50) NOT NULL DEFAULT 'text',
      content_value TEXT,
      settings_json JSON,
      is_published TINYINT(1) NOT NULL DEFAULT 0,
      version INT NOT NULL DEFAULT 1,
      updated_by VARCHAR(255),
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY idx_page_section_element (page_key, section_key, element_key)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_revisions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content_id INT NOT NULL,
      content_value TEXT,
      settings_json JSON,
      version INT NOT NULL,
      changed_by VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (content_id) REFERENCES page_contents(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_library (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100),
      file_size INT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Defensive ALTERs for columns added after initial release (MySQL lacks ADD COLUMN IF NOT EXISTS pre-8.0.29)
  await ensureColumn(pool, "admin_users", "role", "ALTER TABLE admin_users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'super_admin'");
  await ensureColumn(pool, "categories", "icon", "ALTER TABLE categories ADD COLUMN icon VARCHAR(255)");
  await ensureColumn(pool, "products", "brand_id", "ALTER TABLE products ADD COLUMN brand_id INT REFERENCES brands(id)");
  await ensureColumn(pool, "orders", "invoice_no", "ALTER TABLE orders ADD COLUMN invoice_no VARCHAR(50) UNIQUE");
  await ensureColumn(pool, "orders", "shipping_fee", "ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0");
  await ensureColumn(pool, "orders", "discount", "ALTER TABLE orders ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0");
  await ensureColumn(pool, "orders", "consignment_id", "ALTER TABLE orders ADD COLUMN consignment_id VARCHAR(100)");
  await ensureColumn(pool, "orders", "tracking_code", "ALTER TABLE orders ADD COLUMN tracking_code VARCHAR(100)");
  await ensureColumn(pool, "orders", "courier_status", "ALTER TABLE orders ADD COLUMN courier_status VARCHAR(50)");
  await ensureColumn(pool, "order_items", "discount", "ALTER TABLE order_items ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0");

  // Phase 1 Payment columns
  await ensureColumn(pool, "orders", "advance_amount", "ALTER TABLE orders ADD COLUMN advance_amount DECIMAL(10,2) NOT NULL DEFAULT 0");
  await ensureColumn(pool, "orders", "payment_status", "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid'");

  // Phase 1 PIM columns on products
  await ensureColumn(pool, "products", "sku", "ALTER TABLE products ADD COLUMN sku VARCHAR(64)");
  await ensureColumn(pool, "products", "status", "ALTER TABLE products ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published'");
  await ensureColumn(pool, "products", "cost_price", "ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2)");
  await ensureColumn(pool, "products", "seo_title", "ALTER TABLE products ADD COLUMN seo_title VARCHAR(255)");
  await ensureColumn(pool, "products", "meta_description", "ALTER TABLE products ADD COLUMN meta_description VARCHAR(500)");
  await ensureColumn(pool, "products", "tags", "ALTER TABLE products ADD COLUMN tags VARCHAR(500)");
  await ensureColumn(pool, "products", "updated_at", "ALTER TABLE products ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await ensureColumn(pool, "products", "deleted_at", "ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL");

  await ensureIndex(pool, "orders", "idx_orders_phone", "CREATE INDEX idx_orders_phone ON orders(phone)");
  await ensureIndex(pool, "orders", "idx_orders_token", "CREATE INDEX idx_orders_token ON orders(order_token)");
  await ensureIndex(pool, "products", "idx_products_category", "CREATE INDEX idx_products_category ON products(category_id)");
  await ensureIndex(pool, "products", "idx_products_brand", "CREATE INDEX idx_products_brand ON products(brand_id)");
  await ensureIndex(pool, "product_variants", "idx_variants_product", "CREATE INDEX idx_variants_product ON product_variants(product_id)");
  // UNIQUE on sku: MySQL allows multiple NULLs, so blank SKUs don't collide
  await ensureIndex(pool, "products", "idx_products_sku", "CREATE UNIQUE INDEX idx_products_sku ON products(sku)");
  await ensureIndex(pool, "products", "idx_products_status", "CREATE INDEX idx_products_status ON products(status)");
  await ensureIndex(pool, "products", "idx_products_updated", "CREATE INDEX idx_products_updated ON products(updated_at)");
  await ensureIndex(pool, "products", "idx_products_deleted", "CREATE INDEX idx_products_deleted ON products(deleted_at)");
  await ensureIndex(pool, "product_images", "idx_product_images_product", "CREATE INDEX idx_product_images_product ON product_images(product_id)");
  await ensureIndex(pool, "reviews", "idx_reviews_product", "CREATE INDEX idx_reviews_product ON reviews(product_id)");
  await ensureIndex(pool, "reviews", "idx_reviews_approved", "CREATE INDEX idx_reviews_approved ON reviews(approved)");

  await seedIfEmpty(pool);
}

// MySQL has no "ADD COLUMN IF NOT EXISTS" (< 8.0.29 style compatibility), so check first.
async function ensureColumn(pool: mysql.Pool, table: string, column: string, alterSql: string) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  const count = (rows as { c: number }[])[0].c;
  if (count === 0) {
    await pool.query(alterSql);
  }
}

// MySQL has no "CREATE INDEX IF NOT EXISTS" (< 8.0.29 style compatibility), so check first.
async function ensureIndex(pool: mysql.Pool, table: string, indexName: string, createSql: string) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS c FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, indexName]
  );
  const count = (rows as { c: number }[])[0].c;
  if (count === 0) {
    await pool.query(createSql);
  }
}

async function seedIfEmpty(pool: mysql.Pool) {
  const [brandRows] = await pool.query("SELECT COUNT(*) AS c FROM brands");
  const brandCount = (brandRows as { c: number }[])[0].c;
  const brandIds: Record<string, number> = {};
  if (brandCount === 0) {
    const brands: [string, string | null][] = [
      ["Sundarban", null],
      ["Home Made", null],
      ["Organic BD", null],
      ["Deshi", null],
    ];
    for (const [name, logo] of brands) {
      const [result] = await pool.execute("INSERT INTO brands (name, logo) VALUES (?, ?)", [name, logo]);
      brandIds[name] = (result as mysql.ResultSetHeader).insertId;
    }
  } else {
    const [rows] = await pool.query("SELECT id, name FROM brands");
    for (const row of rows as { id: number; name: string }[]) {
      brandIds[row.name] = row.id;
    }
  }

  const [productRows] = await pool.query("SELECT COUNT(*) AS c FROM products");
  const productCount = (productRows as { c: number }[])[0].c;

  if (productCount === 0) {
    const cats: [string, string][] = [
      ["মধু (Honey)", "honey"],
      ["সরিষার তেল (Mustard Oil)", "mustard-oil"],
      ["ঘি (Ghee)", "ghee"],
      ["খেজুর (Dates)", "dates"],
    ];
    const catIds: Record<string, number> = {};
    for (const [name, slug] of cats) {
      const [result] = await pool.execute("INSERT INTO categories (name, slug) VALUES (?, ?)", [name, slug]);
      catIds[slug] = (result as mysql.ResultSetHeader).insertId;
    }

    const products = [
      { name: "সুন্দরবন মধু ১kg", slug: "sundarban-honey-1kg", description: "খাঁটি সুন্দরবন মধু, ১ কেজি বোতল।", price: 2500, sale_price: null, image: "/products/honey1.svg", category_id: catIds["honey"], stock: 20, brand_id: brandIds["Sundarban"] },
      { name: "লিচু ফুলের মধু ৫০০g", slug: "lychee-honey-500g", description: "খাঁটি লিচু ফুলের মধু।", price: 600, sale_price: 550, image: "/products/honey2.svg", category_id: catIds["honey"], stock: 35, brand_id: brandIds["Sundarban"] },
      { name: "দেশি সরিষার তেল ১ লিটার", slug: "deshi-mustard-oil-1l", description: "কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল।", price: 340, sale_price: null, image: "/products/mustard1.svg", category_id: catIds["mustard-oil"], stock: 50, brand_id: brandIds["Deshi"] },
      { name: "দেশি সরিষার তেল ৫ লিটার", slug: "deshi-mustard-oil-5l", description: "কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল, বড় বোতল।", price: 1700, sale_price: null, image: "/products/mustard2.svg", category_id: catIds["mustard-oil"], stock: 15, brand_id: brandIds["Deshi"] },
      { name: "খাঁটি গাওয়া ঘি ৫০০g", slug: "pure-ghee-500g", description: "খাঁটি দুধের গাওয়া ঘি।", price: 900, sale_price: null, image: "/products/ghee1.svg", category_id: catIds["ghee"], stock: 25, brand_id: brandIds["Home Made"] },
      { name: "সুক্কারি মরিয়ম খেজুর ১kg", slug: "sukkari-dates-1kg", description: "প্রিমিয়াম মানের সুক্কারি খেজুর।", price: 1500, sale_price: 1400, image: "/products/dates1.svg", category_id: catIds["dates"], stock: 18, brand_id: brandIds["Organic BD"] },
    ];

    const productIds: Record<string, number> = {};
    for (const p of products) {
      const [result] = await pool.execute(
        `INSERT INTO products (name, slug, description, price, sale_price, image, category_id, stock, brand_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.slug, p.description, p.price, p.sale_price, p.image, p.category_id, p.stock, p.brand_id]
      );
      productIds[p.slug] = (result as mysql.ResultSetHeader).insertId;
    }

    const [variantCountRows] = await pool.query("SELECT COUNT(*) AS c FROM product_variants");
    const variantCount = (variantCountRows as { c: number }[])[0].c;
    if (variantCount === 0) {
      const variants = [
        { product_slug: "sundarban-honey-1kg", label: "৫০০g", price: 1300, stock: 20 },
        { product_slug: "sundarban-honey-1kg", label: "১kg", price: 2500, stock: 20 },
        { product_slug: "pure-ghee-500g", label: "৫০০g", price: 900, stock: 25 },
        { product_slug: "pure-ghee-500g", label: "১kg", price: 1750, stock: 12 },
      ];
      for (const v of variants) {
        await pool.execute(
          "INSERT INTO product_variants (product_id, label, price, stock) VALUES (?, ?, ?, ?)",
          [productIds[v.product_slug], v.label, v.price, v.stock]
        );
      }
    }
  }

  const [adminRows] = await pool.query("SELECT COUNT(*) AS c FROM admin_users");
  const adminCount = (adminRows as { c: number }[])[0].c;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    await pool.execute("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", ["admin", hash]);
  }
}

export async function getDb(): Promise<mysql.Pool> {
  if (!globalForDb.__pool) {
    globalForDb.__pool = createPool();
  }
  if (!globalForDb.__dbReady) {
    globalForDb.__dbReady = initSchema(globalForDb.__pool);
  }
  await globalForDb.__dbReady;
  return globalForDb.__pool;
}
