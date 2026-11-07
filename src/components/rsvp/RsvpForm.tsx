"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { submitRsvp } from "@/lib/actions";
import { fmtLongDate, fmtShortDate } from "@/lib/format";
import { RsvpInputSchema, type Invite, type RsvpDoc, type RsvpInput } from "@/lib/schemas";

type Props = { token: string; invite: Invite; familyName: string | null; existing: RsvpDoc | null };

export function RsvpForm({ token, invite, familyName, existing }: Props) {
  const [done, setDone] = useState<null | RsvpInput["status"]>(existing ? existing.status : null);
  const [serverError, setServerError] = useState("");

  const defaults: RsvpInput = existing
    ? {
        familyName: existing.familyName,
        contact: existing.contact,
        status: existing.status,
        adults: existing.adults,
        kids: existing.kids,
        veg: existing.veg,
        nonveg: existing.nonveg,
        softDrinks: existing.softDrinks,
        alcohol: existing.alcohol,
        diet: existing.diet,
        note: existing.note,
      }
    : {
        familyName: familyName ?? "",
        contact: "",
        status: "yes",
        adults: 2,
        kids: 0,
        veg: invite.veg ? 2 : 0,
        nonveg: !invite.veg && invite.nonveg ? 2 : 0,
        softDrinks: [],
        alcohol: [],
        diet: "",
        note: "",
      };

  const form = useForm<RsvpInput>({ resolver: zodResolver(RsvpInputSchema), defaultValues: defaults });
  const { register, handleSubmit, setValue, control, formState } = form;
  const v = useWatch({ control }) as RsvpInput;

  const heads = v.adults + v.kids;
  const meals = v.veg + v.nonveg;
  const going = v.status !== "no";

  /** Keep meal counts in step with headcount. */
  function setCount(key: "adults" | "kids" | "veg" | "nonveg", next: number) {
    next = Math.max(0, next);
    setValue(key, next);
    if (key === "adults" || key === "kids") {
      const h = (key === "adults" ? next : v.adults) + (key === "kids" ? next : v.kids);
      let { veg, nonveg } = v;
      if (veg + nonveg < h && next > v[key]) {
        if (invite.veg && (!invite.nonveg || veg >= nonveg)) veg++;
        else if (invite.nonveg) nonveg++;
      }
      while (veg + nonveg > h) {
        if (nonveg > 0 && (nonveg >= veg || !veg)) nonveg--;
        else veg--;
      }
      setValue("veg", veg);
      setValue("nonveg", nonveg);
      if (key === "adults" && next === 0) setValue("alcohol", []);
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    const res = await submitRsvp(token, data);
    if (!res.ok) return setServerError(res.error);
    setDone(data.status);
  });

  const card = "rounded-[22px] bg-paper p-6 shadow-[0_18px_50px_-18px_rgba(10,42,44,.35)] sm:p-7";

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card + " text-center"}>
        <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto mb-3.5 grid size-16 place-items-center rounded-full bg-gold text-3xl text-teal">
          {done === "yes" ? "✓" : done === "maybe" ? "…" : "♡"}
        </motion.div>
        <h2 className="font-serif text-3xl">{done === "yes" ? "See you there!" : done === "maybe" ? "Thanks for letting us know" : "You'll be missed"}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {done === "yes"
            ? `We've saved a spot for ${heads} from ${v.familyName}. ${invite.from || "Your hosts"} will be so happy.`
            : done === "maybe"
              ? "Please confirm when you can — you can update your reply any time from this link."
              : "Thank you for replying. We'll share photos!"}
        </p>
        <button onClick={() => setDone(null)} className="mt-5 rounded-[10px] border border-teal px-4 py-2 text-sm text-teal">
          Change my reply
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={card + " grid gap-4"} noValidate aria-label="RSVP form">
      <div>
        <h2 className="font-serif text-[32px] leading-tight">{familyName ? `Dear ${familyName},` : "Will you join us?"}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {invite.title}
          {invite.date && ` · ${fmtLongDate(invite.date)}`}
          {invite.rsvpBy && (
            <>
              <br />
              Please reply by {fmtShortDate(invite.rsvpBy)}.
            </>
          )}
        </p>
      </div>

      {!familyName && (
        <label className="label">
          Family / your name
          <input className="field" {...register("familyName")} placeholder="e.g. The Sharma family" autoComplete="name" />
          {formState.errors.familyName && <span className="text-[#9A3A26]">{formState.errors.familyName.message}</span>}
        </label>
      )}
      <label className="label">
        Phone or email <span className="text-slate">(so the host can reach you)</span>
        <input className="field" {...register("contact")} autoComplete="tel" />
      </label>

      <Q>Attending?</Q>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Attending">
        {([["yes", "Yes, we'll be there"], ["maybe", "Maybe"], ["no", "Can't make it"]] as const).map(([val, label]) => (
          <label key={val} className="relative">
            <input type="radio" value={val} {...register("status")} className="peer sr-only" />
            <span className="block rounded-[11px] border border-teal/15 bg-white px-1.5 py-2.5 text-center text-sm transition peer-checked:border-teal peer-checked:bg-teal peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
              {label}
            </span>
          </label>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {going && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-4 overflow-hidden">
            <Q>How many are coming?</Q>
            <div className="grid gap-2">
              <Counter label="Adults" value={v.adults} onChange={(n) => setCount("adults", n)} canAdd={heads < invite.maxPerFamily} />
              {invite.kidsWelcome && <Counter label="Kids" sub="Under 12" value={v.kids} onChange={(n) => setCount("kids", n)} canAdd={heads < invite.maxPerFamily} />}
            </div>
            <Note warn={heads > invite.maxPerFamily}>
              Up to {invite.maxPerFamily} guests per family · {heads} selected
            </Note>

            {(invite.veg || invite.nonveg) && heads > 0 && (
              <>
                <Q>Meal preference</Q>
                <div className="grid gap-2">
                  {invite.veg && <Counter label="Vegetarian meals" value={v.veg} onChange={(n) => setCount("veg", n)} canAdd={meals < heads} />}
                  {invite.nonveg && <Counter label="Non-veg meals" value={v.nonveg} onChange={(n) => setCount("nonveg", n)} canAdd={meals < heads} />}
                </div>
                {meals !== heads && <Note>{meals < heads ? `${heads - meals} meal choice${heads - meals > 1 ? "s" : ""} left to pick` : "That's more meals than guests"}</Note>}
              </>
            )}

            {invite.softDrinks.length > 0 && (
              <>
                <Q>Soft drinks</Q>
                <Picks name="softDrinks" options={invite.softDrinks} control={control} onToggle={(list) => setValue("softDrinks", list)} />
              </>
            )}
            {invite.alcoholOn && invite.alcohol.length > 0 && v.adults > 0 && (
              <>
                <Q>
                  From the bar <span className="normal-case tracking-normal text-slate">(adults)</span>
                </Q>
                <Picks
                  name="alcohol"
                  options={[...invite.alcohol, "None"]}
                  labels={{ None: "None for us" }}
                  control={control}
                  onToggle={(list, picked) => setValue("alcohol", picked === "None" ? (list.includes("None") ? ["None"] : []) : list.filter((x) => x !== "None"))}
                />
              </>
            )}
            <label className="label">
              Allergies or dietary needs
              <input className="field" {...register("diet")} placeholder="Optional" />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="label">
        A note for {invite.from || "the hosts"}
        <textarea className="field resize-y" rows={2} {...register("note")} placeholder="Optional" />
      </label>

      {serverError && <Note warn>{serverError}</Note>}
      <button type="submit" disabled={formState.isSubmitting} className="rounded-[10px] bg-teal py-3 text-sm font-medium text-white disabled:opacity-60">
        {formState.isSubmitting ? "Sending…" : existing ? "Update my reply" : "Send my reply"}
      </button>
    </form>
  );
}

const Q = ({ children }: { children: React.ReactNode }) => <p className="-mb-1.5 mt-1 text-xs font-medium uppercase tracking-[0.13em] text-olive">{children}</p>;
const Note = ({ children, warn }: { children: React.ReactNode; warn?: boolean }) => (
  <p className={`rounded-[9px] px-3 py-2 text-xs ${warn ? "bg-[#F8E3DC] text-[#9A3A26]" : "bg-[#F7F0DA] text-olive"}`}>{children}</p>
);

function Counter({ label, sub, value, onChange, canAdd }: { label: string; sub?: string; value: number; onChange: (n: number) => void; canAdd: boolean }) {
  const btn = "grid size-8 place-items-center rounded-full border border-teal/15 bg-paper text-lg leading-none text-teal disabled:opacity-35";
  return (
    <div className="flex items-center justify-between rounded-xl border border-teal/15 bg-white py-2 pl-3.5 pr-2.5">
      <div className="text-[14.5px]">
        {label}
        {sub && <small className="block text-xs text-muted">{sub}</small>}
      </div>
      <div className="flex items-center gap-2.5">
        <button type="button" className={btn} disabled={value <= 0} onClick={() => onChange(value - 1)} aria-label={`Fewer ${label}`}>
          −
        </button>
        <output className="min-w-6 text-center font-medium" aria-live="polite">
          {value}
        </output>
        <button type="button" className={btn} disabled={!canAdd} onClick={() => onChange(value + 1)} aria-label={`More ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

function Picks({ name, options, labels = {}, control, onToggle }: { name: "softDrinks" | "alcohol"; options: string[]; labels?: Record<string, string>; control: Control<RsvpInput>; onToggle: (list: string[], picked: string) => void }) {
  const selected = (useWatch({ control, name }) as string[]) ?? [];
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(on ? selected.filter((x) => x !== o) : [...selected, o], o)}
            className={`rounded-full border px-3.5 py-1.5 text-[13.5px] transition ${on ? "border-gold bg-[#FFF6DC] text-teal" : "border-teal/15 bg-white"}`}
          >
            {on && <span className="mr-1 font-semibold text-gold">✓</span>}
            {labels[o] ?? o}
          </button>
        );
      })}
    </div>
  );
}
