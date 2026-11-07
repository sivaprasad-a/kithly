"use client";

import clsx from "clsx";
import { ImageIcon, Upload, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export function Section({ n, title, open, children, hidden }: { n: number; title: string; open?: boolean; children: ReactNode; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <details open={open} className="group mb-2.5 rounded-xl border border-teal/[.07] bg-white open:shadow-[0_6px_20px_-14px_rgba(16,56,58,.35)]">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="grid size-[22px] place-items-center rounded-full bg-cream text-[11px] font-semibold text-olive group-open:bg-gold group-open:text-teal">
          {n}
        </span>
        {title}
        <span className="ml-auto size-[7px] rotate-45 border-b-[1.5px] border-r-[1.5px] border-slate transition group-open:rotate-[225deg]" />
      </summary>
      <div className="grid gap-3 px-3.5 pb-3.5 pt-0.5">{children}</div>
    </details>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="label min-w-0">
      <span>
        {label} {hint && <span className="text-slate">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px]">
      {label}
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-[22px] w-[38px] rounded-full bg-[#D6D9D2] transition peer-checked:bg-sage peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
        <span className="absolute left-[3px] top-[3px] size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex gap-1 rounded-[9px] bg-cream p-[3px]" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={clsx("flex-1 rounded-[7px] px-1 py-1.5 text-[12.5px]", value === v ? "bg-white font-medium text-teal shadow-sm" : "text-muted")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ChipList({ items, onChange, placeholder, empty = "None yet" }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; empty?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!items.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {items.length ? (
          items.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-teal/[.07] bg-cream py-1 pl-3 pr-1.5 text-[12.5px]">
              {c}
              <button type="button" aria-label={`Remove ${c}`} onClick={() => onChange(items.filter((x) => x !== c))} className="grid size-[18px] place-items-center rounded-full bg-teal/10 text-olive">
                <X className="size-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-slate">{empty}</span>
        )}
      </div>
      <div className="flex gap-1.5">
        <input
          className="field min-w-0 flex-1 py-1.5 text-[13px]"
          value={draft}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="rounded-[9px] bg-teal px-3 text-[13px] text-white">
          Add
        </button>
      </div>
    </div>
  );
}

export function ImageDrop({ value, title, subtitle, onFile, onClear, icon = "image" }: { value: string; title: string; subtitle: string; onFile: (f: File) => void; onClear: () => void; icon?: "image" | "upload" }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const Icon = icon === "image" ? ImageIcon : Upload;
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={clsx(
        "relative flex items-center gap-3 rounded-[11px] border-[1.5px] border-dashed p-3 text-[13px] transition",
        over ? "border-gold bg-[#FFFBEF]" : "border-teal/20 bg-paper hover:border-gold",
      )}
    >
      <label htmlFor={id} className="absolute inset-0 cursor-pointer" aria-label={title} />
      <input id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <span className="grid size-11 shrink-0 place-items-center rounded-[9px] bg-cream bg-cover bg-center text-slate" style={value ? { backgroundImage: `url(${value})` } : undefined}>
        {!value && <Icon className="size-5" />}
      </span>
      <span>
        <b className="block font-medium">{title}</b>
        <span className="text-[11.5px] text-muted">{subtitle}</span>
      </span>
      {value && (
        <button type="button" onClick={onClear} aria-label="Remove image" className="relative z-10 ml-auto grid size-7 place-items-center rounded-full bg-cream text-olive">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
