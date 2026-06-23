import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { NotificationProvider } from "@/components/NotificationProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  axes: ["opsz", "SOFT", "WONK"], // Allows variable font features
});

export const metadata: Metadata = {
  title: "Flint & Copper | Luxury Salon and Spa",
  description: "Experience premium grooming and spa services at Flint & Copper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col font-sans">
        <NotificationProvider>
          <CustomCursor />
          <CustomScrollbar />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
