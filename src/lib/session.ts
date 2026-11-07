import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type CurrentUser = { id: string; name: string; email: string };

/** Returns the signed-in host, or null. Must be called inside a <Suspense> boundary. */
export async function getUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

export async function requireUser(next = "/dashboard"): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}
