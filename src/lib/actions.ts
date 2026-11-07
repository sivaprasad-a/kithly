"use server";

import { nanoid } from "nanoid";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { repo } from "@/lib/db/repo";
import { requireUser } from "@/lib/session";
import { defaultInvite, InviteSchema, RsvpInputSchema, type EventDoc, type Family, type Invite, type RsvpInput } from "@/lib/schemas";
import { normaliseRsvp } from "@/lib/tally";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const token = () => nanoid(12);

async function ownedEvent(eventId: string): Promise<EventDoc> {
  const user = await requireUser();
  const event = await repo.getEvent(eventId);
  if (!event || event.ownerId !== user.id) throw new Error("Event not found");
  return event;
}

/* ---------------- Host ---------------- */

export async function createEvent(): Promise<void> {
  const user = await requireUser();
  const now = Date.now();
  const id = nanoid(10);
  const invite = defaultInvite();
  if (user.name) invite.from = user.name;
  await repo.createEvent({ id, ownerId: user.id, invite, families: [], openToken: token(), createdAt: now, updatedAt: now });
  redirect(`/events/${id}/edit`);
}

export async function saveInvite(eventId: string, invite: Invite): Promise<Result<{ savedAt: number }>> {
  const parsed = InviteSchema.safeParse(invite);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Some details look off" };
  await ownedEvent(eventId);
  const savedAt = Date.now();
  await repo.updateEvent(eventId, { invite: parsed.data, updatedAt: savedAt });
  return { ok: true, data: { savedAt } };
}

export async function addFamily(eventId: string, name: string): Promise<Result<Family[]>> {
  const clean = name.trim().slice(0, 80);
  if (!clean) return { ok: false, error: "Add a family name" };
  const event = await ownedEvent(eventId);
  if (event.families.some((f) => f.name.toLowerCase() === clean.toLowerCase())) return { ok: false, error: "Already on your list" };
  if (event.families.length >= 200) return { ok: false, error: "That's a big circle! 200 families max." };
  const families = [...event.families, { id: nanoid(8), name: clean, token: token() }];
  await repo.updateEvent(eventId, { families, updatedAt: Date.now() });
  return { ok: true, data: families };
}

export async function removeFamily(eventId: string, familyId: string): Promise<Result<Family[]>> {
  const event = await ownedEvent(eventId);
  const families = event.families.filter((f) => f.id !== familyId);
  await repo.updateEvent(eventId, { families, updatedAt: Date.now() });
  await repo.deleteRsvpsForFamily(eventId, familyId);
  return { ok: true, data: families };
}

export async function deleteEvent(eventId: string): Promise<void> {
  await ownedEvent(eventId);
  await repo.deleteEvent(eventId);
  redirect("/dashboard");
}

/* ---------------- Guest (no account needed) ---------------- */

export async function submitRsvp(inviteToken: string, input: RsvpInput): Promise<Result<{ familyName: string }>> {
  const parsed = RsvpInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your reply" };

  const found = await repo.findByToken(inviteToken);
  if (!found) return { ok: false, error: "This invitation link is no longer active." };
  const { event } = found;

  const checked = normaliseRsvp(parsed.data, event.invite);
  if (!checked.ok) return checked;

  // Personal link → that family. Open link → match by name, or add them to the list.
  let family = found.family;
  if (!family) {
    const name = parsed.data.familyName.trim();
    family = event.families.find((f) => f.name.toLowerCase() === name.toLowerCase()) ?? null;
    if (!family) {
      family = { id: nanoid(8), name, token: token() };
      await repo.updateEvent(event.id, { families: [...event.families, family] });
    }
  }

  const existing = await repo.getRsvp(event.id, family.id);
  await repo.upsertRsvp({
    ...checked.value,
    familyName: found.family ? found.family.name : checked.value.familyName,
    id: existing?.id ?? nanoid(12),
    eventId: event.id,
    familyId: family.id,
    submittedAt: Date.now(),
  });
  refresh();
  return { ok: true, data: { familyName: family.name } };
}
