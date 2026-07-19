import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding mock data for Admin Dashboard...");

    // 1. Get a service ID to use for bookings
    const servicesRes = await client.query('SELECT id FROM services LIMIT 1');
    let serviceId = 1;
    if (servicesRes.rows.length > 0) {
      serviceId = servicesRes.rows[0].id;
    } else {
      // Insert a dummy service if none exists
      const insertRes = await client.query(`
        INSERT INTO services (name, category, description, duration_minutes, price, is_active)
        VALUES ('Test Service', 'Hair', 'A test service', 60, 100, true) RETURNING id
      `);
      serviceId = insertRes.rows[0].id;
    }

    // 2. Insert Bookings
    // 2 Pending bookings for today
    await client.query(`
      INSERT INTO bookings (customer_name, customer_email, customer_phone, service_id, date, time_slot, status)
      VALUES 
      ('Jane Doe', 'jane@example.com', '1234567890', $1, CURRENT_DATE, '10:00:00', 'pending'),
      ('John Smith', 'john@example.com', '0987654321', $1, CURRENT_DATE, '14:30:00', 'pending')
    `, [serviceId]);

    // 1 Confirmed booking for tomorrow
    await client.query(`
      INSERT INTO bookings (customer_name, customer_email, customer_phone, service_id, date, time_slot, status)
      VALUES 
      ('Alice Walker', 'alice@example.com', '5551234567', $1, CURRENT_DATE + INTERVAL '1 day', '11:00:00', 'confirmed')
    `, [serviceId]);

    // 3. Insert Offers
    await client.query(`
      INSERT INTO offers (title, description, discount_text, is_active)
      VALUES 
      ('Summer Glow Package', 'Get ready for summer with our new glow package.', '20% OFF', true),
      ('First Time Customer', 'Special discount for first time customers on any hair service.', '₹2000 OFF', true)
    `);

    console.log("Mock data seeded successfully.");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
