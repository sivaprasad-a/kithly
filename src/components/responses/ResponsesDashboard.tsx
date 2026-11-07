"use client";

import { Fragment, useState } from "react";
import { Check, ClipboardCopy, Sparkles, UserRound, Users, Baby } from "lucide-react";
import { AI_NAME } from "@/config/brand";
import { fmtLongDate } from "@/lib/format";
import type { EventDoc, RsvpDoc } from "@/lib/schemas";
import { tallyRsvps } from "@/lib/tally";

const STATUS = {
  yes: ["Attending", "bg-[#E6EFE1] text-[#3E5B33]"],
  maybe: ["Maybe", "bg-[#FFF1CC] text-[#7A5A06]"],
  no: ["Declined", "bg-[#F6E2DC] text-[#8E3A27]"],
} as const;

export function ResponsesDashboard({ event, rsvps }: { event: EventDoc; rsvps: RsvpDoc[] }) {
  const { invite } = event;
  const t = tallyRsvps(invite, event.families, rsvps);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const sorted = [...rsvps].sort((a, b) => b.submittedAt - a.submittedAt);
  const pct = t.invited ? Math.round((t.replied / t.invited) * 100) : 0;

  async function copySheet() {
    const rows = [
      ["Family", "Contact", "Status", "Adults", "Kids", "Veg", "Non-veg", "Soft drinks", "Bar", "Diet", "Note", "Replied"],
      ...sorted.map((r) => [r.familyName, r.contact, r.status, r.adults, r.kids, r.veg, r.nonveg, r.softDrinks.join("; "), r.alcohol.join("; "), r.diet, r.note, new Date(r.submittedAt).toISOString()]),
    ];
    const tsv = rows.map((r) => r.map((c) => String(c ?? "").replace(/[\t\n]/g, " ")).join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const stats = [
    { icon: Users, bg: "#FFF3D1", fg: "#B98608", value: t.guests, label: `Guests coming${t.maybeGuests ? ` · +${t.maybeGuests} maybe` : ""}` },
    { icon: Check, bg: "#E8EEE4", fg: "#5D7052", value: `${t.replied}/${t.invited}`, label: "Families replied" },
    { icon: UserRound, bg: "#E4ECEB", fg: "#10383A", value: t.adults, label: "Adults" },
    { icon: Baby, bg: "#F3EFE3", fg: "#666E51", value: t.kids, label: "Kids" },
    { icon: null, bg: "#E6F0E0", fg: "#4E8A3A", value: t.veg, label: "Veg meals" },
    { icon: null, bg: "#F6E3DE", fg: "#B5452F", value: t.nonveg, label: "Non-veg meals" },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-serif text-4xl leading-none">Guest responses</h1>
          <p className="mt-1.5 text-sm text-muted">
            {invite.title}
            {invite.date && ` · ${fmtLongDate(invite.date)}`}
          </p>
        </div>
        <button onClick={copySheet} disabled={!rsvps.length} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-teal px-3 py-1.5 text-[13px] text-teal disabled:opacity-40">
          {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
          {copied ? "Copied — paste into Sheets" : "Copy as spreadsheet"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3.5 rounded-[18px] bg-white p-4 shadow-[0_10px_30px_-22px_rgba(16,56,58,.5)]">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-xl" style={{ background: s.bg, color: s.fg }}>
              {s.icon ? <s.icon className="size-5" /> : <span className="grid size-4 place-items-center rounded-[3px] border-2 border-current"><span className="size-1.5 rounded-full bg-current" /></span>}
            </span>
            <div>
              <b className="block font-serif text-[32px] font-medium leading-none">{s.value}</b>
              <span className="text-[12.5px] text-muted">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Replies" badge={t.replied} right={<Progress pct={pct} label={`${t.replied}/${t.invited}`} />}>
          <div className="mb-2 flex flex-wrap gap-4 text-[13px] text-muted">
            <Legend color="#7FB069">{t.yes} attending</Legend>
            <Legend color="#DAA112">{t.maybe} maybe</Legend>
            <Legend color="#C8553D">{t.no} declined</Legend>
          </div>
          <div className="my-2.5 flex h-3 overflow-hidden rounded-full bg-[#EEF0EB]">
            {t.replied > 0 && (
              <>
                <span style={{ width: `${(t.yes / t.replied) * 100}%`, background: "#7FB069" }} />
                <span style={{ width: `${(t.maybe / t.replied) * 100}%`, background: "#DAA112" }} />
                <span style={{ width: `${(t.no / t.replied) * 100}%`, background: "#C8553D" }} />
              </>
            )}
          </div>
          <p className="mt-4 text-sm font-medium">
            Still waiting on <span className="rounded-md bg-cream px-2 py-0.5 text-xs text-olive">{t.pending.length}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.pending.length ? t.pending.map((f) => <span key={f.id} className="rounded-full bg-cream px-3 py-1 text-[13px]">{f.name}</span>) : <span className="text-[13px] text-muted">{event.families.length ? "Everyone on your list has replied 🎉" : "Add families in the editor to track who's pending."}</span>}
          </div>
        </Panel>

        <Panel title="Soft drinks" right={<span className="text-xs text-slate">families who picked it</span>}>
          <Bars rows={t.softDrinks} color="#809276" empty="No soft drinks listed" />
        </Panel>

        {invite.alcoholOn ? (
          <Panel title="Bar" right={<span className="text-xs text-slate">families who picked it</span>}>
            <Bars rows={t.alcohol} color="#666E51" empty="No drinks listed" />
          </Panel>
        ) : (
          <ShoppingNote t={t} />
        )}
        {invite.alcoholOn && <ShoppingNote t={t} />}
      </div>

      <div className="overflow-auto rounded-[20px] bg-white shadow-[0_10px_30px_-22px_rgba(16,56,58,.5)]">
        <table className="w-full min-w-[820px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-paper text-left text-[11.5px] uppercase tracking-[0.1em] text-muted">
              {["Family", "Status", "Adults", "Kids", "Veg / Non-veg", "Drinks", "Notes"].map((h) => (
                <th key={h} className="border-b border-teal/10 px-4 py-3.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <Fragment key={r.id}>
                <tr className="cursor-pointer hover:bg-[#FBFAF5]" tabIndex={0} aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(open === r.id ? null : r.id))}>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">
                    <b className="block font-medium">{r.familyName}</b>
                    <small className="text-muted">{r.contact}</small>
                  </td>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">
                    <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span>
                  </td>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">{r.adults}</td>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">{r.kids}</td>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">
                    {r.status === "no" ? "—" : (
                      <>
                        <span className="text-veg">{r.veg}</span> / <span className="text-nonveg">{r.nonveg}</span>
                      </>
                    )}
                  </td>
                  <td className="border-b border-teal/5 px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {[...r.softDrinks, ...r.alcohol.filter((x) => x !== "None")].map((x) => (
                        <span key={x} className="rounded-md bg-cream px-1.5 py-0.5 text-xs">{x}</span>
                      ))}
                    </div>
                  </td>
                  <td className="max-w-[240px] border-b border-teal/5 px-4 py-3 align-top">{r.diet ? `⚠ ${r.diet}` : r.note || "—"}</td>
                </tr>
                {open === r.id && (
                  <tr className="bg-[#FBFAF5]">
                    <td colSpan={7} className="border-b border-teal/5 px-4 py-4">
                      <dl className="grid gap-3.5 sm:grid-cols-3">
                        {[
                          ["Contact", r.contact],
                          ["Replied", new Date(r.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })],
                          ["Soft drinks", r.softDrinks.join(", ")],
                          ["Bar", r.alcohol.join(", ")],
                          ["Allergies / diet", r.diet],
                          ["Note to you", r.note],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[11px] uppercase tracking-[0.1em] text-muted">{k}</dt>
                            <dd>{v || "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!sorted.length && <p className="p-10 text-center text-muted">No replies yet — share your invite to get started.</p>}
      </div>
    </div>
  );
}

function Panel({ title, badge, right, children }: { title: string; badge?: number; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(16,56,58,.5)]">
      <div className="mb-3.5 flex items-center gap-2.5">
        <h2 className="text-[17px] font-medium">{title}</h2>
        {badge !== undefined && <span className="rounded-md bg-cream px-2 py-0.5 text-xs text-olive">{badge}</span>}
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </section>
  );
}
const Legend = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span className="flex items-center gap-1.5">
    <i className="size-2.5 rounded-[3px]" style={{ background: color }} />
    {children}
  </span>
);
const Progress = ({ pct, label }: { pct: number; label: string }) => (
  <span className="flex items-center gap-2 text-xs text-muted">
    {label}
    <i className="block h-1.5 w-28 overflow-hidden rounded-full bg-[#EEF0EB]">
      <b className="block h-full rounded-full bg-gradient-to-r from-[#E9C25A] to-gold" style={{ width: `${pct}%` }} />
    </i>
  </span>
);
function Bars({ rows, color, empty }: { rows: Array<[string, number]>; color: string; empty: string }) {
  if (!rows.length) return <p className="text-sm text-slate">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="grid gap-2.5">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(90px,1fr)_2fr_28px] items-center gap-2.5 text-[13.5px]">
          <span>{k}</span>
          <span className="h-2 overflow-hidden rounded-full bg-[#EEF0EB]">
            <b className="block h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: color }} />
          </span>
          <span className="text-right font-medium">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** Quick shopping maths with a 10% buffer — the seed of the AI co-host's planning features. */
function ShoppingNote({ t }: { t: ReturnType<typeof tallyRsvps> }) {
  const buffer = (n: number) => (n ? Math.ceil(n * 1.1) : 0);
  const items = [
    t.veg && `${buffer(t.veg)} veg plates`,
    t.nonveg && `${buffer(t.nonveg)} non-veg plates`,
    t.kids && `${t.kids * 2} juice boxes / kid-friendly drinks`,
    t.guests && `${Math.ceil(t.guests * 0.75)} L of soft drinks & water`,
  ].filter(Boolean) as string[];
  return (
    <section className="rounded-[20px] bg-teal p-5 text-white shadow-[0_10px_30px_-22px_rgba(16,56,58,.5)]">
      <h2 className="flex items-center gap-2 text-[17px] font-medium">
        <Sparkles className="size-4 text-gold" /> {AI_NAME}&apos;s shopping list
      </h2>
      {items.length ? (
        <ul className="mt-3 grid gap-1.5 text-sm text-white/85">
          {items.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-white/70">Appears once guests start replying.</p>
      )}
      {t.allergies.length > 0 && <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-[13px]">⚠ {t.allergies.length} famil{t.allergies.length > 1 ? "ies" : "y"} mentioned allergies — check the table.</p>}
      <p className="mt-3 text-[11.5px] text-white/50">Includes a 10% buffer.</p>
    </section>
  );
}
