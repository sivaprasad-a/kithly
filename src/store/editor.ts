"use client";

import { create } from "zustand";
import { EVENT_TYPES, type Family, type Invite } from "@/lib/schemas";

type SaveState = "idle" | "saving" | "saved" | "error";

type EditorState = {
  eventId: string;
  invite: Invite;
  families: Family[];
  dirtyAt: number;
  save: { state: SaveState; message?: string; at?: number };
  init: (eventId: string, invite: Invite, families: Family[]) => void;
  set: <K extends keyof Invite>(key: K, value: Invite[K]) => void;
  patch: (p: Partial<Invite>) => void;
  setType: (type: Invite["type"]) => void;
  setFamilies: (f: Family[]) => void;
  setSave: (s: EditorState["save"]) => void;
};

export const useEditor = create<EditorState>((set) => ({
  eventId: "",
  invite: undefined as unknown as Invite,
  families: [],
  dirtyAt: 0,
  save: { state: "idle" },
  init: (eventId, invite, families) => set({ eventId, invite, families, dirtyAt: 0, save: { state: "saved" } }),
  set: (key, value) => set((s) => ({ invite: { ...s.invite, [key]: value }, dirtyAt: Date.now() })),
  patch: (p) => set((s) => ({ invite: { ...s.invite, ...p }, dirtyAt: Date.now() })),
  setType: (type) =>
    set((s) => {
      const prevKicker = EVENT_TYPES[s.invite.type].kicker;
      const kicker = !s.invite.kicker || s.invite.kicker === prevKicker ? EVENT_TYPES[type].kicker : s.invite.kicker;
      return { invite: { ...s.invite, type, kicker }, dirtyAt: Date.now() };
    }),
  setFamilies: (families) => set({ families }),
  setSave: (save) => set({ save }),
}));
