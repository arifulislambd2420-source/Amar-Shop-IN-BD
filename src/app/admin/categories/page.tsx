import CategoriesAdmin from "@/components/admin/CategoriesAdmin";
import { listCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  return <CategoriesAdmin initialCategories={categories} />;
}
