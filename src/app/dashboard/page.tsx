import { Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCalendarCheck, faHandHoldingHeart, faLightbulb, faPercent, faPlus, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { HostHeader } from "@/components/ui/HostHeader";
import { Footer } from "@/components/ui/Footer";
import { buttonClass } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { EventCalendar } from "@/components/dashboard/EventCalendar";
import { TEMPLATES } from "@/components/invite/templates";
import { createEvent } from "@/lib/actions";
import { repo, usingMemoryStore } from "@/lib/db/repo";
import { eventStatus, fmtLongDate, type EventStatus } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { EVENT_TYPES } from "@/lib/schemas";
import { STATUS, TIPS, type EventCard } from "@/lib/event-ui";

export const metadata = { title: "Your events" };

async function Overview() {
  const user = await requireUser("/dashboard");
  const events = await repo.listEvents(user.id);
  const rsvps = await Promise.all(events.map((e) => repo.listRsvps(e.id)));

  const cards: EventCard[] = events.map((e, i) => {
    const tpl = TEMPLATES.find((t) => t.id === e.invite.template)!;
    return {
      id: e.id,
      title: e.invite.title,
      kicker: e.invite.kicker || EVENT_TYPES[e.invite.type].label,
      type: e.invite.type,
      template: e.invite.template,
      bgImage: e.invite.bgImage,
      swatch: tpl.swatch,
      ink: tpl.ink,
      date: e.invite.date,
      status: eventStatus(e.invite, e.families.length),
      going: rsvps[i].filter((r) => r.status === "yes").reduce((a, r) => a + r.adults + r.kids, 0),
      replied: rsvps[i].length,
      invited: e.families.length,
    };
  });

  const totalInvited = events.reduce((a, e) => a + e.families.length, 0);
  const totalReplied = rsvps.reduce((a, r) => a + r.length, 0);
  const totalConfirmed = rsvps.reduce((a, r) => a + r.filter((x) => x.status === "yes").reduce((b, x) => b + x.adults + x.kids, 0), 0);
  const responseRate = totalInvited ? Math.round((totalReplied / totalInvited) * 100) : 0;

  const statusCounts = cards.reduce(
    (acc, c) => {
      acc[c.status]++;
      return acc;
    },
    { draft: 0, upcoming: 0, completed: 0 } as Record<EventStatus, number>,
  );

  const upcoming = events
    .filter((e) => e.invite.date && e.invite.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.invite.date.localeCompare(b.invite.date))[0];

  const upNext = (
    <div className={`glass-card flex w-full min-w-0 items-center gap-3 rounded-2xl px-4 py-2.5 sm:inline-flex sm:w-auto sm:max-w-full ${upcoming ? "" : "opacity-70"}`}>
      <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
        <FontAwesomeIcon icon={faCalendarCheck} className="size-4" />
      </span>
      <span className="relative z-10 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gold">Up next</p>
        {upcoming ? (
          <p className="truncate text-sm text-white">
            {upcoming.invite.title} <span className="text-white/50">· {fmtLongDate(upcoming.invite.date)}</span>
          </p>
        ) : (
          <p className="truncate text-sm text-white/60">No upcoming dates set yet</p>
        )}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 overflow-x-hidden xl:grid-cols-12 xl:items-start">
      {/* Left: hosting overview + the (static) hosting tips — sticky, scrolls with the page. 3/12 columns. */}
      <aside className="order-1 grid grid-cols-1 gap-5 xl:sticky xl:top-20 xl:order-none xl:col-span-3 xl:self-start">
        <Reveal className="glass-card p-6" delay={0.05}>
          <div className="relative z-10">
            <p className="eyebrow text-gold">Hosting overview</p>
            <p className="mt-2 font-sans text-4xl font-semibold text-white">{totalConfirmed}</p>
            <p className="text-sm text-white/60">guests confirmed across {events.length || "no"} celebration{events.length === 1 ? "" : "s"}</p>

            {events.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(Object.keys(STATUS) as EventStatus[]).map((s) => (
                  <span key={s} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS[s].className}`}>
                    <FontAwesomeIcon icon={STATUS[s].icon} className="size-3" />
                    {statusCounts[s]} {STATUS[s].label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-2.5">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <FontAwesomeIcon icon={faUserGroup} className="size-3.5 text-sage" /> Families invited
                </span>
                <span className="text-white">{totalInvited}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <FontAwesomeIcon icon={faPercent} className="size-3.5 text-gold" /> Have replied
                </span>
                <span className="text-white">{responseRate}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="size-3.5 text-sage" /> Total RSVPs
                </span>
                <span className="text-white">{totalReplied}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="glass-card p-5" delay={0.14}>
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <FontAwesomeIcon icon={faLightbulb} className="size-3.5 text-gold" /> Hosting tips
            </p>
            <ul className="mt-2.5 space-y-2">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2 text-xs leading-relaxed text-white/55">
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="mt-0.5 size-3 shrink-0 text-sage" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </aside>

      {/* Center: the invite list — 6/12 columns, scrolls with the page itself. */}
      <div className="order-3 grid grid-cols-1 gap-5 xl:order-none xl:col-span-6 xl:self-start">
        <EventsPanel events={cards} upNext={upNext} />
      </div>

      {/* Right: the dates calendar — sticky, scrolls with the page. 3/12 columns. */}
      <aside className="order-2 xl:sticky xl:top-20 xl:order-none xl:col-span-3 xl:self-start">
        <Reveal delay={0.1}>
          <div className="glass-card p-6" style={{ overflow: "visible" }}>
            <div className="relative z-10">
              <EventCalendar events={cards.filter((c) => c.date).map((c) => ({ id: c.id, title: c.title, date: c.date }))} />
            </div>
          </div>
        </Reveal>
      </aside>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="stage-bg relative min-h-screen">
      <AuroraBackground />
      <FloatingIcons />
      <div className="relative z-10">
        <HostHeader
          dark
          actions={
            <form action={createEvent}>
              <button className={buttonClass("gold", "sm")}>
                <FontAwesomeIcon icon={faPlus} className="size-3.5" /> New invite
              </button>
            </form>
          }
        />
        <main className="mx-auto w-full max-w-[1800px] px-4 pb-10 pt-[calc(4rem+2.5rem)] sm:px-6 xl:w-[95%] xl:px-0">
          <Reveal>
            <p className="eyebrow text-gold">Your hosting space</p>
          </Reveal>
          <h1 className="mt-1 font-serif text-4xl text-white sm:text-5xl">
            <AnimatedHeading text="Your celebrations" />
          </h1>
          <Reveal delay={0.25} className="mb-8">
            <p className="mt-2 max-w-xl text-white/70">Every invite you&apos;ve made, and who&apos;s coming.</p>
          </Reveal>
          {usingMemoryStore && (
            <p className="glass-card relative z-10 mb-6 px-4 py-2.5 text-sm text-gold-soft">
              Running without a database — data resets when the dev server restarts. Set <code>MONGODB_URI</code> in{" "}
              <code>.env.local</code> to keep it.
            </p>
          )}
          <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-white/5" />}>
            <Overview />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
