import { Suspense } from "react";
import { ResponsesDashboard } from "@/components/responses/ResponsesDashboard";
import { repo } from "@/lib/db/repo";
import { loadOwnedEvent } from "@/lib/events";

export const metadata = { title: "Responses" };

async function Responses({ params }: { params: PageProps<"/events/[id]/responses">["params"] }) {
  const { id } = await params;
  const event = await loadOwnedEvent(id, `/events/${id}/responses`);
  const rsvps = await repo.listRsvps(event.id);
  return <ResponsesDashboard event={event} rsvps={rsvps} />;
}

export default function ResponsesPage({ params }: PageProps<"/events/[id]/responses">) {
  return (
    <main className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-cream to-[#EEEBE0] px-4 py-8 sm:px-10">
      <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-white/60" />}>
        <Responses params={params} />
      </Suspense>
    </main>
  );
}
