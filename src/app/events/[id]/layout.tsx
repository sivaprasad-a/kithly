import { Suspense } from "react";
import { HostHeader } from "@/components/ui/HostHeader";
import { EventTabs } from "@/components/ui/EventTabs";

export default function EventLayout({ children }: LayoutProps<"/events/[id]">) {
  return (
    <>
      <HostHeader
        center={
          <Suspense fallback={<div className="h-9 w-48 rounded-full bg-cream" />}>
            <EventTabs />
          </Suspense>
        }
      />
      {children}
    </>
  );
}
