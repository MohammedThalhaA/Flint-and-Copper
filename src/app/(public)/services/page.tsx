import Link from "next/link";
import { query } from "@/lib/db";

export const metadata = {
  title: "Services | Flint & Copper",
  description: "Explore our premium grooming and spa services.",
};

async function getServices() {
  const result = await query(
    `SELECT * FROM services WHERE is_active = true ORDER BY category ASC, display_order ASC, name ASC`
  );
  return result.rows;
}

export default async function ServicesPage() {
  const services = await getServices();

  // Group services by category
  const categories = services.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  const categoryNames = Object.keys(categories);

  return (
    <div className="flex flex-col w-full bg-ivory text-charcoal pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl md:text-6xl font-light mb-6">Our Services</h1>
          <p className="text-charcoal/70 font-light text-lg max-w-2xl mx-auto">
            A curated selection of treatments designed to refine and restore. 
            Select a service to begin your booking.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categoryNames.map((cat) => (
            <a
              key={cat}
              href={`#${cat.replace(/[\s/]+/g, "-").toLowerCase()}`}
              className="px-6 py-2 border border-dust text-charcoal uppercase tracking-widest text-xs hover:border-copper hover:text-copper transition-colors duration-300"
            >
              {cat}
            </a>
          ))}
        </div>

        {/* Service Categories */}
        <div className="flex flex-col gap-24">
          {categoryNames.map((cat) => (
            <section
              key={cat}
              id={cat.replace(/[\s/]+/g, "-").toLowerCase()}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-6 mb-12">
                <h2 className="font-serif text-3xl font-light">{cat}</h2>
                <div className="h-[1px] bg-dust flex-grow" />
              </div>

              <div className="flex flex-col gap-10">
                {categories[cat].map((service: any) => (
                  <div key={service.id} className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-10 border-b border-dust/30 last:border-0 last:pb-0">
                    <div className="md:col-span-8">
                      <h3 className="text-lg md:text-xl font-medium mb-3 group-hover:text-copper transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-charcoal/70 font-light leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-dust font-medium uppercase tracking-widest">
                        <span>{service.duration_minutes} Min</span>
                        <span className="w-1 h-1 rounded-full bg-copper" />
                        <span>${service.price}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-4 flex md:justify-end items-center">
                      <Link
                        href={`/contact?service=${service.id}#booking`}
                        className="px-6 py-3 bg-charcoal text-ivory uppercase tracking-widest text-xs hover:bg-copper transition-colors duration-300 w-full md:w-auto text-center"
                      >
                        Book This
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
