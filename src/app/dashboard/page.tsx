import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, Plus, Users } from "lucide-react";
import { HostHeader } from "@/components/ui/HostHeader";
import { buttonClass } from "@/components/ui/Button";
import { TEMPLATES } from "@/components/invite/templates";
import { createEvent } from "@/lib/actions";
import { repo, usingMemoryStore } from "@/lib/db/repo";
import { fmtLongDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { EVENT_TYPES } from "@/lib/schemas";

export const metadata = { title: "Your events" };

async function EventList() {
  const user = await requireUser("/dashboard");
  const events = await repo.listEvents(user.id);
  const counts = await Promise.all(events.map((e) => repo.listRsvps(e.id)));

  if (!events.length) {
    return (
      <div className="rounded-3xl border border-dashed border-teal/20 bg-white/60 p-12 text-center">
        <p className="font-serif text-3xl">Your first celebration starts here</p>
        <p className="mt-2 text-muted">Birthdays, anniversaries, baby showers — whatever brings your circle together.</p>
        <form action={createEvent} className="mt-6">
          <button className={buttonClass("gold")}>
            <Plus className="size-4" /> Create an invite
          </button>
        </form>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e, i) => {
        const tpl = TEMPLATES.find((t) => t.id === e.invite.template)!;
        const going = counts[i].filter((r) => r.status === "yes").reduce((a, r) => a + r.adults + r.kids, 0);
        return (
          <li key={e.id} className="overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_-22px_rgba(16,56,58,.5)]">
            <Link href={`/events/${e.id}/edit`} className="block">
              <div
                className="grid h-32 place-items-center px-4 text-center"
                style={{
                  background: e.invite.template === "custom" && e.invite.bgImage ? `center/cover url(${e.invite.bgImage})` : tpl.swatch,
                  color: tpl.ink,
                }}
              >
                <div>
                  <p className="eyebrow opacity-80">{e.invite.kicker || EVENT_TYPES[e.invite.type].label}</p>
                  <p className="mt-1 font-serif text-2xl">{e.invite.title}</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4 px-4 py-3 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {fmtLongDate(e.invite.date) || "Date not set"}
              </span>
            </div>
            <div className="flex items-center gap-2 border-t border-teal/5 px-4 py-3">
              <span className="mr-auto flex items-center gap-1.5 text-sm">
                <Users className="size-4 text-sage" />
                {going} coming · {counts[i].length}/{Math.max(e.families.length, counts[i].length)} replied
              </span>
              <Link href={`/events/${e.id}/responses`} className={buttonClass("ghost", "sm")}>
                Responses
              </Link>
              <Link href={`/events/${e.id}/edit`} className={buttonClass("outline", "sm")}>
                Edit
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Dashboard() {
  return (
    <>
      <HostHeader
        actions={
          <form action={createEvent}>
            <button className={buttonClass("gold", "sm")}>
              <Plus className="size-4" /> New invite
            </button>
          </form>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">Your celebrations</h1>
        <p className="mb-8 mt-1 text-muted">Every invite you&apos;ve made, and who&apos;s coming.</p>
        {usingMemoryStore && (
          <p className="mb-6 rounded-xl border border-gold/40 bg-[#FFF6DC] px-4 py-2.5 text-sm text-[#6E5208]">
            Running without a database — data resets when the dev server restarts. Set <code>MONGODB_URI</code> in{" "}
            <code>.env.local</code> to keep it.
          </p>
        )}
        <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-white/60" />}>
          <EventList />
        </Suspense>
      </main>
    </>
  );
}
