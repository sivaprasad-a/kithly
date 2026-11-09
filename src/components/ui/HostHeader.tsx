import { Suspense, type ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";
import { UserMenu } from "@/components/auth/UserMenu";
import { getUser } from "@/lib/session";

async function CurrentUser() {
  const user = await getUser();
  return user ? <UserMenu name={user.name || user.email} /> : null;
}

/** Top bar for signed-in host pages. `center` takes tabs; `actions` takes buttons. */
export function HostHeader({ center, actions, dark = false }: { center?: ReactNode; actions?: ReactNode; dark?: boolean }) {
  return (
    <header
      className={
        dark
          ? "fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b2426]/95 px-4 backdrop-blur sm:px-6"
          : "fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-teal/10 bg-paper px-4 sm:px-6"
      }
    >
      <Brand href="/dashboard" light={dark} />
      <div className="mx-auto">{center}</div>
      <div className="flex items-center gap-2">
        {actions}
        <Suspense fallback={<span className="size-8 rounded-full bg-cream" />}>
          <CurrentUser />
        </Suspense>
      </div>
    </header>
  );
}
