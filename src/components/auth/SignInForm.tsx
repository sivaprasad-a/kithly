"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

const PROVIDER_LABEL = { google: "Continue with Google", facebook: "Continue with Facebook" } as const;

export function SignInForm({ providers, next }: { providers: Array<"google" | "facebook">; next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="mt-6 grid gap-4">
      {providers.length > 0 && (
        <>
          <div className="grid gap-2">
            {providers.map((p) => (
              <Button
                key={p}
                type="button"
                onClick={() => authClient.signIn.social({ provider: p, callbackURL: next })}
                className="w-full"
              >
                {PROVIDER_LABEL[p]}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-teal/10" />
            or with email
            <span className="h-px flex-1 bg-teal/10" />
          </div>
        </>
      )}

      <div className="flex rounded-[9px] bg-cream p-1 text-sm" role="tablist">
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-[7px] py-1.5 ${mode === m ? "bg-white font-medium text-teal shadow-sm" : "text-muted"}`}
          >
            {m === "in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        {mode === "up" && (
          <label className="label">
            Your name
            <input name="name" className="field" autoComplete="name" placeholder="Priya Rao" />
          </label>
        )}
        <label className="label">
          Email
          <input name="email" type="email" required className="field" autoComplete="email" />
        </label>
        <label className="label">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
        </label>
        {error && <p className="rounded-lg bg-[#F8E3DC] px-3 py-2 text-sm text-[#9A3A26]">{error}</p>}
        <Button variant="solid" type="submit" disabled={busy} className="mt-1 w-full">
          {busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
