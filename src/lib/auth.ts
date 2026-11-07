import "server-only";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";
import { getMongo, hasMongo } from "@/lib/db/mongo-client";

/**
 * Hosts sign in; guests never need an account (they use their family link).
 *
 * Free sign-in options:
 *  - Email + password: always on, no setup.
 *  - Google: free. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 *  - Facebook (covers Meta/Instagram users): free. Set FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET.
 *  (Instagram has no "Sign in with Instagram" for consumer apps; Apple sign-in needs a paid developer account.)
 */
const socialProviders: BetterAuthOptions["socialProviders"] = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET };
}
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  socialProviders.facebook = { clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET };
}

const g = globalThis as unknown as { __authMem?: Record<string, unknown[]> };
const memDb = (g.__authMem ??= { user: [], session: [], account: [], verification: [] });

// On Vercel, fall back to the project's stable production domain (kithly-dev.vercel.app etc.).
const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const auth = betterAuth({
  baseURL,
  database: hasMongo() ? mongodbAdapter(getMongo().db, { client: getMongo().client }) : memoryAdapter(memDb as never),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders,
  plugins: [nextCookies()],
});

export const enabledSocialProviders = Object.keys(socialProviders) as Array<"google" | "facebook">;
