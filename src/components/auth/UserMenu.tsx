"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const initials = name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <details className="relative">
      <summary
        className="grid size-9 cursor-pointer list-none place-items-center rounded-full bg-teal text-xs font-medium text-white [&::-webkit-details-marker]:hidden"
        aria-label="Account menu"
      >
        {initials || "·"}
      </summary>
      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-teal/10 bg-white p-2 text-sm shadow-xl">
        <p className="truncate px-2 py-1.5 text-muted">{name}</p>
        <button
          className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-cream"
          onClick={async () => {
            await authClient.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
