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
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
};

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

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
