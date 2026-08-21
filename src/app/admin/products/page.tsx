import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { listProducts, listCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = listProducts();
  const categories = listCategories();
  return <ProductsAdmin initialProducts={products} categories={categories} />;
}
