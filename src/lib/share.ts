import type { Invite } from "@/lib/schemas";
import { fmtLongDate, fmtShortDate, fmtTime } from "@/lib/format";

/** The message a host sends. Same text for WhatsApp, email and Instagram. */
export function shareMessage(invite: Invite, link: string, familyName?: string): string {
  const greeting = familyName ? `Dear ${familyName},\n\n` : "";
  const when = [fmtLongDate(invite.date), fmtTime(invite.start)].filter(Boolean).join(", ");
  const where = [invite.venue, invite.address.replace(/\n/g, ", ")].filter(Boolean).join(" · ");
  const lines = [
    `${greeting}${invite.kicker ? invite.kicker + " — " : ""}${invite.title}`,
    "",
    invite.from ? `${invite.from} would love for you to join us.` : "We would love for you to join us.",
    when ? `🗓 ${when}` : null,
    where ? `📍 ${where}` : null,
    "",
    `${invite.rsvpBy ? `Kindly RSVP by ${fmtShortDate(invite.rsvpBy)}` : "Kindly RSVP"}:`,
    link,
  ];
  return lines.filter((l): l is string => typeof l === "string").join("\n").replace(/\n{3,}/g, "\n\n");
}

export const whatsappHref = (msg: string) => "https://wa.me/?text=" + encodeURIComponent(msg);
export const mailtoHref = (subject: string, msg: string) =>
  "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
