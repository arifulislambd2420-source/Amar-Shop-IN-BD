# আমারশপ — Custom E-commerce (No WordPress)

একটা সম্পূর্ণ custom-coded e-commerce website — Next.js + SQLite দিয়ে বানানো, কোনো WordPress/WooCommerce dependency ছাড়াই। এটা তোমার বর্তমান WordPress সাইট (amarshopinbd) থেকে সম্পূর্ণ আলাদা, স্বতন্ত্র একটা experiment/প্রজেক্ট।

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

```bash
npm install
npm run dev
```

তারপর browser এ `http://localhost:3000` খোলো। প্রথমবার চালানোর সময় `data/shop.db` নামে একটা SQLite file অটোমেটিক তৈরি হবে এবং কিছু sample product দিয়ে seed হয়ে যাবে।

### Admin panel

URL: `http://localhost:3000/admin`

Default login:
- Username: `admin`
- Password: `admin123`

**⚠️ Production এ deploy করার আগে অবশ্যই এই password পরিবর্তন করো** (`data/shop.db` ফাইলে `admin_users` টেবিলে গিয়ে নতুন bcrypt hash বসাও, অথবা আমাকে বলো একটা "change password" ফিচার যোগ করে দিতে)।

## Production build

```bash
npm run build
npm run start
```

## Deploy কোথায় করবে

এটা একটা standard Next.js app (SQLite ফাইল-ভিত্তিক ডাটাবেজ সহ), তাই যেকোনো জায়গায় চালানো যায় যেখানে persistent disk আছে:

- **Railway / Render / a VPS**: সরাসরি `npm run build && npm run start` — SQLite ফাইল disk এ থেকে যাবে
- **Vercel**: কাজ করবে কিন্তু serverless environment এ SQLite ফাইল persist নাও করতে পারে (প্রতি deploy এ reset হতে পারে) — এক্ষেত্রে পরে Postgres/Turso এ migrate করা ভালো হবে
- **নিজের কম্পিউটার/Local সার্ভার**: `npm run build && npm run start`, বা PM2 দিয়ে background এ চালানো

## গুরুত্বপূর্ণ পরিবেশ ভেরিয়েবল

`.env.local` ফাইলে (নিজে বানাও, git এ commit হয় না):

```
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

Next.js 16 (App Router) · TypeScript · Tailwind CSS · SQLite (better-sqlite3) · Zustand (cart state) · jose (admin session JWT) · bcryptjs (password hashing) · Zod (validation)
