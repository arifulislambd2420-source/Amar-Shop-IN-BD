import ReviewsAdmin from "@/components/admin/ReviewsAdmin";
import { listReviewsWithProduct } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await listReviewsWithProduct();
  return <ReviewsAdmin initialReviews={reviews} />;
}
