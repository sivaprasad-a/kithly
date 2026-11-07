import Link from "next/link";
import { Sparkles, Users, Utensils, Send } from "lucide-react";
import { InviteCard } from "@/components/invite/InviteCard";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Brand } from "@/components/ui/Brand";
import { buttonClass } from "@/components/ui/Button";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { Reveal } from "@/components/ui/Reveal";
import { AI_NAME, APP_NAME } from "@/config/brand";
import { sampleInvite } from "@/lib/sample-invite";

const features = [
  { icon: Users, label: "Private links, no guest sign-up" },
  { icon: Utensils, label: "Food & drink counts, sorted" },
  { icon: Sparkles, label: `${AI_NAME} writes it for you` },
  { icon: Send, label: "Share on WhatsApp in a tap" },
];

export default function Home() {
  return (
    <div className="stage-bg relative flex min-h-dvh flex-col overflow-hidden text-white lg:h-dvh">
      <AuroraBackground />
      <FloatingIcons />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Brand light />
        <Link href="/sign-in" className={buttonClass("gold", "sm")}>
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:overflow-hidden lg:pb-10">
        <section>
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
              <Sparkles className="size-3" /> {APP_NAME} · for your closest circle
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
              Small gatherings,
              <br />
              <i className="text-gold">beautifully</i> hosted.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
              Design an elegant invite in minutes, send it on WhatsApp, email or Instagram, and see exactly who&apos;s
              coming, what they&apos;ll eat and what they&apos;ll drink.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-in" className={buttonClass("gold")}>
                Create your invite — free
              </Link>
              <a href="#preview" className={buttonClass("ghost") + " text-white hover:bg-white/10"}>
                See a live invite →
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <ul className="mt-8 flex max-w-lg flex-wrap gap-2.5">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[13px] text-white/80"
                >
                  <Icon className="size-3.5 text-gold" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <Reveal delay={0.2} y={24} className="relative mx-auto w-full max-w-[360px]">
          <div id="preview">
            <span className="absolute -right-3 -top-3 z-10 rotate-3 rounded-full bg-cream px-3 py-1.5 text-[11px] font-medium text-teal shadow-lg">
              🎉 18 families confirmed
            </span>
            <div className="relative max-h-[58vh] overflow-hidden rounded-lg shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)] lg:max-h-[70vh]">
              <InviteCard invite={sampleInvite} compact cta={<span className="rsvp">RSVP</span>} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a2a2c] to-transparent" />
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
