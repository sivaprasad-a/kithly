"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Fades and lifts children in once on mount — used for hero/landing entrances. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  hover = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Adds a playful lift + tilt on hover/tap — use for clickable cards. */
  hover?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -6, rotate: -0.6, scale: 1.015 } : undefined}
      whileTap={hover ? { scale: 0.985 } : undefined}
    >
      {children}
    </motion.div>
  );
}
