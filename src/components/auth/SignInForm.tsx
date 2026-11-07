"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, buttonClass } from "@/components/ui/Button";

const PROVIDER_LABEL = { google: "Continue with Google", facebook: "Continue with Facebook" } as const;

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.07-1.47-.22-2.12H12v3.85h6.6c-.13 1.1-.86 2.76-2.47 3.87l-.02.15 3.58 2.77.25.03c2.28-2.1 3.58-5.19 3.58-8.55Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.06 7.94-2.88l-3.78-2.93c-1.01.7-2.37 1.19-4.16 1.19-3.18 0-5.88-2.1-6.84-5H1.27v2.98C3.23 21.3 7.28 24 12 24Z" />
    <path fill="#FBBC05" d="M5.16 14.38A7.17 7.17 0 0 1 4.77 12c0-.83.14-1.63.38-2.38V6.64H1.27A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.27 5.36l3.89-2.98Z" />
    <path fill="#EA4335" d="M12 4.77c2.25 0 3.77.97 4.64 1.78l3.38-3.3C17.95 1.19 15.24 0 12 0 7.28 0 3.23 2.7 1.27 6.64l3.89 2.98c.96-2.9 3.66-4.85 6.84-4.85Z" />
  </svg>
);

const FacebookMark = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="#1877F2" aria-hidden>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
  </svg>
);

function FieldIcon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate">{children}</span>;
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (res.error) {
      setError(res.error.message || "Something went wrong — please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="grid gap-3 text-sm">
        <p className="text-ink">
          If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
        </p>
        <button type="button" onClick={onBack} className="justify-self-start text-sm font-medium text-sage hover:underline">
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3.5">
      <p className="text-sm text-muted">Enter your email and we&apos;ll send you a link to reset your password.</p>
      <label className="label">
        Email
        <span className="relative">
          <FieldIcon>
            <FontAwesomeIcon icon={faEnvelope} className="size-4" />
          </FieldIcon>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field !pl-9"
            autoComplete="email"
          />
        </span>
      </label>
      {error && <p className="rounded-lg bg-[#F8E3DC] px-3 py-2 text-sm text-[#9A3A26]">{error}</p>}
      <Button variant="solid" type="submit" disabled={busy} className="mt-1 w-full">
        {busy ? "Sending…" : "Send reset link"}
      </Button>
      <button type="button" onClick={onBack} className="justify-self-start text-sm font-medium text-sage hover:underline">
        ← Back to sign in
      </button>
    </form>
  );
}

export function SignInForm({ providers, next }: { providers: Array<"google" | "facebook">; next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "");
    const password = String(f.get("password") || "");
    const res =
      mode === "up"
        ? await authClient.signUp.email({ name: String(f.get("name") || "").trim() || email.split("@")[0], email, password })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      setError(res.error.message || "Something went wrong — please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  const ICONS = { google: GoogleMark, facebook: FacebookMark };

  if (forgot) {
    return (
      <div className="mt-6">
        <ForgotPassword onBack={() => setForgot(false)} />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {providers.length > 0 && (
        <>
          <div className="grid gap-2">
            {providers.map((p) => {
              const Mark = ICONS[p];
              return (
                <Button
                  key={p}
                  type="button"
                  onClick={() => authClient.signIn.social({ provider: p, callbackURL: next })}
                  className="w-full"
                >
                  <Mark />
                  {PROVIDER_LABEL[p]}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-teal/10" />
            or with email
            <span className="h-px flex-1 bg-teal/10" />
          </div>
        </>
      )}

      <div className="flex rounded-[11px] border border-teal/10 bg-cream p-1 text-sm" role="tablist">
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            type="button"
            onClick={() => setMode(m)}
            className={
              mode === m
                ? buttonClass("solid", "sm") + " flex-1 !rounded-[8px]"
                : "flex-1 rounded-[8px] py-2 text-muted transition-colors duration-150 hover:text-ink"
            }
          >
            {m === "in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3.5">
        {mode === "up" && (
          <label className="label">
            Your name
            <span className="relative">
              <FieldIcon>
                <FontAwesomeIcon icon={faUser} className="size-4" />
              </FieldIcon>
              <input name="name" className="field !pl-9" autoComplete="name" placeholder="Priya Rao" />
            </span>
          </label>
        )}
        <label className="label">
          Email
          <span className="relative">
            <FieldIcon>
              <FontAwesomeIcon icon={faEnvelope} className="size-4" />
            </FieldIcon>
            <input name="email" type="email" required className="field !pl-9" autoComplete="email" />
          </span>
        </label>
        <div className="label">
          <span className="flex items-center justify-between">
            <label htmlFor="password">Password</label>
            {mode === "in" && (
              <button type="button" onClick={() => setForgot(true)} className="font-medium normal-case text-sage hover:underline">
                Forgot password?
              </button>
            )}
          </span>
          <span className="relative">
            <FieldIcon>
              <FontAwesomeIcon icon={faLock} className="size-4" />
            </FieldIcon>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="field !pl-9 !pr-9"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="size-4" />
            </button>
          </span>
        </div>
        {error && <p className="rounded-lg bg-[#F8E3DC] px-3 py-2 text-sm text-[#9A3A26]">{error}</p>}
        <Button variant="solid" type="submit" disabled={busy} className="mt-1 w-full">
          {busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
