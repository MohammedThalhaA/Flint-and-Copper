import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For Neon
  },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Creating reviews table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table created successfully!");

    console.log("Seeding initial testimonials...");
    
    // We only insert if the table is empty to avoid duplicating seed data
    const countRes = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(countRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO reviews (author, text, rating, is_approved)
        VALUES 
          ('Elena R.', 'The attention to detail is remarkable. I came in for a simple cut and left feeling completely renewed. The contrast between the minimalist space and the warmth of the staff is perfection.', 5, true),
          ('Marcus T.', 'An absolute oasis in the city. The Oxidized Clay Facial completely transformed my skin. The aesthetic of the salon itself makes you feel like you''ve stepped into a luxury retreat.', 5, true),
          ('Sarah L.', 'I''ve never experienced a deeper level of relaxation than during their Deep Tissue Mineral Massage. The therapists are true masters of their craft.', 5, true)
      `);
      console.log("✅ Seed data inserted successfully!");
    } else {
      console.log("⚠️ Table already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Error setting up reviews table:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
