"use client";

import { Camera, Check, Copy, Mail, MessageCircle, Share, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { mailtoHref, shareMessage, whatsappHref } from "@/lib/share";
import { useEditor } from "@/store/editor";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareDialog({ openToken, onClose }: { openToken: string; onClose: () => void }) {
  const invite = useEditor((s) => s.invite);
  const families = useEditor((s) => s.families);
  // Only ever rendered after a click, so window is available.
  const origin = window.location.origin;
  const [flash, setFlash] = useState("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const notify = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(""), 2200);
  };
  const openLink = `${origin}/i/${openToken}`;
  const openMsg = shareMessage(invite, openLink);
  const subject = `You're invited: ${invite.title}`;
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(600px,calc(100%-24px))] rounded-[22px] bg-paper p-0 text-ink shadow-2xl backdrop:bg-[#061a1b]/55 backdrop:backdrop-blur-sm"
      aria-labelledby="share-title"
    >
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-h-[90dvh] overflow-y-auto p-6">
        <button onClick={() => ref.current?.close()} aria-label="Close" className="float-right grid size-8 place-items-center rounded-full bg-cream">
          <X className="size-4" />
        </button>
        <h2 id="share-title" className="font-serif text-3xl">
          Share with your circle
        </h2>
        <p className="mt-1 text-sm text-muted">Guests don&apos;t need an account. Personal links know which family is replying.</p>

        {families.length > 0 && (
          <section className="mt-5">
            <h3 className="eyebrow text-olive">Personal links</h3>
            <ul className="mt-2 divide-y divide-teal/[.07] rounded-xl bg-white">
              {families.map((f) => {
                const link = `${origin}/i/${f.token}`;
                const msg = shareMessage(invite, link, f.name);
                return (
                  <li key={f.id} className="flex items-center gap-2 px-3 py-2.5">
                    <span className="mr-auto truncate text-sm">{f.name}</span>
                    <a href={whatsappHref(msg)} target="_blank" rel="noopener noreferrer" className="grid size-8 place-items-center rounded-lg bg-[#25D366] text-white" aria-label={`WhatsApp ${f.name}`}>
                      <MessageCircle className="size-4" />
                    </a>
                    <a href={mailtoHref(subject, msg)} className="grid size-8 place-items-center rounded-lg bg-teal text-white" aria-label={`Email ${f.name}`}>
                      <Mail className="size-4" />
                    </a>
                    <button onClick={async () => notify((await copyText(msg)) ? `Copied ${f.name}'s invite` : "Copy was blocked")} className="grid size-8 place-items-center rounded-lg bg-cream text-teal" aria-label={`Copy invite for ${f.name}`}>
                      <Copy className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-5">
          <h3 className="eyebrow text-olive">Open link {families.length > 0 && "· for anyone else"}</h3>
          <div className="mt-2 flex gap-2">
            <input readOnly value={openLink} className="field flex-1 text-[13px]" aria-label="Invite link" onFocus={(e) => e.target.select()} />
            <button onClick={async () => notify((await copyText(openLink)) ? "Link copied" : "Copy was blocked")} className="rounded-[9px] bg-teal px-3 text-sm text-white">
              Copy
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ShareTile href={whatsappHref(openMsg)} color="#25D366" icon={<MessageCircle className="size-5" />} label="WhatsApp" />
            <ShareTile href={mailtoHref(subject, openMsg)} color="#10383A" icon={<Mail className="size-5" />} label="Email" />
            <ShareTile
              onClick={async () => notify((await copyText(openMsg)) ? "Copied — paste it into an Instagram DM" : "Copy was blocked")}
              color="linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)"
              icon={<Camera className="size-5" />}
              label="Instagram"
            />
            {canNativeShare ? (
              <ShareTile onClick={() => navigator.share({ title: invite.title, text: openMsg }).catch(() => {})} color="#DAA112" icon={<Share className="size-5" />} label="More…" />
            ) : (
              <ShareTile onClick={async () => notify((await copyText(openMsg)) ? "Message copied" : "Copy was blocked")} color="#DAA112" icon={<Copy className="size-5" />} label="Copy text" />
            )}
          </div>
          <p className="mt-3 text-xs text-slate">Instagram doesn&apos;t allow apps to send DMs for you — we copy the message so you can paste it.</p>
        </section>

        {flash && (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-teal px-3 py-2 text-sm text-white">
            <Check className="size-4" /> {flash}
          </p>
        )}
      </motion.div>
    </dialog>
  );
}

function ShareTile({ href, onClick, color, icon, label }: { href?: string; onClick?: () => void; color: string; icon: React.ReactNode; label: string }) {
  const inner = (
    <>
      <i className="grid size-10 place-items-center rounded-xl text-white" style={{ background: color }}>
        {icon}
      </i>
      {label}
    </>
  );
  const cls = "grid justify-items-center gap-2 rounded-2xl border border-teal/15 bg-white px-2 py-3.5 text-[12.5px] hover:border-gold";
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
