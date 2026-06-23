import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setupDatabase() {
  console.log("Connecting to database...");
  const client = await pool.connect();
  try {
    console.log("Dropping existing tables if they exist...");
    await client.query(`DROP TABLE IF EXISTS bookings CASCADE`);
    await client.query(`DROP TABLE IF EXISTS services CASCADE`);
    await client.query(`DROP TABLE IF EXISTS business_hours CASCADE`);

    console.log("Creating tables...");
    
    await client.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE business_hours (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL UNIQUE, -- 0 (Sunday) to 6 (Saturday)
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT false
      )
    `);

    await client.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time_slot TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    client.release();
  }
}

setupDatabase().then(() => process.exit(0));
