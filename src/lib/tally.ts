import type { Family, Invite, RsvpDoc } from "@/lib/schemas";

export type Tally = {
  replied: number;
  invited: number;
  yes: number;
  maybe: number;
  no: number;
  adults: number;
  kids: number;
  guests: number;
  maybeGuests: number;
  veg: number;
  nonveg: number;
  softDrinks: Array<[string, number]>;
  alcohol: Array<[string, number]>;
  pending: Family[];
  allergies: Array<{ family: string; diet: string }>;
};

/** Pure summary of RSVPs — the numbers behind the host dashboard. */
export function tallyRsvps(invite: Pick<Invite, "softDrinks" | "alcohol" | "alcoholOn">, families: Family[], rsvps: RsvpDoc[]): Tally {
  const going = rsvps.filter((r) => r.status === "yes");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const sum = (rows: RsvpDoc[], k: "adults" | "kids" | "veg" | "nonveg") => rows.reduce((a, r) => a + (r[k] || 0), 0);

  const count = (options: string[], key: "softDrinks" | "alcohol") => {
    const m = new Map<string, number>(options.map((o) => [o, 0]));
    for (const r of [...going, ...maybe]) for (const x of r[key]) if (x !== "None") m.set(x, (m.get(x) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const repliedFamilies = new Set(rsvps.map((r) => r.familyId));
  const adults = sum(going, "adults");
  const kids = sum(going, "kids");

  return {
    replied: rsvps.length,
    invited: Math.max(families.length, rsvps.length),
    yes: going.length,
    maybe: maybe.length,
    no: rsvps.length - going.length - maybe.length,
    adults,
    kids,
    guests: adults + kids,
    maybeGuests: sum(maybe, "adults") + sum(maybe, "kids"),
    veg: sum(going, "veg"),
    nonveg: sum(going, "nonveg"),
    softDrinks: count(invite.softDrinks, "softDrinks"),
    alcohol: invite.alcoholOn ? count(invite.alcohol, "alcohol") : [],
    pending: families.filter((f) => !repliedFamilies.has(f.id)),
    allergies: rsvps.filter((r) => r.diet.trim()).map((r) => ({ family: r.familyName, diet: r.diet })),
  };
}

/** Server-side guard: make an RSVP consistent with the host's rules. */
export function normaliseRsvp<T extends { status: string; adults: number; kids: number; veg: number; nonveg: number; alcohol: string[]; softDrinks: string[] }>(
  input: T,
  invite: Pick<Invite, "maxPerFamily" | "kidsWelcome" | "veg" | "nonveg" | "alcoholOn" | "alcohol" | "softDrinks">,
): { ok: true; value: T } | { ok: false; error: string } {
  const r = { ...input };
  if (r.status === "no") {
    return { ok: true, value: { ...r, adults: 0, kids: 0, veg: 0, nonveg: 0, alcohol: [], softDrinks: [] } };
  }
  if (!invite.kidsWelcome) r.kids = 0;
  const heads = r.adults + r.kids;
  if (heads < 1) return { ok: false, error: "Add at least one guest." };
  if (heads > invite.maxPerFamily) return { ok: false, error: `The host is keeping it to ${invite.maxPerFamily} per family.` };
  if (!invite.veg) r.veg = 0;
  if (!invite.nonveg) r.nonveg = 0;
  if (r.veg + r.nonveg > heads) return { ok: false, error: "More meals than guests." };
  r.softDrinks = r.softDrinks.filter((d) => invite.softDrinks.includes(d));
  r.alcohol = invite.alcoholOn && r.adults > 0 ? r.alcohol.filter((d) => d === "None" || invite.alcohol.includes(d)) : [];
  return { ok: true, value: r };
}
