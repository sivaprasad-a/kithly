"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function EventTabs() {
  const { id } = useParams<{ id: string }>();
  const path = usePathname();
  const tabs = [
    { href: `/events/${id}/edit`, label: "Design" },
    { href: `/events/${id}/responses`, label: "Responses" },
  ];
  return (
    <nav className="flex gap-1 rounded-full border border-teal/[.07] bg-cream p-1" aria-label="Event views">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={path === t.href ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm ${path === t.href ? "bg-teal text-white" : "text-muted hover:text-teal"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
