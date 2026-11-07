"use client";

import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AI_NAME } from "@/config/brand";
import { useEditor } from "@/store/editor";

const TONES = ["warm", "fun", "elegant", "traditional"] as const;
const LANGUAGES = ["English", "Telugu", "Hindi"] as const;

/** "Write it for me" — asks the AI co-host for three versions of the personal note. */
export function AiWriter() {
  const invite = useEditor((s) => s.invite);
  const set = useEditor((s) => s.set);
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<(typeof TONES)[number]>("warm");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [note, setNote] = useState("");

  async function generate() {
    setBusy(true);
    setNote("");
    try {
      const { type, title, honoree, from, date, venue, favourites } = invite;
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: { type, title, honoree, from, date, venue, favourites }, tone, language }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't write right now");
      setOptions(json.messages);
      if (json.source === "template") setNote("Add an AI key in .env.local for personalised, multilingual drafts.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Couldn't write right now");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-gradient-to-r from-gold/20 to-sage/20 px-3 py-1.5 text-[12.5px] font-medium text-teal ring-1 ring-gold/40"
        aria-expanded={open}
      >
        <Sparkles className="size-3.5 text-gold" /> Write it with {AI_NAME}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 rounded-xl bg-cream p-2.5">
              <div className="flex flex-wrap gap-1">
                {TONES.map((t) => (
                  <button key={t} type="button" onClick={() => setTone(t)} className={`rounded-full px-2.5 py-1 text-xs capitalize ${tone === t ? "bg-teal text-white" : "bg-white text-muted"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {LANGUAGES.map((l) => (
                  <button key={l} type="button" onClick={() => setLanguage(l)} className={`rounded-full px-2.5 py-1 text-xs ${language === l ? "bg-sage text-white" : "bg-white text-muted"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <button type="button" onClick={generate} disabled={busy} className="rounded-lg bg-teal py-1.5 text-[13px] text-white disabled:opacity-60">
                {busy ? `${AI_NAME} is writing…` : options.length ? "Try again" : "Suggest 3 notes"}
              </button>
              {options.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => set("message", o)}
                  className="rounded-lg bg-white p-2.5 text-left font-serif text-[15px] leading-snug hover:ring-2 hover:ring-gold"
                >
                  {o}
                </button>
              ))}
              {note && <p className="text-[11.5px] text-olive">{note}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
