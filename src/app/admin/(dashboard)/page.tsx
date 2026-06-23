import { query } from "@/lib/db";
import { Calendar, Grid, Tag, MessageSquare, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type Booking = {
  id: number;
  customer_name: string;
  service_name: string;
  date: string;
  time_slot: string;
  status: string;
};

export const metadata = {
  title: "Admin Dashboard | Flint & Copper",
};

async function getDashboardData() {
  const [
    bookingsRes,
    pendingRes,
    servicesRes,
    offersRes,
    recentPending,
    upcoming
  ] = await Promise.all([
    query(`SELECT COUNT(*) FROM bookings WHERE date = CURRENT_DATE`),
    query(`SELECT COUNT(*) FROM bookings WHERE status = 'pending'`),
    query(`SELECT COUNT(*) FROM services WHERE is_active = true`),
    query(`SELECT COUNT(*) FROM offers WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE)`),
    query(`
      SELECT b.*, s.name as service_name 
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 5
    `),
    query(`
      SELECT b.*, s.name as service_name 
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'confirmed' AND b.date >= CURRENT_DATE
      ORDER BY b.date ASC, b.time_slot ASC
      LIMIT 5
    `)
  ]);

  return {
    metrics: {
      todayBookings: parseInt(bookingsRes.rows[0].count),
      pendingBookings: parseInt(pendingRes.rows[0].count),
      activeServices: parseInt(servicesRes.rows[0].count),
      activeOffers: parseInt(offersRes.rows[0].count),
    },
    pendingBookings: recentPending.rows,
    upcomingBookings: upcoming.rows
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const { metrics, pendingBookings, upcomingBookings } = data;

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 text-charcoal">Dashboard</h1>
        <p className="text-charcoal/60 font-light">Welcome back to the Flint & Copper admin portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          title="Today's Bookings" 
          value={metrics.todayBookings} 
          icon={<Calendar size={24} />} 
          href="/admin/bookings"
        />
        <MetricCard 
          title="Pending Action" 
          value={metrics.pendingBookings} 
          icon={<Calendar size={24} className="text-copper" />} 
          href="/admin/bookings?status=pending"
          highlight={metrics.pendingBookings > 0}
        />
        <MetricCard 
          title="Active Services" 
          value={metrics.activeServices} 
          icon={<Grid size={24} />} 
          href="/admin/services"
        />
        <MetricCard 
          title="Active Offers" 
          value={metrics.activeOffers} 
          icon={<Tag size={24} />} 
          href="/admin/offers"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Actions */}
        <div className="bg-white border border-dust/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg md:text-xl md:text-2xl text-charcoal flex items-center gap-2">
              <Clock className="text-copper" size={24} /> Action Required
            </h2>
            <Link href="/admin/bookings?status=pending" className="text-xs uppercase tracking-widest text-dust hover:text-copper transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {pendingBookings.length === 0 ? (
            <p className="text-charcoal/50 font-light italic">No pending bookings to review.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingBookings.map((b: Booking) => (
                <div key={b.id} className="p-4 border border-dust/20 hover:border-copper/50 transition-colors bg-copper/5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-charcoal">{b.customer_name}</p>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending</span>
                  </div>
                  <p className="text-sm font-light text-charcoal/80 mb-1">{b.service_name}</p>
                  <p className="text-xs text-charcoal/60">
                    {format(new Date(b.date), "MMM d, yyyy")} at {b.time_slot.substring(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white border border-dust/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg md:text-xl md:text-2xl text-charcoal flex items-center gap-2">
              <Calendar className="text-charcoal" size={24} /> Upcoming Appointments
            </h2>
            <Link href="/admin/bookings" className="text-xs uppercase tracking-widest text-dust hover:text-charcoal transition-colors flex items-center gap-1">
              View Calendar <ArrowRight size={14} />
            </Link>
          </div>
          
          {upcomingBookings.length === 0 ? (
            <p className="text-charcoal/50 font-light italic">No upcoming confirmed appointments.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {upcomingBookings.map((b: Booking) => (
                <div key={b.id} className="p-4 border border-dust/20 hover:border-charcoal/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-charcoal">{b.customer_name}</p>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded">Confirmed</span>
                  </div>
                  <p className="text-sm font-light text-charcoal/80 mb-1">{b.service_name}</p>
                  <p className="text-xs text-charcoal/60">
                    {format(new Date(b.date), "MMM d, yyyy")} at {b.time_slot.substring(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, href, highlight }: { title: string, value: number, icon: React.ReactNode, href: string, highlight?: boolean }) {
  return (
    <Link href={href} className={`block p-6 bg-white shadow-sm border transition-all hover:shadow-md ${highlight ? 'border-copper bg-copper/5' : 'border-dust/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="uppercase tracking-widest text-xs font-medium text-charcoal/70">{title}</h3>
        <div className="text-charcoal/40">{icon}</div>
      </div>
      <p className={`font-serif text-3xl md:text-4xl font-light ${highlight ? 'text-copper' : 'text-charcoal'}`}>
        {value}
      </p>
    </Link>
  );
}
