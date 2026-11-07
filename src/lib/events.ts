import "server-only";
import { notFound } from "next/navigation";
import { repo } from "@/lib/db/repo";
import { requireUser } from "@/lib/session";

/** Loads an event the signed-in host owns, or 404s. */
export async function loadOwnedEvent(id: string, next: string) {
  const user = await requireUser(next);
  const event = await repo.getEvent(id);
  if (!event || event.ownerId !== user.id) notFound();
  return event;
}
