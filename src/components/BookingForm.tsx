"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format, addDays, startOfToday } from "date-fns";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price: string;
};

export function BookingForm({ services }: { services: Service[] }) {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>(initialServiceId || "");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate next 14 days for selection
  const today = startOfToday();
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(today, i + 1); // Start from tomorrow
    return format(d, "yyyy-MM-dd");
  });

  useEffect(() => {
    if (selectedService && selectedDate) {
      setIsLoading(true);
      fetch(`/api/availability?serviceId=${selectedService}&date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.slots) setAvailableSlots(data.slots);
          else setAvailableSlots([]);
          setIsLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch availability.");
          setIsLoading(false);
        });
    }
  }, [selectedService, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          date: selectedDate,
          timeSlot: selectedSlot,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-ivory p-12 text-center border border-dust/30">
        <div className="w-16 h-16 rounded-full bg-copper/10 text-copper flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} strokeWidth={1.5} />
        </div>
        <h3 className="font-serif text-3xl font-light mb-4">Booking Confirmed</h3>
        <p className="text-charcoal/70 font-light mb-8">
          Thank you, {formData.name}. Your appointment for {selectedDate} at {selectedSlot} has been scheduled.
          A confirmation email has been sent to {formData.email}.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-charcoal text-ivory uppercase tracking-widest text-xs hover:bg-copper transition-colors"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-ivory p-8 md:p-12 border border-dust/30 relative">
      {/* Steps Indicator */}
      <div className="flex items-center gap-2 mb-10 text-xs tracking-widest uppercase font-medium">
        <span className={clsx(step >= 1 ? "text-copper" : "text-dust")}>Service</span>
        <ChevronRight size={14} className="text-dust" />
        <span className={clsx(step >= 2 ? "text-copper" : "text-dust")}>Date & Time</span>
        <ChevronRight size={14} className="text-dust" />
        <span className={clsx(step >= 3 ? "text-copper" : "text-dust")}>Details</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-8 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-serif text-2xl font-light mb-6">Select a Service</h3>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id.toString())}
                className={clsx(
                  "text-left p-6 border transition-all duration-300",
                  selectedService === s.id.toString()
                    ? "border-copper bg-copper/5"
                    : "border-dust/30 hover:border-copper/50 bg-white"
                )}
              >
                <div className="font-medium text-charcoal mb-1">{s.name}</div>
                <div className="text-xs text-dust tracking-widest uppercase">
                  {s.duration_minutes} Min • ₹{s.price}
                </div>
              </button>
            ))}
          </div>
          <button
            disabled={!selectedService}
            onClick={() => setStep(2)}
            className="w-full py-4 bg-charcoal text-ivory uppercase tracking-widest text-sm hover:bg-copper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-serif text-2xl font-light mb-6">Select Date & Time</h3>
          
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-dust mb-3">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
              className="w-full p-4 border border-dust/50 bg-white text-charcoal focus:outline-none focus:border-copper transition-colors"
            >
              <option value="" disabled>Select a date...</option>
              {availableDates.map(d => (
                <option key={d} value={d}>{format(new Date(d), "EEEE, MMMM do")}</option>
              ))}
            </select>
          </div>

          {selectedDate && (
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-dust mb-3">Time</label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-copper text-sm">
                  <Loader2 size={16} className="animate-spin" /> Checking availability...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={clsx(
                        "py-3 text-sm border transition-all duration-300",
                        selectedSlot === slot
                          ? "border-copper bg-copper text-ivory"
                          : "border-dust/30 bg-white text-charcoal hover:border-copper"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal/60">No available slots for this date. Please select another.</p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-4 border border-charcoal text-charcoal uppercase tracking-widest text-sm hover:bg-charcoal/5 transition-colors"
            >
              Back
            </button>
            <button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(3)}
              className="flex-grow py-4 bg-charcoal text-ivory uppercase tracking-widest text-sm hover:bg-copper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-serif text-2xl font-light mb-6">Your Details</h3>
          
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-xs uppercase tracking-widest text-dust mb-2">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 border border-dust/50 bg-white text-charcoal focus:outline-none focus:border-copper transition-colors"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-dust mb-2">Email Address</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 border border-dust/50 bg-white text-charcoal focus:outline-none focus:border-copper transition-colors"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-dust mb-2">Phone Number</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 border border-dust/50 bg-white text-charcoal focus:outline-none focus:border-copper transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="bg-dust/10 p-6 mb-8 border border-dust/30">
            <h4 className="font-serif text-lg mb-2">Summary</h4>
            <p className="text-sm text-charcoal/70 mb-1">
              {services.find(s => s.id.toString() === selectedService)?.name}
            </p>
            <p className="text-sm text-charcoal/70">
              {selectedDate && format(new Date(selectedDate), "MMMM do, yyyy")} at {selectedSlot}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-4 border border-charcoal text-charcoal uppercase tracking-widest text-sm hover:bg-charcoal/5 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email || !formData.phone}
              className="flex-grow flex items-center justify-center gap-3 py-4 bg-copper text-ivory uppercase tracking-widest text-sm hover:bg-copper-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              Confirm Booking
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
