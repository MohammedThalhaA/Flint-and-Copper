"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function InteractiveIcon({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      data-interactive="true"
      className={`inline-flex items-center justify-center ${className || ""}`}
      whileHover={{ scale: 1.15, rotate: 8 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}
