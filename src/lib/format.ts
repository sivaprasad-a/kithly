/** Date helpers that treat "YYYY-MM-DD" as a local calendar date (no timezone shift). */
export function parseDate(d: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(y, m - 1, dd);
}

export function fmtTime(t: string): string {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

export function fmtShortDate(d: string): string {
  const x = parseDate(d);
  return x ? x.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}

export function fmtLongDate(d: string): string {
  const x = parseDate(d);
  return x ? x.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
}

export type EventStatus = "draft" | "upcoming" | "completed";

/**
 * Derived from data we already have — no separate status field to keep in sync.
 * Draft: nobody's been invited yet. Completed: the date has passed. Otherwise upcoming.
 */
export function eventStatus(invite: { date: string }, familyCount: number): EventStatus {
  if (familyCount === 0) return "draft";
  const d = parseDate(invite.date);
  if (d) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return "completed";
  }
  return "upcoming";
}

export function mapsHref(mapUrl: string, address: string): string {
  if (/^https?:\/\//i.test(mapUrl)) return mapUrl;
  if (!address.trim()) return "";
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address.replace(/\n/g, ", "));
}
