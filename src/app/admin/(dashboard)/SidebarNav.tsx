"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Calendar, Grid, Tag, MessageSquare, Image as ImageIcon, LayoutDashboard } from "lucide-react";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/services", label: "Services", icon: Grid },
    { href: "/admin/offers", label: "Offers", icon: Tag },
    { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  ];

  return (
    <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-colors text-sm font-light ${
              isActive 
                ? "bg-white/10 text-ivory font-normal" 
                : "hover:bg-white/5 text-ivory/80"
            }`}
          >
            <Icon size={18} className={isActive ? "text-copper" : "text-dust"} /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
