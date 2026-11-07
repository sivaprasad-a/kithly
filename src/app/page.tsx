import Link from "next/link";
import { Sparkles, Users, Utensils, Send } from "lucide-react";
import { InviteCard } from "@/components/invite/InviteCard";
import { Brand } from "@/components/ui/Brand";
import { buttonClass } from "@/components/ui/Button";
import { AI_NAME, APP_NAME } from "@/config/brand";
import { defaultInvite } from "@/lib/schemas";

const sample = {
  ...defaultInvite(),
  date: "2026-11-28",
  address: "1428 Willow Creek Drive\nPhoenix, AZ",
  parking: "Driveway fits 3 cars; street parking on Willow Creek Dr.",
  menu: "Biryani, paneer tikka & a mango cake",
  alcoholOn: true,
  favourites: {
    colors: [
      { hex: "#DAA112", name: "Sunshine yellow" },
      { hex: "#809276", name: "Sage" },
    ],
    toy: "Stacking rings, board books",
    food: "Banana puffs, idli",
    theme: "",
    gift: "",
  },
};

const features = [
  { icon: Users, title: "Personal links per family", body: "Each family gets its own link. No sign-up for guests — grandparents included." },
  { icon: Utensils, title: "Food & drinks, sorted", body: "Veg / non-veg counts, soft drinks and bar picks, allergies — all in one view." },
  { icon: Sparkles, title: `${AI_NAME}, your AI co-host`, body: "Writes your invite in your tone, in English, Telugu or Hindi." },
  { icon: Send, title: "Share anywhere", body: "WhatsApp, email or an Instagram DM — straight from your phone." },
];

export default function Home() {
  return (
    <div className="stage-bg min-h-dvh text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand light />
        <Link href="/sign-in" className={buttonClass("gold", "sm")}>
          Sign in
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-8 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <p className="eyebrow text-gold">{APP_NAME} · invitations for your close circle</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
            Small gatherings,
            <br />
            <i className="text-gold">beautifully</i> hosted.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
            Design an elegant invite in minutes, send it on WhatsApp, email or Instagram, and see exactly who&apos;s
            coming, what they&apos;ll eat and what they&apos;ll drink.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-in" className={buttonClass("gold")}>
              Create your invite
            </Link>
            <a href="#features" className={buttonClass("ghost") + " text-white hover:bg-white/10"}>
              How it works
            </a>
          </div>
          <ul id="features" className="mt-14 grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-gold">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-lg shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)]">
          <InviteCard invite={sample} compact cta={<span className="rsvp">RSVP</span>} />
        </div>
      </main>
    </div>
  );
}
