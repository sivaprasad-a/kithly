import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="stage-bg grid min-h-dvh place-items-center px-6 text-center text-white">
      <div>
        <p className="eyebrow text-gold">Not found</p>
        <h1 className="mt-3 font-serif text-5xl">This invitation isn&apos;t here</h1>
        <p className="mt-3 text-white/70">The link may have been changed or the event removed. Ask your host for a fresh link.</p>
        <Link href="/" className={buttonClass("gold") + " mt-8"}>
          Go home
        </Link>
      </div>
    </main>
  );
}
