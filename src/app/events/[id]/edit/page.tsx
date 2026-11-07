import { Suspense } from "react";
import { EventEditor } from "@/components/editor/EventEditor";
import { loadOwnedEvent } from "@/lib/events";

export const metadata = { title: "Design your invite" };

async function Editor({ params }: { params: PageProps<"/events/[id]/edit">["params"] }) {
  const { id } = await params;
  const event = await loadOwnedEvent(id, `/events/${id}/edit`);
  return <EventEditor eventId={event.id} initialInvite={event.invite} initialFamilies={event.families} openToken={event.openToken} />;
}

export default function EditPage({ params }: PageProps<"/events/[id]/edit">) {
  return (
    <Suspense fallback={<div className="stage-bg h-[calc(100dvh-64px)]" />}>
      <Editor params={params} />
    </Suspense>
  );
}
