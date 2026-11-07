import { describe, expect, it } from "vitest";
import { defaultInvite, type Family, type RsvpDoc } from "@/lib/schemas";
import { normaliseRsvp, tallyRsvps } from "@/lib/tally";

const invite = { ...defaultInvite(), alcoholOn: true, alcohol: ["Beer", "Red wine"], softDrinks: ["Coke", "Juice"] };
const families: Family[] = [
  { id: "a", name: "The Sharmas", token: "t1" },
  { id: "b", name: "The Reddys", token: "t2" },
  { id: "c", name: "The Patels", token: "t3" },
];
const rsvp = (p: Partial<RsvpDoc>): RsvpDoc => ({
  id: Math.random().toString(36),
  eventId: "e",
  familyId: "a",
  familyName: "x",
  contact: "",
  status: "yes",
  adults: 2,
  kids: 0,
  veg: 2,
  nonveg: 0,
  softDrinks: [],
  alcohol: [],
  diet: "",
  note: "",
  submittedAt: 0,
  ...p,
});

describe("tallyRsvps", () => {
  const rows = [
    rsvp({ familyId: "a", adults: 2, kids: 2, veg: 4, softDrinks: ["Juice"], diet: "No nuts" }),
    rsvp({ familyId: "b", adults: 2, veg: 1, nonveg: 1, softDrinks: ["Coke", "Juice"], alcohol: ["Beer"] }),
    rsvp({ familyId: "x", status: "maybe", adults: 1, kids: 1, alcohol: ["None"] }),
  ];
  const t = tallyRsvps(invite, families, rows);

  it("counts only confirmed guests in headcount", () => {
    expect(t.guests).toBe(6);
    expect(t.adults).toBe(4);
    expect(t.kids).toBe(2);
    expect(t.maybeGuests).toBe(2);
  });
  it("sums meals from attending families", () => {
    expect(t.veg).toBe(5);
    expect(t.nonveg).toBe(1);
  });
  it("tallies drinks and ignores 'None'", () => {
    expect(Object.fromEntries(t.softDrinks)).toEqual({ Juice: 2, Coke: 1 });
    expect(Object.fromEntries(t.alcohol)).toEqual({ Beer: 1, "Red wine": 0 });
  });
  it("lists families who haven't replied", () => {
    expect(t.pending.map((f) => f.name)).toEqual(["The Patels"]);
    expect(t.invited).toBe(3);
  });
  it("collects allergies", () => {
    expect(t.allergies).toEqual([{ family: "x", diet: "No nuts" }]);
  });
});

describe("normaliseRsvp", () => {
  const base = { status: "yes", adults: 2, kids: 1, veg: 2, nonveg: 1, softDrinks: ["Coke"], alcohol: ["Beer"] };

  it("enforces the per-family limit", () => {
    const r = normaliseRsvp({ ...base, adults: 4, kids: 2 }, { ...invite, maxPerFamily: 4 });
    expect(r.ok).toBe(false);
  });
  it("zeroes everything for a decline", () => {
    const r = normaliseRsvp({ ...base, status: "no" }, invite);
    expect(r.ok && r.value).toMatchObject({ adults: 0, kids: 0, veg: 0, alcohol: [] });
  });
  it("drops kids when the host said adults only", () => {
    const r = normaliseRsvp({ ...base, nonveg: 0 }, { ...invite, kidsWelcome: false });
    expect(r.ok && r.value.kids).toBe(0);
  });
  it("strips drinks the host doesn't serve", () => {
    const r = normaliseRsvp({ ...base, softDrinks: ["Coke", "Hacked"], alcohol: ["Beer", "Tequila"] }, invite);
    expect(r.ok && r.value.softDrinks).toEqual(["Coke"]);
    expect(r.ok && r.value.alcohol).toEqual(["Beer"]);
  });
  it("rejects more meals than guests", () => {
    expect(normaliseRsvp({ ...base, veg: 5 }, invite).ok).toBe(false);
  });
});
