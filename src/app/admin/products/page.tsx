import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { listProducts, listCategories, listBrands } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProducts();
  const categories = await listCategories();
  const brands = await listBrands();
  return <ProductsAdmin initialProducts={products} categories={categories} brands={brands} />;
}
