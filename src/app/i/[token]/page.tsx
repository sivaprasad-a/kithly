import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InviteCard } from "@/components/invite/InviteCard";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { repo } from "@/lib/db/repo";

export const metadata: Metadata = { title: "You're invited", robots: { index: false, follow: false } };

async function Invitation({ params }: { params: PageProps<"/i/[token]">["params"] }) {
  const { token } = await params;
  const found = await repo.findByToken(token);
  if (!found) notFound();
  const { event, family } = found;
  const existing = family ? await repo.getRsvp(event.id, family.id) : null;

  return (
    <div className="flex flex-wrap items-start justify-center gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-lg shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)] lg:sticky lg:top-8">
        <InviteCard invite={event.invite} cta={<a className="rsvp" href="#rsvp">RSVP</a>} />
      </div>
      <div id="rsvp" className="w-full max-w-[460px] scroll-mt-6">
        <RsvpForm token={token} invite={event.invite} familyName={family?.name ?? null} existing={existing} />
      </div>
    </div>
  );
}

/** Guests land here from their WhatsApp / email / Instagram link. No account needed. */
export default function GuestInvitePage({ params }: PageProps<"/i/[token]">) {
  return (
    <main className="stage-bg min-h-dvh">
      <Suspense fallback={<div className="mx-auto h-[80dvh] max-w-[520px] animate-pulse" />}>
        <Invitation params={params} />
      </Suspense>
    </main>
  );
}
