import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { InteractiveIcon } from "@/components/InteractiveIcon";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/80 pt-20 pb-10 border-t border-dust/20 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Image src="/logo_no_slogan.png" alt="Flint & Copper" width={500} height={160} className="h-16 md:h-24 w-auto object-contain" />
            </div>
            <p className="text-dust max-w-sm font-light leading-relaxed mb-8">
              A premium grooming and spa destination where the raw, mineral energy of flint 
              meets the warm, restorative glow of copper.
            </p>
            <div className="flex gap-6 text-sm uppercase tracking-widest text-dust">
              <a href="#" className="hover:text-copper transition-colors">IG</a>
              <a href="#" className="hover:text-copper transition-colors">FB</a>
              <a href="#" className="hover:text-copper transition-colors">X</a>
            </div>
          </div>

          <div>
            <h3 className="uppercase tracking-widest text-xs text-copper mb-6">Explore</h3>
            <ul className="flex flex-col gap-4 font-light text-sm">
              <li>
                <Link href="/" className="hover:text-ivory transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-ivory transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ivory transition-colors">Contact & Booking</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="uppercase tracking-widest text-xs text-copper mb-6">Contact</h3>
            <ul className="flex flex-col gap-4 font-light text-sm">
              <li className="flex items-start gap-3 group" data-interactive="true">
                <InteractiveIcon className="text-copper mt-0.5 shrink-0">
                  <MapPin size={16} />
                </InteractiveIcon>
                <span className="group-hover:text-ivory transition-colors">123 Placeholder Avenue<br />Suite 400<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 group" data-interactive="true">
                <InteractiveIcon className="text-copper shrink-0">
                  <Phone size={16} />
                </InteractiveIcon>
                <span className="group-hover:text-ivory transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 group" data-interactive="true">
                <InteractiveIcon className="text-copper shrink-0">
                  <Mail size={16} />
                </InteractiveIcon>
                <span className="group-hover:text-ivory transition-colors">hello@flintandcopper.example</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-dust/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-dust/60">
          <p>&copy; {new Date().getFullYear()} Flint & Copper Salon. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-dust transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-dust transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
