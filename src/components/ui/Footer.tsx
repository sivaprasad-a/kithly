"use client";

import { useEffect, useState } from "react";
import { InstallAppButton } from "@/components/ui/InstallAppButton";

const LAUNCH_YEAR = 2026;

/** Shared footer for signed-in host pages — credits + the PWA install action. */
export function Footer() {
  // The current year is read after mount, not during render, so it never embeds
  // a stale value in a prerendered/cached shell (see Next.js's "unstable new Date()" check).
  const [year, setYear] = useState(LAUNCH_YEAR);
  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer className="relative z-10 border-t border-white/10 px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-3 text-sm text-white/50 sm:flex-row xl:w-[95%]">
        <p>
          © {year > LAUNCH_YEAR ? `${LAUNCH_YEAR}–${year}` : LAUNCH_YEAR} Avis AI Tech. All rights reserved.
        </p>
        <InstallAppButton />
      </div>
    </footer>
  );
}
