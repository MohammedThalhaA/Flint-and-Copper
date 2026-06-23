import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    console.log("Running Admin Portal migrations...");
    
    // 1. Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed initial admin if none exists
    const adminCount = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCount.rows[0].count) === 0) {
      const email = 'admin@flintandcopper.com';
      const password = 'password123'; // Default password
      const hash = await bcrypt.hash(password, 10);
      await client.query(`INSERT INTO admins (email, password_hash) VALUES ($1, $2)`, [email, hash]);
      console.log(`✅ Seeded default admin (email: ${email}, password: ${password})`);
      console.log(`⚠️ Please change this password immediately in production!`);
    }

    // 2. Offers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount_text VARCHAR(100),
        image_data TEXT,
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Gallery Images Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        image_data TEXT,
        image_url TEXT,
        source_type VARCHAR(20) CHECK (source_type IN ('upload', 'instagram')),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Alter Services (Add display_order)
    try {
      await client.query(`ALTER TABLE services ADD COLUMN display_order INTEGER DEFAULT 0`);
      console.log("✅ Added display_order to services");
    } catch (e: any) {
      if (e.code === '42701') console.log("ℹ️ display_order already exists on services");
      else throw e;
    }

    // 5. Alter Reviews (Add is_featured and source)
    try {
      await client.query(`ALTER TABLE reviews ADD COLUMN is_featured BOOLEAN DEFAULT false`);
      await client.query(`ALTER TABLE reviews ADD COLUMN source VARCHAR(100) DEFAULT 'Website'`);
      console.log("✅ Added is_featured and source to reviews");
    } catch (e: any) {
      if (e.code === '42701') console.log("ℹ️ Columns already exist on reviews");
      else throw e;
    }

    // Update the seeded reviews to be featured so they show up on the public site
    await client.query(`UPDATE reviews SET is_featured = true WHERE is_approved = true`);

    console.log("✅ All admin migrations completed successfully!");
  } catch (error) {
    console.error("❌ Error running admin migrations:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
