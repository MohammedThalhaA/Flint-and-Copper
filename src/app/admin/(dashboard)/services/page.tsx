import { query } from "@/lib/db";
import { ServicesClient } from "./ServicesClient";

export const metadata = {
  title: "Services | Admin Portal | Flint & Copper",
};

export default async function AdminServicesPage() {
  const result = await query(`
    SELECT * FROM services 
    ORDER BY category ASC, display_order ASC, name ASC
  `);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Services</h1>
          <p className="text-charcoal/60 font-light">Manage your salon offerings, pricing, and display order.</p>
        </div>
      </div>

      <ServicesClient initialServices={result.rows} />
    </div>
  );
}
