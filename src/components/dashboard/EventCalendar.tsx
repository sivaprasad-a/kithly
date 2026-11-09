"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { parseDate } from "@/lib/format";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const toKey = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function EventCalendar({ events }: { events: { id: string; title: string; date: string }[] }) {
  const byDate = useMemo(() => {
    const map = new Map<string, { id: string; title: string }[]>();
    for (const e of events) {
      if (!e.date) continue;
      map.set(e.date, [...(map.get(e.date) ?? []), { id: e.id, title: e.title }]);
    }
    return map;
  }, [events]);

  const firstUpcoming = useMemo(() => {
    const today = toKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    return [...byDate.keys()].sort().find((d) => d >= today);
  }, [byDate]);

  const initial = firstUpcoming ? new Date(firstUpcoming + "T00:00:00") : new Date();
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const [selected, setSelected] = useState<string | null>(firstUpcoming ?? null);
  const [hovered, setHovered] = useState<string | null>(null);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayKey = toKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium text-white">
          {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
            className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/10"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
            className="grid size-7 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/10"
          >
            <FontAwesomeIcon icon={faChevronRight} className="size-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-white/40">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[13px]">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const key = toKey(view.y, view.m, d);
          const has = byDate.has(key);
          const isToday = key === todayKey;
          const isSelected = key === selected;
          const dayEvents = byDate.get(key) ?? [];
          return (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() => setSelected(has ? key : null)}
                onMouseEnter={() => has && setHovered(key)}
                onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
                onFocus={() => has && setHovered(key)}
                onBlur={() => setHovered((h) => (h === key ? null : h))}
                className={`relative mx-auto grid size-7 place-items-center rounded-full transition-colors ${
                  isSelected ? "bg-gold text-teal font-semibold" : isToday ? "border border-gold/50 text-gold" : has ? "text-white hover:bg-white/10" : "text-white/35"
                } ${has && !isSelected ? "font-medium" : ""}`}
              >
                {d}
                {has && !isSelected && <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-sage" />}
              </button>

              {hovered === key && has && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[11rem] -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b2426] px-2.5 py-1.5 text-left text-[11px] shadow-[0_12px_28px_-10px_rgba(0,0,0,.75)]">
                  <p className="font-medium text-gold">
                    {parseDate(key)?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  {dayEvents.map((e) => (
                    <p key={e.id} className="truncate text-white/80">
                      {e.title}
                    </p>
                  ))}
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#0b2426]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        {selected && selectedEvents.length ? (
          <ul className="space-y-1.5">
            {selectedEvents.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}/edit`} className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-white/80 hover:bg-white/5 hover:text-white">
                  <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-gold" />
                  <span className="truncate">{e.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-white/40">
            {byDate.size ? "Pick a highlighted day to see what's on." : "No dated celebrations yet."}
          </p>
        )}
      </div>
    </div>
  );
}
