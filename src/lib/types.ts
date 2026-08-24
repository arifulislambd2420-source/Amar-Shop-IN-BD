export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: number | null;
  brand_id: number | null;
  stock: number;
  is_active: number;
  sku: string | null;
  status: string;
  cost_price: number | null;
  seo_title: string | null;
  meta_description: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProductImage = {
  id: number;
  product_id: number;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type ProductStatus = "draft" | "published" | "hidden" | "outofstock" | "archived";

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "completed" | "cancelled";

export type Order = {
  id: number;
  order_token: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  district: string;
  thana: string;
  postcode: string | null;
  address: string;
  payment_method: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  invoice_no: string | null;
  shipping_fee: number;
  discount: number;
  notes: string;
  consignment_id: string | null;
  tracking_code: string | null;
  courier_status: string | null;
  advance_amount: number;
  payment_status: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  discount: number;
};

export type Brand = {
  id: number;
  name: string;
  logo: string | null;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  label: string;
  price: number;
  stock: number;
};

export type Review = {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string | null;
  approved: number;
  created_at: string;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  cover: string | null;
  category: string | null;
  content: string;
  read_time: number | null;
  published_at: string;
};

export type Banner = {
  id: number;
  image: string;
  link: string | null;
  position: string;
  sort_order: number;
  active: number;
};

export type SiteSetting = {
  id: number;
  setting_key: string;
  setting_value: string;
};

export type FraudApiConfig = {
  id: number;
  type: "free" | "paid";
  api_url: string;
  api_key: string;
  active: number;
};

export type IpBlock = {
  id: number;
  ip: string;
  reason: string | null;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  phone: string;
  created_at: string;
};

export type ContactMessage = {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export type CartItem = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  variantLabel?: string;
  variantId?: number;
};

export type Coupon = {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_spend: number;
  uses: number;
  max_uses: number | null;
  valid_until: string | null;
  is_active: number;
  created_at: string;
};

export type FlashSale = {
  id: number;
  title: string;
  end_time: string;
  is_active: number;
  created_at: string;
  items?: FlashSaleItem[];
};

export type FlashSaleItem = {
  id: number;
  flash_sale_id: number;
  product_id: number;
  flash_price: number;
};
