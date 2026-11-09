import {
  faBabyCarriage,
  faCakeCandles,
  faChampagneGlasses,
  faCircleCheck,
  faGift,
  faHouse,
  faPaperPlane,
  faPenToSquare,
  faRing,
  faSeedling,
  faUsers,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import type { EventStatus } from "@/lib/format";
import type { EventType } from "@/lib/schemas";

export const STATUS: Record<EventStatus, { label: string; icon: typeof faGift; className: string }> = {
  draft: { label: "Draft", icon: faPenToSquare, className: "bg-white/10 text-white/70" },
  upcoming: { label: "In progress", icon: faPaperPlane, className: "bg-sage/25 text-sage" },
  completed: { label: "Completed", icon: faCircleCheck, className: "bg-gold/20 text-gold" },
};

export const TYPE_ICONS: Record<EventType, typeof faGift> = {
  baby: faBabyCarriage,
  birthday: faCakeCandles,
  anniversary: faRing,
  babyshower: faBabyCarriage,
  housewarming: faHouse,
  engagement: faChampagneGlasses,
  naming: faSeedling,
  gettogether: faUsers,
  other: faWandMagicSparkles,
};

export const TIPS = [
  "Share a guest's personal link directly — it skips the RSVP lookup step entirely.",
  "Add a menu and favourites so guests can tell you their preferences while replying.",
  "Check Responses the day before — a gentle nudge gets stragglers to reply.",
];

export type EventCard = {
  id: string;
  title: string;
  kicker: string;
  type: EventType;
  template: string;
  bgImage?: string;
  swatch: string;
  ink: string;
  date: string;
  status: EventStatus;
  going: number;
  replied: number;
  invited: number;
};
