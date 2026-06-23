"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export function CustomScrollbar() {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use Framer Motion's useScroll to track the scroll progress
  const { scrollYProgress } = useScroll();

  // Create a spring animation for smoother visual updates of the thumb
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90,
    mass: 0.1,
  });

  // Map the 0-1 progress to CSS translateY percentage
  // If the thumb is 10vh tall, it can only move from 0 to 90vh down the screen.
  // Actually, we'll map the top property from 0% to 100% of the container, minus the thumb height.
  // It's easier to just use top with a percentage and a fixed-height thumb, but translateY is more performant.
  // We'll set the thumb height to 15vh and translate it from 0vh to 85vh.
  const translateY = useTransform(smoothProgress, [0, 1], ["0vh", "85vh"]);

  useEffect(() => {
    // Show the scrollbar when scrolling, hide it after scrolling stops
    const handleScroll = () => {
      setIsVisible(true);
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1000); // Hide after 1 second of inactivity
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 w-1.5 h-screen z-[10000] pointer-events-none">
      <motion.div
        className="absolute top-0 right-0 w-full h-[15vh] bg-copper/70 rounded-full"
        style={{
          y: translateY,
          opacity: isVisible ? 1 : 0,
        }}
        initial={{ opacity: 0 }}
        transition={{ opacity: { duration: 0.4 } }}
      />
    </div>
  );
}
