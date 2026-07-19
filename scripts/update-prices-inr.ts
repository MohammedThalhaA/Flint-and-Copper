import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migratePrices() {
  const client = await pool.connect();
  try {
    console.log("Migrating prices to INR (multiplying by 80)...");
    await client.query(`UPDATE services SET price = price * 80 WHERE price < 1000`);
    
    // Also update any offers
    await client.query(`UPDATE offers SET discount_text = '₹2000 OFF' WHERE discount_text = '$25 OFF'`);
    
    console.log("Migration completed.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
  }
}

migratePrices().then(() => process.exit(0));
