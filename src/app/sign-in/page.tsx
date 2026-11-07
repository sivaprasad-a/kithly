import { Suspense } from "react";
import { Brand } from "@/components/ui/Brand";
import { SignInForm } from "@/components/auth/SignInForm";
import { enabledSocialProviders } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <div className="stage-bg grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-[22px] bg-paper p-7 shadow-2xl">
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
      </div>
    </div>
  );
}
