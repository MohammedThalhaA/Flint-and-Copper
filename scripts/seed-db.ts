import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedDatabase() {
  console.log("Connecting to database for seeding...");
  const client = await pool.connect();
  try {
    console.log("Clearing existing data...");
    await client.query(`DELETE FROM bookings`);
    await client.query(`DELETE FROM services`);
    await client.query(`DELETE FROM business_hours`);

    console.log("Inserting business hours...");
    const businessHours = [
      { day: 0, open: null, close: null, closed: true }, // Sunday
      { day: 1, open: '10:00', close: '20:00', closed: false }, // Monday
      { day: 2, open: '10:00', close: '20:00', closed: false }, // Tuesday
      { day: 3, open: '10:00', close: '20:00', closed: false }, // Wednesday
      { day: 4, open: '10:00', close: '20:00', closed: false }, // Thursday
      { day: 5, open: '10:00', close: '21:00', closed: false }, // Friday
      { day: 6, open: '09:00', close: '18:00', closed: false }, // Saturday
    ];

    for (const bh of businessHours) {
      await client.query(
        `INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES ($1, $2, $3, $4)`,
        [bh.day, bh.open, bh.close, bh.closed]
      );
    }

    console.log("Inserting services...");
    const services = [
      {
        name: "The Flint Signature Cut",
        category: "Hair",
        description: "A precision cut tailored to your bone structure, followed by an intensive scalp treatment and hot towel finish.",
        duration: 60,
        price: 9600.00
      },
      {
        name: "Copper Glow Balayage",
        category: "Hair",
        description: "Hand-painted highlights for a dimensional, sun-kissed copper finish. Includes a deep conditioning gloss.",
        duration: 180,
        price: 20000.00
      },
      {
        name: "Oxidized Clay Facial",
        category: "Skin/Facial",
        description: "A purifying and restorative facial using mineral-rich clays to draw out impurities and leave skin glowing.",
        duration: 75,
        price: 13200.00
      },
      {
        name: "Bespoke Grooming Experience",
        category: "Grooming",
        description: "A tailored clipper or shear cut, straight razor beard shaping, and a revitalizing facial scrub.",
        duration: 60,
        price: 7600.00
      },
      {
        name: "Deep Tissue Mineral Massage",
        category: "Spa & Body",
        description: "Targeted deep tissue work incorporating warm basalt stones to melt tension and improve circulation.",
        duration: 90,
        price: 14400.00
      }
    ];

    for (const service of services) {
      await client.query(
        `INSERT INTO services (name, category, description, duration_minutes, price) VALUES ($1, $2, $3, $4, $5)`,
        [service.name, service.category, service.description, service.duration, service.price]
      );
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
  }
}

seedDatabase().then(() => process.exit(0));
