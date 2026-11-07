"use client";

import { motion } from "motion/react";

const blobs = [
  { className: "bg-sage/40", size: 560, start: { x: "8%", y: "10%" }, end: { x: "18%", y: "28%" }, duration: 18 },
  { className: "bg-gold/25", size: 460, start: { x: "78%", y: "55%" }, end: { x: "66%", y: "40%" }, duration: 22 },
];

/** Slow-drifting gradient blobs behind the hero, in the spirit of motion.dev's aurora. */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[110px] ${b.className}`}
          style={{ width: b.size, height: b.size }}
          initial={{ left: b.start.x, top: b.start.y }}
          animate={{
            left: [b.start.x, b.end.x, b.start.x],
            top: [b.start.y, b.end.y, b.start.y],
          }}
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute rounded-full bg-white/5 blur-[90px]"
        style={{ width: 360, height: 360, left: "42%", top: "68%" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
