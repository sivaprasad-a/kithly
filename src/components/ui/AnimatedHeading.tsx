"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { motion } from "motion/react";

/** A serif heading whose words pop in one by one, with a spinning sparkle riding alongside. */
export function AnimatedHeading({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={`relative inline-flex flex-wrap items-center gap-x-3 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 24, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
      <motion.span
        className="inline-flex text-gold"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: [0, 15, -10, 0] }}
        transition={{
          opacity: { delay: 0.08 * words.length + 0.15, duration: 0.3 },
          scale: { delay: 0.08 * words.length + 0.15, duration: 0.4, type: "spring" },
          rotate: { delay: 0.08 * words.length + 0.4, duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} className="size-6 sm:size-7" />
      </motion.span>
    </span>
  );
}
