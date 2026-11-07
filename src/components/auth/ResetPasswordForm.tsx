"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const newPassword = String(new FormData(e.currentTarget).get("password") || "");
    const res = await authClient.resetPassword({ newPassword, token });
    setBusy(false);
    if (res.error) {
      setError(res.error.message || "That reset link isn't valid anymore — request a new one.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/sign-in"), 1800);
  }

  if (done) {
    return <p className="mt-6 text-sm text-ink">Password updated. Taking you to sign in…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3.5">
      <label className="label">
        New password
        <span className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate">
            <FontAwesomeIcon icon={faLock} className="size-4" />
          </span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className="field !pl-9 !pr-9"
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
      </label>
      {error && <p className="rounded-lg bg-[#F8E3DC] px-3 py-2 text-sm text-[#9A3A26]">{error}</p>}
      <Button variant="solid" type="submit" disabled={busy} className="mt-1 w-full">
        {busy ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
