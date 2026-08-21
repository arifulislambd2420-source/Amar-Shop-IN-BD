export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: number | null;
  stock: number;
  is_active: number;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type Order = {
  id: number;
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
};

export type CartItem = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};
