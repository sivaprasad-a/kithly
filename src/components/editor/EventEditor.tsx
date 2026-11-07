"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Share2 } from "lucide-react";
import { InviteCard } from "@/components/invite/InviteCard";
import { TEMPLATES } from "@/components/invite/templates";
import { ShareDialog } from "@/components/share/ShareDialog";
import { AiWriter } from "./AiWriter";
import { ChipList, Field, ImageDrop, Section, Segmented, Toggle } from "./controls";
import { GuestList } from "./GuestList";
import { saveInvite } from "@/lib/actions";
import { compressImage } from "@/lib/image";
import { EVENT_TYPES, type Family, type Invite } from "@/lib/schemas";
import { useEditor } from "@/store/editor";

type Props = { eventId: string; initialInvite: Invite; initialFamilies: Family[]; openToken: string };

export function EventEditor({ eventId, initialInvite, initialFamilies, openToken }: Props) {
  const ready = useEditor((s) => s.eventId === eventId && !!s.invite);
  const init = useEditor((s) => s.init);
  useEffect(() => {
    init(eventId, initialInvite, initialFamilies);
  }, [eventId, initialInvite, initialFamilies, init]);
  useAutosave();

  // The placeholder below renders until the store is ready, so reading window here can't cause a hydration mismatch.
  const [device, setDevice] = useState<"phone" | "card">(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? "card" : "phone",
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [pane, setPane] = useState<"edit" | "preview">("edit"); // phones show one pane at a time

  if (!ready) return <div className="stage-bg h-[calc(100dvh-64px)]" />;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col pb-14 md:flex-row md:pb-0">
      <div className={`${pane === "edit" ? "flex" : "hidden"} min-h-0 flex-1 md:flex md:flex-none`}>
        <Panel />
      </div>
      <section
        className={`stage-bg relative min-h-0 flex-1 overflow-auto ${pane === "preview" ? "block" : "hidden"} md:block`}
        aria-label="Invitation preview"
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5 text-white/90">
          <TemplateLabel />
          <div className="ml-auto flex gap-1 rounded-[9px] bg-white/10 p-[3px]">
            {(["phone", "card"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`rounded-[7px] px-3.5 py-1.5 text-[12.5px] capitalize ${device === d ? "bg-white text-teal" : "text-white/70"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <a
            href={`/i/${openToken}`}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-[10px] border border-white/30 px-3.5 py-2 text-sm text-white hover:bg-white/10 sm:inline-flex"
          >
            <Eye className="size-4" /> Guest view
          </a>
          <button onClick={() => setShareOpen(true)} className="hidden items-center gap-2 rounded-[10px] bg-gold md:inline-flex px-3.5 py-2 text-sm font-medium text-teal">
            <Share2 className="size-4" /> Share
          </button>
        </div>
        <div className="flex justify-center px-4 pb-16 pt-2 sm:px-6">
          <Preview device={device} />
        </div>
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t border-teal/10 bg-paper p-2 md:hidden" aria-label="Editor view">
        {(["edit", "preview"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPane(p)}
            aria-pressed={pane === p}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium capitalize ${pane === p ? "bg-teal text-white" : "text-muted"}`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setShareOpen(true)} className="rounded-xl bg-gold px-4 text-sm font-medium text-teal">
          Share
        </button>
      </nav>
      {shareOpen && <ShareDialog openToken={openToken} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function TemplateLabel() {
  const t = useEditor((s) => s.invite.template);
  return (
    <span className="hidden text-xs uppercase tracking-[0.25em] text-white/70 sm:inline">
      Live preview · <b className="font-medium text-gold">{TEMPLATES.find((x) => x.id === t)?.name}</b>
    </span>
  );
}

function Preview({ device }: { device: "phone" | "card" }) {
  const invite = useEditor((s) => s.invite);
  const card = <InviteCard invite={invite} editing compact={device === "phone"} cta={<span className="rsvp">RSVP</span>} />;
  if (device === "card") return <div className="w-full max-w-[620px] overflow-hidden rounded-md shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)]">{card}</div>;
  return (
    <div className="w-[min(410px,100%)] rounded-[46px] bg-[#0B1F20] p-3 shadow-[0_40px_90px_-30px_rgba(0,0,0,.65),inset_0_0_0_1.5px_rgba(255,255,255,.08)]">
      <div className="relative h-[min(820px,calc(100dvh-170px))] overflow-y-auto rounded-[36px] [scrollbar-width:none]">
        <div className="absolute left-1/2 top-2.5 z-10 h-[30px] w-[110px] -translate-x-1/2 rounded-[20px] bg-[#0B1F20]" />
        {card}
      </div>
    </div>
  );
}

/** Debounced save of the whole invite whenever it changes. */
function useAutosave() {
  const dirtyAt = useEditor((s) => s.dirtyAt);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!dirtyAt) return;
    useEditor.getState().setSave({ state: "saving" });
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { eventId, invite, dirtyAt: at } = useEditor.getState();
      try {
        const res = await saveInvite(eventId, invite);
        if (useEditor.getState().dirtyAt !== at) return; // newer edits pending
        useEditor.getState().setSave(res.ok ? { state: "saved", at: res.data.savedAt } : { state: "error", message: res.error });
      } catch {
        useEditor.getState().setSave({ state: "error", message: "Couldn't reach the server" });
      }
    }, 700);
    return () => clearTimeout(timer.current);
  }, [dirtyAt]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().save.state === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
}

function SaveStatus() {
  const save = useEditor((s) => s.save);
  const map = {
    idle: ["bg-slate", ""],
    saving: ["bg-gold animate-pulse", "Saving…"],
    saved: ["bg-sage", "All changes saved"],
    error: ["bg-[#C8553D]", save.message || "Not saved"],
  } as const;
  const [dot, label] = map[save.state];
  return (
    <p className="mx-1 mt-3 flex items-center gap-2 text-[11.5px] text-slate" role="status">
      <span className={`size-[7px] rounded-full ${dot}`} />
      {label}
    </p>
  );
}

function Panel() {
  const e = useEditor((s) => s.invite);
  const set = useEditor((s) => s.set);
  const patch = useEditor((s) => s.patch);
  const setType = useEditor((s) => s.setType);
  const [imgError, setImgError] = useState("");

  const onImage = (key: "heroImage" | "bgImage") => async (file: File) => {
    setImgError("");
    try {
      const data = await compressImage(file, key === "heroImage" ? 900 : 1300);
      patch(key === "bgImage" ? { bgImage: data, template: "custom" } : { heroImage: data });
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Couldn't use that image");
    }
  };
  const txt = (key: keyof Invite) => ({
    value: e[key] as string,
    onChange: (ev: { target: { value: string } }) => set(key, ev.target.value as never),
  });

  return (
    <aside
      className="h-full w-full overflow-y-auto bg-paper px-3.5 pb-10 pt-4 md:w-[20vw] md:min-w-[300px] md:max-w-[380px] md:border-r md:border-teal/10"
      aria-label="Edit invitation"
    >
      <h2 className="mx-1 font-serif text-[22px] font-medium">Your invitation</h2>
      <p className="mx-1 mb-3.5 text-[12.5px] text-muted">Edit here — the preview updates as you type.</p>

      <Section n={1} title="Event" open>
        <Field label="Event type">
          <select className="field" value={e.type} onChange={(ev) => setType(ev.target.value as Invite["type"])}>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Heading line">
          <input className="field" {...txt("kicker")} />
        </Field>
        <Field label="Title">
          <input className="field" {...txt("title")} />
        </Field>
        <Field label="Celebrating">
          <input className="field" {...txt("honoree")} placeholder="Our little sunshine" />
        </Field>
        <Field label="Invite from">
          <input className="field" {...txt("from")} placeholder="Priya & Rahul" />
        </Field>
        <Field label="Personal note">
          <textarea className="field min-h-[72px] resize-y leading-snug" rows={3} {...txt("message")} />
        </Field>
        <AiWriter />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Date">
            <input type="date" className="field px-2 text-[13px]" {...txt("date")} />
          </Field>
          <Field label="Dress code">
            <input className="field" {...txt("dress")} placeholder="Optional" />
          </Field>
          <Field label="Starts">
            <input type="time" className="field px-2 text-[13px]" {...txt("start")} />
          </Field>
          <Field label="Ends">
            <input type="time" className="field px-2 text-[13px]" {...txt("end")} />
          </Field>
        </div>
      </Section>

      <Section n={2} title="Design & photo" open>
        <span className="text-xs text-muted">Template</span>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("template", t.id)}
              aria-pressed={e.template === t.id}
              className={`overflow-hidden rounded-[10px] border-[1.5px] text-left ${e.template === t.id ? "border-gold ring-[3px] ring-gold/20" : "border-teal/15"}`}
            >
              <i className="grid h-11 place-items-center font-serif text-lg italic" style={{ background: t.swatch, color: t.ink }}>
                Aa
              </i>
              <small className="block truncate px-1.5 py-1 text-[10.5px] text-muted">{t.name}</small>
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">Title lettering</span>
        <Segmented label="Title lettering" value={e.font} onChange={(v) => set("font", v)} options={[["classic", "Classic"], ["modern", "Modern"], ["script", "Script"]]} />
        <span className="text-xs text-muted">
          Hero of the event <span className="text-slate">(optional)</span>
        </span>
        <ImageDrop value={e.heroImage} title="Upload a photo" subtitle="The birthday star, the couple, the bump…" onFile={onImage("heroImage")} onClear={() => set("heroImage", "")} />
        <Segmented label="Photo frame" value={e.heroShape} onChange={(v) => set("heroShape", v)} options={[["arch", "Arch"], ["circle", "Circle"], ["square", "Square"]]} />
        <span className="text-xs text-muted">
          Your own design <span className="text-slate">(background artwork)</span>
        </span>
        <ImageDrop
          icon="upload"
          value={e.bgImage}
          title="Upload artwork"
          subtitle="Used as the card background"
          onFile={onImage("bgImage")}
          onClear={() => patch({ bgImage: "", template: e.template === "custom" ? "midnight" : e.template })}
        />
        {e.template === "custom" && e.bgImage && (
          <label className="flex items-center gap-2.5 text-xs text-slate">
            Shade
            <input type="range" min={0} max={85} value={e.overlay} onChange={(ev) => set("overlay", Number(ev.target.value))} className="flex-1 accent-gold" />
            {e.overlay}%
          </label>
        )}
        {imgError && <p className="text-xs text-[#9A3A26]">{imgError}</p>}
      </Section>

      <Section n={3} title="Venue & parking">
        <Field label="Place name">
          <input className="field" {...txt("venue")} />
        </Field>
        <Field label="Address">
          <textarea className="field resize-y" rows={2} {...txt("address")} />
        </Field>
        <Field label="Map link" hint="optional">
          <input type="url" className="field" {...txt("mapUrl")} placeholder="Google / Apple Maps link" />
        </Field>
        <Field label="Parking information">
          <textarea className="field resize-y" rows={2} {...txt("parking")} />
        </Field>
      </Section>

      <Section n={4} title="Food & drinks">
        <Toggle label="Vegetarian" checked={e.veg} onChange={(v) => set("veg", v)} />
        <Toggle label="Non-vegetarian" checked={e.nonveg} onChange={(v) => set("nonveg", v)} />
        <Field label="Menu highlights">
          <input className="field" {...txt("menu")} placeholder="Biryani, paneer tikka, cake…" />
        </Field>
        <span className="text-xs text-muted">Soft drinks guests can pick</span>
        <ChipList items={e.softDrinks} onChange={(v) => set("softDrinks", v)} placeholder="Add a soft drink" />
        <Toggle label="Serving alcohol" checked={e.alcoholOn} onChange={(v) => set("alcoholOn", v)} />
        {e.alcoholOn && (
          <>
            <ChipList items={e.alcohol} onChange={(v) => set("alcohol", v)} placeholder="Add a drink" />
            <span className="text-[11.5px] text-slate">Only adults are asked about these.</span>
          </>
        )}
      </Section>

      <Section n={5} title="Little one's favourites" hidden={!EVENT_TYPES[e.type].favourites}>
        <span className="text-[11.5px] text-slate">Helps guests choose gifts &amp; treats.</span>
        <span className="text-xs text-muted">Favourite colours</span>
        {e.favourites.colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="color"
              aria-label={`Colour ${i + 1}`}
              value={c.hex}
              onChange={(ev) => set("favourites", { ...e.favourites, colors: e.favourites.colors.map((x, j) => (j === i ? { ...x, hex: ev.target.value.toUpperCase() } : x)) })}
              className="size-[34px] shrink-0 rounded-[9px] border border-teal/15 bg-white p-0.5"
            />
            <input
              className="field min-w-0 flex-1 py-1.5 text-[13px]"
              value={c.name}
              aria-label={`Colour ${i + 1} name`}
              placeholder="Colour name"
              onChange={(ev) => set("favourites", { ...e.favourites, colors: e.favourites.colors.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)) })}
            />
            <button
              type="button"
              aria-label="Remove colour"
              onClick={() => set("favourites", { ...e.favourites, colors: e.favourites.colors.filter((_, j) => j !== i) })}
              className="text-slate"
            >
              ×
            </button>
          </div>
        ))}
        {e.favourites.colors.length < 5 && (
          <button
            type="button"
            className="justify-self-start rounded-lg border border-teal px-2.5 py-1 text-xs text-teal"
            onClick={() => set("favourites", { ...e.favourites, colors: [...e.favourites.colors, { hex: "#768886", name: "" }] })}
          >
            + Add colour
          </button>
        )}
        {(["toy", "food", "theme", "gift"] as const).map((k) => (
          <Field key={k} label={{ toy: "Favourite toys", food: "Favourite foods", theme: "Character / theme", gift: "Gift note" }[k]}>
            <input className="field" value={e.favourites[k]} onChange={(ev) => set("favourites", { ...e.favourites, [k]: ev.target.value })} />
          </Field>
        ))}
      </Section>

      <Section n={6} title="Guests & RSVP">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Max per family">
            <input
              type="number"
              min={1}
              max={30}
              className="field"
              value={e.maxPerFamily}
              onChange={(ev) => set("maxPerFamily", Math.max(1, Math.min(30, Number(ev.target.value) || 1)))}
            />
          </Field>
          <Field label="RSVP by">
            <input type="date" className="field px-2 text-[13px]" {...txt("rsvpBy")} />
          </Field>
        </div>
        <Toggle label="Kids welcome" checked={e.kidsWelcome} onChange={(v) => set("kidsWelcome", v)} />
        <GuestList />
      </Section>

      <SaveStatus />
    </aside>
  );
}
