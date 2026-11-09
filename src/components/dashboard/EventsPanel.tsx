"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownWideShort, faArrowUpWideShort, faCalendarDays, faGift, faPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Reveal } from "@/components/ui/Reveal";
import { DeleteEventButton } from "@/components/ui/DeleteEventButton";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { buttonClass } from "@/components/ui/Button";
import { createEvent } from "@/lib/actions";
import { STATUS, TYPE_ICONS, type EventCard } from "@/lib/event-ui";
import { fmtLongDate } from "@/lib/format";

type SortKey = "date-asc" | "date-desc" | "created";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "date-asc", label: "Date: soonest first" },
  { key: "date-desc", label: "Date: latest first" },
  { key: "created", label: "Recently added" },
];

function sortEvents(events: EventCard[], sort: SortKey): EventCard[] {
  if (sort === "created") return events;
  const [withDate, noDate] = [events.filter((e) => e.date), events.filter((e) => !e.date)];
  withDate.sort((a, b) => (sort === "date-asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  // Undated invites still need to be found — keep them visible at the end rather than hiding them.
  return [...withDate, ...noDate];
}

export function EventsPanel({ events, upNext }: { events: EventCard[]; upNext?: ReactNode }) {
  const [sort, setSort] = useState<SortKey>("date-asc");
  const sorted = useMemo(() => sortEvents(events, sort), [events, sort]);

  if (!events.length) {
    return (
      <div className="grid grid-cols-1 gap-5">
        {upNext}
        <Reveal className="glass-card relative overflow-hidden p-14 text-center" delay={0.1}>
          <AuroraBackground />
          <FloatingIcons />
          <div className="relative z-10">
            <div className="mx-auto grid size-16 place-items-center rounded-full border border-white/15 bg-white/10 text-gold backdrop-blur">
              <FontAwesomeIcon icon={faGift} className="size-6" />
            </div>
            <p className="mt-5 font-serif text-3xl text-white">Your first celebration starts here</p>
            <p className="mx-auto mt-2 max-w-md text-white/70">
              Birthdays, anniversaries, baby showers — whatever brings your circle together.
            </p>
            <form action={createEvent} className="mt-6">
              <button className={buttonClass("gold")}>
                <FontAwesomeIcon icon={faPlus} className="size-4" /> Create an invite
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {upNext}
        <label className="flex items-center gap-2 text-sm text-white/70 sm:ml-auto">
          <span className="hidden shrink-0 text-white/40 sm:inline">
            {events.length} celebration{events.length === 1 ? "" : "s"}
          </span>
          <FontAwesomeIcon icon={sort === "date-desc" ? faArrowDownWideShort : faArrowUpWideShort} className="size-3.5 shrink-0 text-gold" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-sm text-white outline-none focus:border-sage/60 sm:w-auto sm:flex-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key} className="bg-[#0b2426] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="@container">
        {/* Sized against this panel's own width, not the viewport — the center column's width varies with the 3-column shell. */}
        <ul className="grid grid-cols-1 gap-5 @[28rem]:grid-cols-2 @[52rem]:grid-cols-3">
          {sorted.map((e, i) => {
            const typeIcon = TYPE_ICONS[e.type];
            const status = STATUS[e.status];
            return (
              <Reveal key={e.id} delay={Math.min(i, 6) * 0.05} hover>
                <li className="glass-card group overflow-hidden transition-shadow duration-200 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,.7)]">
                  <Link href={`/events/${e.id}/edit`} className="relative z-10 block">
                    <div
                      className="relative grid h-36 place-items-center overflow-hidden px-4 text-center"
                      style={{
                        background: e.template === "custom" && e.bgImage ? `center/cover url(${e.bgImage})` : e.swatch,
                        color: e.ink,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={typeIcon}
                        className="absolute left-3 top-3 size-4 opacity-40 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-60"
                      />
                      <span className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur ${status.className}`}>
                        <FontAwesomeIcon icon={status.icon} className="size-3" />
                        {status.label}
                      </span>
                      <div>
                        <p className="eyebrow opacity-80">{e.kicker}</p>
                        <p className="mt-1 font-serif text-2xl">{e.title}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="relative z-10 flex items-center gap-4 px-4 py-3 text-sm text-white/60">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="size-3.5 text-gold" />
                      {fmtLongDate(e.date) || "Date not set"}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-white/10 px-4 py-3">
                    <span className="mr-auto flex items-center gap-1.5 text-sm text-white/75">
                      <FontAwesomeIcon icon={faUsers} className="size-3.5 text-sage" />
                      {e.going} coming · {e.replied}/{Math.max(e.invited, e.replied)} replied
                    </span>
                    <div className="flex items-center gap-2">
                      <Link href={`/events/${e.id}/responses`} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10">
                        Responses
                      </Link>
                      <Link href={`/events/${e.id}/edit`} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15">
                        Edit
                      </Link>
                      <DeleteEventButton eventId={e.id} title={e.title} />
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
