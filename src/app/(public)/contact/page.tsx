import { query } from "@/lib/db";
import { BookingForm } from "@/components/BookingForm";
import { Suspense } from "react";
import { Loader2, MapPin, Phone, Mail, Clock } from "lucide-react";
import { InteractiveIcon } from "@/components/InteractiveIcon";

export const metadata = {
  title: "Contact & Booking | Flint & Copper",
  description: "Book your next appointment or get in touch with our salon.",
};

async function getServices() {
  const result = await query(
    `SELECT id, name, duration_minutes, price FROM services WHERE is_active = true ORDER BY name ASC`
  );
  return result.rows;
}

export default async function ContactPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col w-full bg-ivory text-charcoal pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="text-center mb-20">
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl md:text-6xl font-light mb-6">Connect & Reserve</h1>
          <p className="text-charcoal/70 font-light text-lg max-w-2xl mx-auto">
            Schedule your personalized experience or reach out with any inquiries. We await your visit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Booking Form Area */}
          <div className="md:col-span-7" id="booking">
            <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="animate-spin text-copper" size={32} /></div>}>
              <BookingForm services={services} />
            </Suspense>
          </div>

          {/* Salon Info Area */}
          <div className="md:col-span-5 flex flex-col gap-12">
            <div>
              <h2 className="font-serif text-3xl font-light mb-8">The Salon</h2>
              <div className="flex flex-col gap-6 font-light text-charcoal/80">
                <div className="flex items-start gap-4 group" data-interactive="true">
                  <InteractiveIcon className="text-copper mt-1 shrink-0">
                    <MapPin size={20} />
                  </InteractiveIcon>
                  <div className="group-hover:text-copper-deep transition-colors">
                    <strong className="block text-charcoal mb-1 font-medium tracking-wide uppercase text-xs">Address</strong>
                    <p>123 Placeholder Avenue<br />Suite 400<br />New York, NY 10001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group" data-interactive="true">
                  <InteractiveIcon className="text-copper mt-1 shrink-0">
                    <Phone size={20} />
                  </InteractiveIcon>
                  <div className="group-hover:text-copper-deep transition-colors">
                    <strong className="block text-charcoal mb-1 font-medium tracking-wide uppercase text-xs">Phone</strong>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group" data-interactive="true">
                  <InteractiveIcon className="text-copper mt-1 shrink-0">
                    <Mail size={20} />
                  </InteractiveIcon>
                  <div className="group-hover:text-copper-deep transition-colors">
                    <strong className="block text-charcoal mb-1 font-medium tracking-wide uppercase text-xs">Email</strong>
                    <p>hello@flintandcopper.example</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group" data-interactive="true">
                  <InteractiveIcon className="text-copper mt-1 shrink-0">
                    <Clock size={20} />
                  </InteractiveIcon>
                  <div className="group-hover:text-copper-deep transition-colors">
                    <strong className="block text-charcoal mb-1 font-medium tracking-wide uppercase text-xs">Hours</strong>
                    <p className="flex justify-between w-48"><span>Mon - Thu</span><span>10am - 8pm</span></p>
                    <p className="flex justify-between w-48"><span>Friday</span><span>10am - 9pm</span></p>
                    <p className="flex justify-between w-48"><span>Saturday</span><span>9am - 6pm</span></p>
                    <p className="flex justify-between w-48 text-copper"><span>Sunday</span><span>Closed</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-dust/20 border border-dust/30 relative flex items-center justify-center">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity opacity-40"></div>
               <span className="relative z-10 uppercase tracking-widest text-xs text-charcoal/80 bg-ivory/80 px-4 py-2 backdrop-blur-sm">[ Map View ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
