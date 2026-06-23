import { query } from "@/lib/db";
import { ReviewsClient } from "./ReviewsClient";

export const metadata = {
  title: "Reviews | Admin Portal | Flint & Copper",
};

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const result = await query(`
    SELECT * FROM reviews 
    ORDER BY created_at DESC
  `);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Reviews & Testimonials</h1>
        <p className="text-charcoal/60 font-light">Approve submitted reviews or manually add them from other platforms.</p>
      </div>

      <ReviewsClient initialReviews={result.rows} />
    </div>
  );
}
