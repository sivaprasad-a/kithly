"use client";

import { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { deleteEvent } from "@/lib/actions";

export function DeleteEventButton({ eventId, title }: { eventId: string; title: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Delete ${title}`}
      title={`Delete ${title}`}
      onClick={(ev) => {
        ev.preventDefault();
        if (confirm(`Delete "${title}"? This removes it and all its RSVPs — this can't be undone.`)) {
          start(() => deleteEvent(eventId));
        }
      }}
      className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/15 text-white/60 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
    >
      <FontAwesomeIcon icon={pending ? faSpinner : faTrashCan} className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
    </button>
  );
}
