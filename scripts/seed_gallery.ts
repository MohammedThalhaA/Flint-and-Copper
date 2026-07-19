import { query } from '../src/lib/db';

const sampleImages = [
  "https://images.unsplash.com/photo-1595079676339-1534801ad6cb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516975080661-46bfa2a281c7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop"
];

async function seed() {
  try {
    for (const url of sampleImages) {
      await query(
        `INSERT INTO gallery_images (image_url, source_type) VALUES ($1, 'instagram')`,
        [url]
      );
    }
    console.log("Successfully seeded 5 gallery images!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
