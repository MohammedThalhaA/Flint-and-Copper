"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { logout } from "../actions";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-charcoal text-ivory shrink-0 z-20 sticky top-0">
        <div>
          <Image src="/logo_no_slogan.png" alt="Flint & Copper" width={200} height={60} className="h-10 w-auto object-contain -translate-y-1" />
          <p className="uppercase tracking-widest text-[8px] text-dust mt-1">Admin Portal</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-dust hover:text-ivory transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-64 bg-charcoal text-ivory flex flex-col shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-dust/20 hidden md:block">
          <Image src="/logo_no_slogan.png" alt="Flint & Copper" width={250} height={80} className="h-12 w-auto object-contain -translate-y-1.5" />
          <p className="uppercase tracking-widest text-[10px] text-dust mt-1">Admin Portal</p>
        </div>
        
        <SidebarNav onNavigate={() => setIsSidebarOpen(false)} />

        <div className="p-4 border-t border-dust/20">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full rounded hover:bg-white/5 transition-colors text-sm font-light text-left">
              <LogOut size={18} className="text-dust" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-68px)] md:h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
