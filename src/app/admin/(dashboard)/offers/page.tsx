import { query } from "@/lib/db";
import { OffersClient } from "./OffersClient";

export const metadata = {
  title: "Offers | Admin Portal | Flint & Copper",
};

export default async function AdminOffersPage() {
  const result = await query(`
    SELECT * FROM offers 
    ORDER BY created_at DESC
  `);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Offers & Promotions</h1>
        <p className="text-charcoal/60 font-light">Manage promotional banners displayed on the homepage.</p>
      </div>

      <OffersClient initialOffers={result.rows} />
    </div>
  );
}
