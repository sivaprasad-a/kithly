import "server-only";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { EVENT_TYPES, type Invite } from "@/lib/schemas";
import { fmtLongDate } from "@/lib/format";

export const TONES = ["warm", "fun", "elegant", "traditional"] as const;
export const LANGUAGES = ["English", "Telugu", "Hindi"] as const;
export type Tone = (typeof TONES)[number];
export type Language = (typeof LANGUAGES)[number];

/**
 * Picks whichever AI key is present.
 *  - GOOGLE_GENERATIVE_AI_API_KEY: Gemini has a free tier — best for dev.
 *  - ANTHROPIC_API_KEY: Claude, pay-as-you-go.
 * With neither, built-in templates keep the feature working offline.
 */
function pickModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return google(process.env.AI_MODEL || "gemini-flash-latest");
  if (process.env.ANTHROPIC_API_KEY) return anthropic(process.env.AI_MODEL || "claude-haiku-5-5");
  return null;
}

export function aiConfigured() {
  return pickModel() !== null;
}

type Brief = Pick<Invite, "type" | "title" | "honoree" | "from" | "date" | "venue" | "favourites">;

export async function suggestMessages(brief: Brief, tone: Tone, language: Language): Promise<{ messages: string[]; source: "ai" | "template" }> {
  const model = pickModel();
  if (!model) return { messages: templateMessages(brief, tone), source: "template" };

  const prompt = [
    `Write 3 short invitation notes (2–3 sentences each, under 60 words) for a ${EVENT_TYPES[brief.type].label}.`,
    `Tone: ${tone}. Language: ${language}${language !== "English" ? " (in its own script)" : ""}.`,
    `It is an intimate gathering for close family and friends only.`,
    `Event: "${brief.title}"${brief.honoree ? `, celebrating ${brief.honoree}` : ""}.`,
    brief.from && `Hosts: ${brief.from}.`,
    brief.date && `Date: ${fmtLongDate(brief.date)}.`,
    brief.favourites.theme && `Theme: ${brief.favourites.theme}.`,
    `Don't repeat the date, time or address — those appear elsewhere on the card. No hashtags. Emojis only if the tone is fun.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { output } = await generateText({
      model,
      prompt,
      output: Output.object({ schema: z.object({ messages: z.array(z.string()).min(1).max(3) }) }),
    });
    return { messages: output.messages.map((m) => m.trim()).filter(Boolean), source: "ai" };
  } catch (err) {
    console.error("[ai] suggestion failed, using templates", err);
    return { messages: templateMessages(brief, tone), source: "template" };
  }
}

function templateMessages(b: Brief, tone: Tone): string[] {
  const who = b.honoree || b.title;
  const by: Record<Tone, string[]> = {
    warm: [
      `We're keeping it small and full of love — just the people who mean the most to us. Come celebrate ${who} with us.`,
      `Nothing fancy, just good food, familiar faces and a lot of hugs. We'd be so happy to have you there.`,
      `You've been part of our story, so we couldn't celebrate without you. Join us for an evening together.`,
    ],
    fun: [
      `Cake? ✔️ Good company? ✔️ You? That's the missing piece! 🎉 Come party with us.`,
      `Clear your calendar and bring your appetite — ${who} is celebrating and you're on the VIP list! 🥳`,
      `Small guest list, big fun. We saved a spot just for you — don't make us eat all the cake alone.`,
    ],
    elegant: [
      `It would be our honour to share this occasion with you, among our dearest family and friends.`,
      `We request the pleasure of your company for an intimate celebration of ${who}.`,
      `An evening of good company and quiet joy — we would be delighted if you could join us.`,
    ],
    traditional: [
      `With the blessings of our elders, we warmly invite you and your family to celebrate ${who} with us.`,
      `Your presence and blessings will make this occasion complete. Please join us with your family.`,
      `We cordially invite you to grace this joyous occasion and shower your blessings on ${who}.`,
    ],
  };
  return by[tone];
}
