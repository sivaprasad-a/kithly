import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LANGUAGES, suggestMessages, TONES } from "@/lib/ai";
import { FavouritesSchema, InviteSchema } from "@/lib/schemas";

const Body = z.object({
  brief: InviteSchema.pick({ type: true, title: true, honoree: true, from: true, date: true, venue: true }).extend({
    favourites: FavouritesSchema,
  }),
  tone: z.enum(TONES),
  language: z.enum(LANGUAGES),
});

/** POST /api/ai/suggest — hosts only, so the AI key can't be used by strangers. */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });

  const { brief, tone, language } = parsed.data;
  return Response.json(await suggestMessages(brief, tone, language));
}
