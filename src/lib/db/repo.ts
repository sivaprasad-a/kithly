import "server-only";
import type { EventDoc, Family, RsvpDoc } from "@/lib/schemas";
import { getMongo, hasMongo } from "./mongo-client";

/**
 * Data access for events and RSVPs. Two drivers behind one interface:
 *  - MongoDB (local Docker or Atlas free tier) when MONGODB_URI is set
 *  - an in-memory store otherwise, so `npm run dev` works with zero setup
 *    (data resets when the server restarts).
 */
export interface Repo {
  listEvents(ownerId: string): Promise<EventDoc[]>;
  getEvent(id: string): Promise<EventDoc | null>;
  createEvent(doc: EventDoc): Promise<void>;
  updateEvent(id: string, patch: Partial<Pick<EventDoc, "invite" | "families" | "updatedAt">>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  /** Resolves either a family's personal token or the event's open token. */
  findByToken(token: string): Promise<{ event: EventDoc; family: Family | null } | null>;
  listRsvps(eventId: string): Promise<RsvpDoc[]>;
  getRsvp(eventId: string, familyId: string): Promise<RsvpDoc | null>;
  upsertRsvp(rsvp: RsvpDoc): Promise<void>;
  deleteRsvpsForFamily(eventId: string, familyId: string): Promise<void>;
}

/* ---------------- Memory driver ---------------- */
type MemState = { events: Map<string, EventDoc>; rsvps: Map<string, RsvpDoc> };
const g = globalThis as unknown as { __memRepo?: MemState };
const mem = (g.__memRepo ??= { events: new Map(), rsvps: new Map() });
const rkey = (eventId: string, familyId: string) => `${eventId}:${familyId}`;
const copy = <T,>(v: T): T => structuredClone(v);

const memoryRepo: Repo = {
  async listEvents(ownerId) {
    return [...mem.events.values()].filter((e) => e.ownerId === ownerId).sort((a, b) => b.updatedAt - a.updatedAt).map(copy);
  },
  async getEvent(id) {
    const e = mem.events.get(id);
    return e ? copy(e) : null;
  },
  async createEvent(doc) {
    mem.events.set(doc.id, copy(doc));
  },
  async updateEvent(id, patch) {
    const e = mem.events.get(id);
    if (e) mem.events.set(id, { ...e, ...copy(patch) });
  },
  async deleteEvent(id) {
    mem.events.delete(id);
    for (const [k, r] of mem.rsvps) if (r.eventId === id) mem.rsvps.delete(k);
  },
  async findByToken(token) {
    for (const e of mem.events.values()) {
      if (e.openToken === token) return { event: copy(e), family: null };
      const f = e.families.find((x: Family) => x.token === token);
      if (f) return { event: copy(e), family: copy(f) };
    }
    return null;
  },
  async listRsvps(eventId) {
    return [...mem.rsvps.values()].filter((r) => r.eventId === eventId).map(copy);
  },
  async getRsvp(eventId, familyId) {
    const r = mem.rsvps.get(rkey(eventId, familyId));
    return r ? copy(r) : null;
  },
  async upsertRsvp(rsvp) {
    mem.rsvps.set(rkey(rsvp.eventId, rsvp.familyId), copy(rsvp));
  },
  async deleteRsvpsForFamily(eventId, familyId) {
    mem.rsvps.delete(rkey(eventId, familyId));
  },
};

/* ---------------- Mongo driver ---------------- */
type EventRow = Omit<EventDoc, "id"> & { _id: string };
type RsvpRow = Omit<RsvpDoc, "id"> & { _id: string };
const fromEvent = ({ _id, ...rest }: EventRow): EventDoc => ({ id: _id, ...rest });
const fromRsvp = ({ _id, ...rest }: RsvpRow): RsvpDoc => ({ id: _id, ...rest });

let indexesReady: Promise<unknown> | null = null;
function collections() {
  const { db } = getMongo();
  const events = db.collection<EventRow>("events");
  const rsvps = db.collection<RsvpRow>("rsvps");
  indexesReady ??= Promise.all([
    events.createIndex({ ownerId: 1, updatedAt: -1 }),
    events.createIndex({ openToken: 1 }, { unique: true }),
    events.createIndex({ "families.token": 1 }),
    rsvps.createIndex({ eventId: 1, familyId: 1 }, { unique: true }),
  ]).catch((e) => {
    indexesReady = null;
    console.error("[db] index creation failed", e);
  });
  return { events, rsvps };
}

const mongoRepo: Repo = {
  async listEvents(ownerId) {
    const { events } = collections();
    const rows = await events.find({ ownerId }).sort({ updatedAt: -1 }).toArray();
    return rows.map(fromEvent);
  },
  async getEvent(id) {
    const row = await collections().events.findOne({ _id: id });
    return row ? fromEvent(row) : null;
  },
  async createEvent({ id, ...rest }) {
    await collections().events.insertOne({ _id: id, ...rest });
  },
  async updateEvent(id, patch) {
    await collections().events.updateOne({ _id: id }, { $set: patch });
  },
  async deleteEvent(id) {
    const { events, rsvps } = collections();
    await Promise.all([events.deleteOne({ _id: id }), rsvps.deleteMany({ eventId: id })]);
  },
  async findByToken(token) {
    const row = await collections().events.findOne({ $or: [{ openToken: token }, { "families.token": token }] });
    if (!row) return null;
    const event = fromEvent(row);
    return { event, family: event.openToken === token ? null : (event.families.find((f) => f.token === token) ?? null) };
  },
  async listRsvps(eventId) {
    return (await collections().rsvps.find({ eventId }).toArray()).map(fromRsvp);
  },
  async getRsvp(eventId, familyId) {
    const row = await collections().rsvps.findOne({ eventId, familyId });
    return row ? fromRsvp(row) : null;
  },
  async upsertRsvp({ id, ...rest }) {
    await collections().rsvps.updateOne(
      { eventId: rest.eventId, familyId: rest.familyId },
      { $set: rest, $setOnInsert: { _id: id } },
      { upsert: true },
    );
  },
  async deleteRsvpsForFamily(eventId, familyId) {
    await collections().rsvps.deleteMany({ eventId, familyId });
  },
};

if (!hasMongo() && process.env.VERCEL) {
  console.error("[db] MONGODB_URI is not set on Vercel — falling back to the in-memory store, which does not persist between requests.");
}

export const repo: Repo = hasMongo() ? mongoRepo : memoryRepo;
export const usingMemoryStore = !hasMongo();
