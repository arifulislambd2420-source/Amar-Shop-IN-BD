# আমারশপ — Custom E-commerce (No WordPress)

একটা সম্পূর্ণ custom-coded e-commerce website — Next.js + MySQL দিয়ে বানানো, কোনো WordPress/WooCommerce dependency ছাড়াই। এটা তোমার বর্তমান WordPress সাইট (amarshopinbd) থেকে সম্পূর্ণ আলাদা, স্বতন্ত্র একটা experiment/প্রজেক্ট।

## এতে যা যা আছে

- **Storefront**: হোমপেজ, শপ/ক্যাটাগরি ফিল্টার, প্রোডাক্ট ডিটেইল পেজ
- **Cart**: client-side, browser এ persist হয় (localStorage, cart হারায় না page reload এ)
- **Checkout**: Bangladesh-style ফিল্ড (নাম, ফোন, ইমেইল, জেলা ৬৪টা, থানা, পোস্ট কোড, বিস্তারিত ঠিকানা) — Cash on Delivery
- **Order tracking**: Order ID এবং/অথবা Phone দিয়ে — **phone সবসময় আবশ্যক** (আগের WordPress সাইটে যে IDOR bug ধরা পড়েছিল, সেটা এখানে শুরু থেকেই এড়ানো হয়েছে — শুধু Order ID দিয়ে অন্যের অর্ডার দেখা যায় না)
- **Order confirmation page**: একটা random secure token দিয়ে (sequential ID দিয়ে না — তাই কেউ ID অনুমান করে অন্যের order details দেখতে পারবে না)
- **Admin panel** (`/admin`): password-protected —
  - Dashboard: live stats (Total Orders, Today's Orders, Products, Stock, Stock Value, Sales, Delivered Orders ইত্যাদি)
  - Products: Add / Edit / Delete
  - Orders: list + status change (pending → processing → completed/cancelled)

## চালানো (প্রথমবার)

প্রথমে একটা MySQL database লাগবে (লোকালি চালাতে চাইলে XAMPP/MySQL Workbench/Docker দিয়ে একটা বানাও, অথবা যেকোনো hosted MySQL)। তারপর `.env.local.example` ফাইলটা `.env.local` নামে কপি করে DB credentials বসাও।

```bash
npm install
npm run dev
```

তারপর browser এ `http://localhost:3000` খোলো। প্রথমবার চালানোর সময় app নিজে থেকেই দরকারি টেবিলগুলো (`CREATE TABLE IF NOT EXISTS`) বানিয়ে নেবে এবং কিছু sample product দিয়ে seed করে দেবে — শুধু নিশ্চিত করো database (schema) আগে থেকে তৈরি আছে (খালি থাকলেও চলবে)।

### Admin panel

URL: `http://localhost:3000/admin`

Default login:
- Username: `admin`
- Password: `admin123`

**⚠️ Production এ deploy করার আগে অবশ্যই এই password পরিবর্তন করো** (MySQL এ গিয়ে `admin_users` টেবিলে নতুন bcrypt hash বসাও — phpMyAdmin/hPanel থেকে বা কোনো MySQL client দিয়ে, অথবা আমাকে বলো একটা "change password" ফিচার যোগ করে দিতে)।

## Production build

```bash
npm run build
npm run start
```

## Deploy — Hostinger "Deploy Web App"

এই app টা এখন MySQL ব্যবহার করে (SQLite/native module নেই), তাই Hostinger এর "Deploy Web App" ফিচারে (persistent disk নেই, native module compile গ্যারান্টি নেই এমন environment) নির্ভরযোগ্যভাবে চলবে।

ধাপে ধাপে (hPanel এ):

1. **MySQL database বানাও**: hPanel → Databases → MySQL Databases → একটা নতুন database + user বানাও (host সাধারণত `localhost`, port `3306`, hPanel পেজেই দেখাবে)। Database name, username, password, host নোট করে রাখো।
2. **Web App বানাও**: hPanel → Websites/Deploy Web App (Node.js) → এই GitHub repo কানেক্ট করো।
   - Node.js version: **22.x**
   - Build command: `npm run build`
   - Start command: `npm run start`
3. **Environment variables** সেট করো (Web App এর Settings/Environment Variables সেকশনে):
   - `DB_HOST` — ধাপ ১ থেকে
   - `DB_USER` — ধাপ ১ থেকে
   - `DB_PASSWORD` — ধাপ ১ থেকে
   - `DB_NAME` — ধাপ ১ থেকে
   - `DB_PORT` — সাধারণত `3306`
   - `ADMIN_SESSION_SECRET` — একটা লম্বা random string
4. **Deploy** করো — প্রথম রিকোয়েস্টেই app নিজে থেকে দরকারি টেবিল বানিয়ে sample data দিয়ে seed করে নেবে।
5. প্রতি redeploy এ কোনো ডেটা হারাবে না কারণ সব কিছু এখন MySQL এ (disk এ না) সংরক্ষিত থাকে।

অন্য জায়গায় (Railway/Render/VPS/local) চালাতে চাইলেও একই env vars দিয়ে সরাসরি `npm run build && npm run start` কাজ করবে, শুধু একটা MySQL database দরকার হবে।

## গুরুত্বপূর্ণ পরিবেশ ভেরিয়েবল

`.env.local` ফাইলে (`.env.local.example` থেকে কপি করো, নিজে বানাও, git এ commit হয় না):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
ADMIN_SESSION_SECRET=একটা-লম্বা-random-string-বসাও-production-এ
```

## এখনো যা করা হয়নি (Known limitations)

- **Payment gateway**: শুধু Cash on Delivery আছে — bKash/Nagad/Card payment integration নেই
- **Image upload**: Admin panel থেকে সরাসরি ছবি upload করা যায় না, শুধু path/URL বসানো যায় (আপাতত `public/products/` ফোল্ডারে ম্যানুয়ালি ছবি রেখে path দিতে হবে)
- **Email/SMS notification**: অর্ডার হলে customer কে কোনো email/SMS যায় না
- **Multiple admin users / roles**: শুধু একটা admin user আছে
- **Product variations** (size/color): সাপোর্ট নেই, প্রতিটা variation কে আলাদা product হিসেবে যোগ করতে হবে

এই ফিচারগুলো লাগলে আমাকে জানিও, ধাপে ধাপে যোগ করে দেব।

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · MySQL (mysql2) · Zustand (cart state) · jose (admin session JWT) · bcryptjs (password hashing) · Zod (validation)
