"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { addFamily, removeFamily } from "@/lib/actions";
import { useEditor } from "@/store/editor";

/** Invited families. Each one gets a personal RSVP link (sent from the Share dialog). */
export function GuestList() {
  const { eventId, families, setFamilies } = useEditor();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      setError("");
      const res = await addFamily(eventId, name);
      if (res.ok) {
        setFamilies(res.data);
        setName("");
      } else setError(res.error);
    });

  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted">Invited families · {families.length}</span>
      <ul className="flex flex-wrap gap-1.5">
        {families.length === 0 && <li className="text-xs text-slate">Add the families you&apos;re inviting — each gets a personal link.</li>}
        {families.map((f) => (
          <li key={f.id} className="inline-flex items-center gap-1.5 rounded-full border border-teal/[.07] bg-cream py-1 pl-3 pr-1.5 text-[12.5px]">
            {f.name}
            <button
              type="button"
              aria-label={`Remove ${f.name}`}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await removeFamily(eventId, f.id);
                  if (res.ok) setFamilies(res.data);
                })
              }
              className="grid size-[18px] place-items-center rounded-full bg-teal/10 text-olive"
            >
              <X className="size-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-1.5">
        <input
          className="field min-w-0 flex-1 py-1.5 text-[13px]"
          value={name}
          placeholder="e.g. The Sharma family"
          aria-label="Add invited family"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} disabled={pending || !name.trim()} className="rounded-[9px] bg-teal px-3 text-[13px] text-white disabled:opacity-50">
          Add
        </button>
      </div>
      {error && <p className="text-xs text-[#9A3A26]">{error}</p>}
    </div>
  );
}
