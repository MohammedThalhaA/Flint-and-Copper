import { query } from "@/lib/db";
import { GalleryClient } from "./GalleryClient";

export const metadata = {
  title: "Gallery | Admin Portal | Flint & Copper",
};

export default async function AdminGalleryPage() {
  const result = await query(`
    SELECT * FROM gallery_images 
    ORDER BY created_at ASC
  `);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Homepage Gallery</h1>
        <p className="text-charcoal/60 font-light">Manage the 5 rolling images shown on the public homepage strip.</p>
      </div>

      <GalleryClient initialImages={result.rows} />
    </div>
  );
}
