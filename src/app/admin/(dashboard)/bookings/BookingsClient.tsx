"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast, useConfirm } from "@/components/NotificationProvider";

type Booking = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  date: string;
  time_slot: string;
  status: string;
};

export function BookingsClient({ initialBookings, services }: { initialBookings: Booking[], services: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filtered = initialBookings.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        router.refresh();
        if (data.emailSent === false) {
          toast(`Status updated, but email failed: ${data.emailError || "Unknown error"}`, "error");
        } else if (newStatus === 'confirmed' || newStatus === 'cancelled') {
          toast(`Booking ${newStatus} and email sent!`, "success");
        } else {
          toast("Status updated", "success");
        }
      } else {
        toast("Failed to update status", "error");
      }
    } catch (e) {
      toast("Error updating status", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-dust/30 bg-white px-4 py-2 text-sm focus:outline-none focus:border-copper"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-dust/30 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#1A1A1A] text-ivory uppercase tracking-widest text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Service</th>
              <th className="px-6 py-4 font-medium">Date & Time</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dust/20 text-charcoal/80">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-charcoal/50">
                  No bookings found.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-dust/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-charcoal">
                    {booking.customer_name}
                  </td>
                  <td className="px-6 py-4">
                    <div>{booking.customer_email}</div>
                    <div className="text-xs text-charcoal/50">{booking.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.service_name}
                  </td>
                  <td className="px-6 py-4">
                    <div>{format(new Date(booking.date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-charcoal/50">{booking.time_slot}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs uppercase tracking-widest rounded-full ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {loadingId === booking.id ? (
                      <Loader2 className="animate-spin text-copper" size={18} />
                    ) : (
                      <>
                        {booking.status === 'pending' && (
                          <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded" title="Confirm">
                            <Check size={16} />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(booking.id, 'completed')} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded" title="Mark Completed">
                            <Check size={16} />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button onClick={async () => {
                            if (await confirm("Are you sure you want to cancel this booking? An email will be sent to the customer.")) {
                              handleStatusChange(booking.id, 'cancelled');
                            }
                          }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded" title="Cancel">
                            <X size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
