import { auth } from "./auth";
import { headers } from "next/headers";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function getSession(): Promise<Session> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}