"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setMounted(true);
    // Detect touch device
    const checkTouch = () => {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements or explicitly interactive ones
      const isClickable = target.closest("a, button, input, textarea, select, [role='button'], [data-interactive='true']");
      setIsHovering(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleElementHover);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("resize", checkTouch);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleElementHover);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render anything on the server, or if it's a touch device
  if (!mounted || isTouch) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Outer morphing ring */}
      <motion.div
        className="absolute rounded-full border border-copper"
        animate={{
          width: isHovering ? 48 : 24,
          height: isHovering ? 48 : 24,
          backgroundColor: isHovering ? "rgba(173, 125, 86, 0.2)" : "rgba(173, 125, 86, 0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Inner dot */}
      <motion.div
        className="absolute rounded-full bg-copper"
        animate={{
          width: isHovering ? 0 : 8,
          height: isHovering ? 0 : 8,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </motion.div>
  );
}
