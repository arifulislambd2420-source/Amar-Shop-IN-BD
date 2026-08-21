import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { listProducts, listCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProducts();
  const categories = await listCategories();
  return <ProductsAdmin initialProducts={products} categories={categories} />;
}
