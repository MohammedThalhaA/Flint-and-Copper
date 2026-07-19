"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Contact & Booking", href: "/contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
          (pathname !== "/" || isScrolled || isMobileMenuOpen) 
            ? "bg-charcoal/95 backdrop-blur-md border-dust/10 py-4 shadow-md" 
            : "bg-transparent border-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="group relative z-50">
            <div className={clsx(
              "transition-all duration-300",
              (pathname === "/" && !isScrolled && !isMobileMenuOpen) ? "opacity-90" : "opacity-100"
            )}>
              <Image src="/logo_no_slogan.png" alt="Flint & Copper" width={500} height={160} className="h-10 md:h-12 w-auto object-contain scale-[1.3] md:scale-[1.5] origin-left -translate-y-1.5 md:-translate-y-2.5" priority />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-12 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative group py-2"
                >
                  <span
                    className={clsx(
                      "text-sm tracking-[0.15em] uppercase transition-colors duration-300",
                      isActive ? "text-copper" : "text-ivory/90 group-hover:text-copper"
                    )}
                  >
                    {link.name}
                  </span>
                  <span
                    className={clsx(
                      "absolute bottom-0 left-0 w-full h-[1px] bg-copper origin-left transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
            <Link
              href="/contact#booking"
              className="ml-4 px-6 py-3 border border-copper text-copper uppercase text-xs tracking-widest hover:bg-copper hover:text-ivory transition-colors duration-300 rounded-sm"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={clsx(
              "md:hidden transition-colors duration-300 relative z-50 p-2 text-ivory hover:text-copper"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          y: isMobileMenuOpen ? "0%" : "-100%",
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 bg-ivory flex flex-col items-center justify-center pointer-events-none data-[open=true]:pointer-events-auto"
        data-open={isMobileMenuOpen}
      >
        <nav className="flex flex-col gap-8 items-center text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={clsx(
                "font-serif text-2xl md:text-3xl transition-colors duration-300",
                pathname === link.href ? "text-copper" : "text-charcoal hover:text-copper-deep"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/contact#booking"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-8 px-8 py-4 bg-copper text-ivory uppercase tracking-widest text-sm hover:bg-copper-deep transition-colors duration-300"
          >
            Book Appointment
          </Link>
        </nav>
      </motion.div>
    </>
  );
}
