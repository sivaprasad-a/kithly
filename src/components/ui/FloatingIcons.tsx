"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCakeCandles,
  faCameraRetro,
  faChampagneGlasses,
  faEnvelopeOpenText,
  faGift,
  faHeart,
  faLocationDot,
  faMusic,
  faStar,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "motion/react";

const items = [
  { icon: faWandMagicSparkles, top: "12%", left: "40%", size: 24, duration: 7, tone: "text-gold/20" },
  { icon: faHeart, top: "68%", left: "7%", size: 28, duration: 9, tone: "text-white/10" },
  { icon: faGift, top: "20%", left: "90%", size: 26, duration: 8, tone: "text-gold/15" },
  { icon: faEnvelopeOpenText, top: "80%", left: "93%", size: 22, duration: 10, tone: "text-white/10" },
  { icon: faStar, top: "48%", left: "3%", size: 24, duration: 11, tone: "text-gold/20" },
  { icon: faCakeCandles, top: "6%", left: "70%", size: 22, duration: 9.5, tone: "text-white/10" },
  { icon: faChampagneGlasses, top: "88%", left: "35%", size: 24, duration: 8.5, tone: "text-gold/15" },
  { icon: faCameraRetro, top: "32%", left: "15%", size: 22, duration: 10.5, tone: "text-white/10" },
  { icon: faMusic, top: "58%", left: "80%", size: 20, duration: 7.5, tone: "text-gold/20" },
  { icon: faLocationDot, top: "4%", left: "6%", size: 22, duration: 9, tone: "text-white/10" },
];

/** A scatter of outlined icons drifting slowly in the background — keeps a dark gradient from feeling empty. */
export function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {items.map(({ icon, top, left, size, duration, tone }, i) => (
        <motion.div
          key={i}
          className={`absolute ${tone}`}
          style={{ top, left }}
          animate={{ y: [0, -18, 0], rotate: [0, 7, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: i * 0.45 }}
        >
          <FontAwesomeIcon icon={icon} style={{ width: size, height: size }} />
        </motion.div>
      ))}
    </div>
  );
}
