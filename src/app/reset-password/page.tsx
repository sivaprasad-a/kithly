import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Brand } from "@/components/ui/Brand";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <div className="stage-bg relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <AuroraBackground />
      <FloatingIcons />
      <Reveal y={20} className="relative z-10 w-full max-w-md">
        <div className="rounded-[22px] bg-paper p-7 shadow-2xl">
          <Brand />
          <h1 className="mt-6 font-serif text-4xl">Set a new password</h1>
          <Suspense fallback={<div className="mt-6 h-40" />}>
            {searchParams.then((sp) => {
              const token = typeof sp.token === "string" ? sp.token : "";
              return token ? (
                <>
                  <p className="mt-1 text-sm text-muted">Choose a new password for your account.</p>
                  <ResetPasswordForm token={token} />
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-muted">This reset link is missing its token — it may have expired.</p>
                  <Link href="/sign-in" className="mt-6 inline-block text-sm font-medium text-sage hover:underline">
                    ← Back to sign in
                  </Link>
                </>
              );
            })}
          </Suspense>
        </div>
      </Reveal>
    </div>
  );
}
