import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { listProductsAdmin, listCategories, listBrands } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { rows, total } = await listProductsAdmin({ page: 1, pageSize: 20 });
  const categories = await listCategories();
  const brands = await listBrands();
  return (
    <ProductsAdmin
      initialProducts={rows}
      initialTotal={total}
      categories={categories}
      brands={brands}
    />
  );
}
