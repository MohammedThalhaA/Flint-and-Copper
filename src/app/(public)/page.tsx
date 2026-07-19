import Link from "next/link";
import { query } from "@/lib/db";
import { ArrowRight, Sparkles, Droplets, Leaf } from "lucide-react";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { InteractiveIcon } from "@/components/InteractiveIcon";
import { ReviewModal } from "@/components/ReviewModal";

export const metadata = {
  title: "Flint & Copper | Luxury Salon and Spa",
  description: "Experience premium grooming and spa services where the raw energy of flint meets the restorative glow of copper.",
};

async function getFeaturedServices() {
  const result = await query(
    `SELECT * FROM services WHERE is_active = true ORDER BY id ASC LIMIT 3`
  );
  return result.rows;
}

async function getReviews() {
  const result = await query(
    `SELECT id, author, text, rating FROM reviews WHERE is_approved = true AND is_featured = true ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getOffers() {
  const result = await query(
    `SELECT * FROM offers WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE) ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getGallery() {
  const result = await query(
    `SELECT * FROM gallery_images ORDER BY created_at ASC`
  );
  return result.rows;
}

export default async function HomePage() {
  const [featuredServices, reviews, offers, gallery] = await Promise.all([
    getFeaturedServices(),
    getReviews(),
    getOffers(),
    getGallery()
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-charcoal/80 to-charcoal/40" />
        {/* Placeholder for Hero Video/Image */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        
        <div className="container relative z-10 mx-auto px-6 text-center text-ivory flex flex-col items-center">
          <span className="uppercase tracking-[0.3em] text-copper mb-6 text-sm">Welcome to</span>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-tight mb-8">
            Raw Beauty.<br />
            <span className="italic text-copper">Refined</span> Elegance.
          </h1>
          <p className="max-w-xl mx-auto text-dust font-light mb-12 text-lg md:text-xl leading-relaxed">
            A sanctuary where modern precision meets elemental restoration. Discover grooming and wellness elevated to an art form.
          </p>
          <Link
            href="/contact#booking"
            className="group relative px-8 py-4 bg-copper text-ivory uppercase tracking-[0.2em] text-sm overflow-hidden"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ivory">Book Your Experience</span>
            <div className="absolute inset-0 bg-copper-deep translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-32 bg-ivory text-charcoal">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-[500px] md:h-[700px] w-full overflow-hidden bg-dust/30">
            <img 
              src="/images/nano-banana-salon.png" 
              alt="Salon Interior Photography with Nano Banana" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <h2 className="font-serif text-3xl md:text-4xl md:text-5xl font-light mb-8">
              The <span className="italic text-copper">Duality</span> of Flint & Copper
            </h2>
            <div className="w-12 h-[1px] bg-copper mb-8" />
            <p className="text-lg font-light leading-relaxed mb-6 text-charcoal/80">
              We draw inspiration from the contrast between hard, grounding minerals and warm, reflective metals. This duality is at the core of our philosophy.
            </p>
            <p className="text-lg font-light leading-relaxed mb-10 text-charcoal/80">
              Our space is designed to spark transformation—igniting your personal style with precision cuts (Flint), while restoring your mind and body with nourishing, therapeutic treatments (Copper).
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-4 text-copper uppercase tracking-widest text-sm font-medium hover:text-copper-deep transition-colors group"
            >
              Explore Our Services
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-32 bg-charcoal text-ivory">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <span className="uppercase tracking-[0.2em] text-copper mb-4 block text-xs">Curated Offerings</span>
            <h2 className="font-serif text-3xl md:text-4xl md:text-5xl font-light">Signature Experiences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service: any) => (
              <div key={service.id} className="group relative bg-[#1A1A1A] border border-dust/10 p-10 hover:border-copper/50 transition-colors duration-500 flex flex-col h-full">
                <span className="uppercase tracking-widest text-xs text-dust mb-4">{service.category}</span>
                <h3 className="font-serif text-lg md:text-xl md:text-2xl font-light mb-4 text-ivory">{service.name}</h3>
                <p className="text-dust/80 font-light leading-relaxed mb-8 flex-grow">
                  {service.description}
                </p>
                <div className="flex items-end justify-between mt-auto">
                  <span className="text-copper font-light">₹{service.price}</span>
                  <Link
                    href={`/contact?service=${service.id}#booking`}
                    className="text-xs uppercase tracking-widest border-b border-copper text-ivory hover:text-copper transition-colors pb-1"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/services"
              className="px-8 py-4 border border-dust/30 text-ivory uppercase tracking-[0.2em] text-xs hover:bg-ivory hover:text-charcoal transition-colors duration-300"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Current Offers */}
      {offers.length > 0 && (
        <section className="py-24 bg-charcoal text-ivory border-t border-dust/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="uppercase tracking-[0.2em] text-copper mb-4 block text-xs">Exclusive Access</span>
              <h2 className="font-serif text-3xl md:text-4xl md:text-5xl font-light">Current Promotions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.map((offer: any) => (
                <div key={offer.id} className="group relative bg-[#1A1A1A] border border-dust/20 hover:border-copper/40 transition-colors flex flex-col sm:flex-row h-auto min-h-[250px] overflow-hidden">
                  {/* Voucher perforated edge effect on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 border-l-[3px] border-dotted border-charcoal opacity-50 z-10"></div>
                  
                  {offer.image_data && (
                    <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-charcoal">
                      <img src={offer.image_data} alt={offer.title} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#1A1A1A] via-transparent to-transparent"></div>
                    </div>
                  )}
                  <div className={`p-8 md:p-10 flex flex-col justify-center flex-1 relative ${!offer.image_data ? 'w-full' : 'sm:w-3/5'}`}>
                    {offer.discount_text && (
                      <div className="mb-4 relative">
                        <span className="font-serif text-2xl md:text-3xl text-copper block leading-tight font-medium drop-shadow-sm">
                          {offer.discount_text}
                        </span>
                      </div>
                    )}
                    <h3 className="font-serif text-xl md:text-2xl font-light mb-3 text-ivory uppercase tracking-wide">{offer.title}</h3>
                    <p className="text-dust/80 font-light text-sm leading-relaxed mb-8 max-w-md">
                      {offer.description}
                    </p>
                    <Link
                      href="/contact#booking"
                      className="mt-auto px-6 py-3 bg-transparent border border-copper text-copper hover:bg-copper hover:text-ivory transition-colors duration-300 uppercase tracking-widest text-xs self-start"
                    >
                      Claim Offer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* USP Section */}
      <section className="py-24 bg-ivory border-y border-dust/20">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center group cursor-pointer" data-interactive="true">
            <div className="w-16 h-16 rounded-full border border-copper flex items-center justify-center mb-6 text-copper transition-all duration-300 group-hover:bg-copper group-hover:text-ivory">
              <InteractiveIcon>
                <Sparkles size={24} strokeWidth={1} />
              </InteractiveIcon>
            </div>
            <h3 className="uppercase tracking-widest text-sm mb-4 text-charcoal font-medium">Master Artisans</h3>
            <p className="text-charcoal/70 font-light text-sm leading-relaxed">
              Our specialists are extensively trained in both classic techniques and avant-garde trends, ensuring unparalleled precision.
            </p>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" data-interactive="true">
            <div className="w-16 h-16 rounded-full border border-copper flex items-center justify-center mb-6 text-copper transition-all duration-300 group-hover:bg-copper group-hover:text-ivory">
              <InteractiveIcon>
                <Leaf size={24} strokeWidth={1} />
              </InteractiveIcon>
            </div>
            <h3 className="uppercase tracking-widest text-sm mb-4 text-charcoal font-medium">Premium Botanicals</h3>
            <p className="text-charcoal/70 font-light text-sm leading-relaxed">
              We exclusively use ethically sourced, high-performance organic products that respect both your body and the environment.
            </p>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" data-interactive="true">
            <div className="w-16 h-16 rounded-full border border-copper flex items-center justify-center mb-6 text-copper transition-all duration-300 group-hover:bg-copper group-hover:text-ivory">
              <InteractiveIcon>
                <Droplets size={24} strokeWidth={1} />
              </InteractiveIcon>
            </div>
            <h3 className="uppercase tracking-widest text-sm mb-4 text-charcoal font-medium">Restorative Ambience</h3>
            <p className="text-charcoal/70 font-light text-sm leading-relaxed">
              Every detail of our space is curated to provide a tranquil escape from the noise of the city, fostering deep relaxation.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#171717] text-ivory">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="uppercase tracking-[0.2em] text-copper mb-4 block text-xs">Client Voices</span>
          </div>
          <TestimonialCarousel reviews={reviews} />
          
          <div className="flex justify-center mt-8">
            <ReviewModal />
          </div>
        </div>
      </section>

      {/* Gallery Showcase */}
      {gallery.length > 0 && (
        <section className="py-2 bg-charcoal">
          <div className="flex overflow-hidden">
            {gallery.map((img: { id: number; source_type: string; image_data: string | null; image_url: string | null }) => (
              <div key={img.id} className="w-1/5 aspect-square bg-[#1A1A1A] border-r border-dust/10 last:border-r-0 relative group">
                <img 
                  src={(img.source_type === 'upload' ? img.image_data : img.image_url) || undefined} 
                  alt="Gallery Image" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
              </div>
            ))}
            {/* Fill empty spots if less than 5 */}
            {Array.from({ length: Math.max(0, 5 - gallery.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-1/5 aspect-square bg-[#1A1A1A] border-r border-dust/10 last:border-r-0 flex items-center justify-center">
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-32 bg-copper text-ivory text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl md:text-5xl font-light mb-8">Ready for your transformation?</h2>
          <p className="font-light text-ivory/80 mb-12 max-w-md mx-auto">
            Reserve your time with our specialists and experience the Flint & Copper difference.
          </p>
          <Link
            href="/contact#booking"
            className="inline-block px-10 py-5 bg-charcoal text-ivory uppercase tracking-[0.2em] text-sm hover:bg-black transition-colors duration-300"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}
