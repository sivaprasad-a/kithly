import { Suspense } from "react";
import { InviteCard } from "@/components/invite/InviteCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Brand } from "@/components/ui/Brand";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { Reveal } from "@/components/ui/Reveal";
import { enabledSocialProviders } from "@/lib/auth";
import { sampleInvite } from "@/lib/sample-invite";

export const metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="stage-bg relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
        <AuroraBackground />
        <FloatingIcons />
        <div className="relative z-10">
          <Brand light />
        </div>

        <Reveal delay={0.1} y={24} className="relative z-10 mx-auto w-full max-w-[340px]">
          <span className="absolute -right-3 -top-3 z-10 rotate-3 rounded-full bg-cream px-3 py-1.5 text-[11px] font-medium text-teal shadow-lg">
            🎉 18 families confirmed
          </span>
          <div className="relative max-h-[52vh] overflow-hidden rounded-lg shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)]">
            <InviteCard invite={sampleInvite} compact cta={<span className="rsvp">RSVP</span>} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a2a2c] to-transparent" />
          </div>
        </Reveal>

        <Reveal delay={0.2} className="relative z-10 max-w-sm">
          <p className="font-serif text-2xl leading-snug text-white">
            &ldquo;Every invite feels like it was designed just for the occasion — our guests always ask where we made it.&rdquo;
          </p>
          <p className="mt-2 text-sm text-white/60">— A happy host</p>
        </Reveal>
      </div>

      <div className="flex items-center justify-center bg-cream px-6 py-10 lg:px-16">
        <Reveal y={16} className="w-full max-w-sm">
          <Brand />
          <h1 className="mt-6 font-serif text-4xl">Welcome, host</h1>
          <p className="mt-1 text-sm text-muted">Keep all your celebrations in one place. Guests never need an account.</p>
          <Suspense fallback={<div className="mt-6 h-64" />}>
            {searchParams.then((sp) => (
              <SignInForm
                providers={enabledSocialProviders}
                next={typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/dashboard"}
              />
            ))}
          </Suspense>
        </Reveal>
      </div>
    </div>
  );
}
