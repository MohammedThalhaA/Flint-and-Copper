import { query } from "@/lib/db";
import { BookingsClient } from "./BookingsClient";

export const metadata = {
  title: "Bookings | Admin Portal | Flint & Copper",
};

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const [bookingsRes, servicesRes] = await Promise.all([
    query(`
      SELECT b.*, s.name as service_name 
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      ORDER BY b.date DESC, b.time_slot DESC
    `),
    query(`SELECT id, name FROM services`)
  ]);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Bookings</h1>
        <p className="text-charcoal/60 font-light">Manage all customer appointments.</p>
      </div>

      <BookingsClient 
        initialBookings={bookingsRes.rows} 
        services={servicesRes.rows} 
      />
    </div>
  );
}
