import Link from "next/link";
import { APP_NAME } from "@/config/brand";

export function Brand({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label={`${APP_NAME} home`}>
      <span className="relative grid size-8 place-items-center rounded-full bg-teal ring-1 ring-white/10">
        <span className="size-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(218,161,18,.25)]" />
      </span>
      <span className={`font-serif text-2xl font-medium tracking-tight ${light ? "text-white" : "text-ink"}`}>
        {APP_NAME.slice(0, -2)}
        <i className="text-gold">{APP_NAME.slice(-2)}</i>
      </span>
    </Link>
  );
}
