import type { User as BetterAuthUser, Session as BetterAuthSession } from "better-auth";

// We redefine the types to allow both Date (on server) and string (after serialization to client)
// This avoids type mismatches in Next.js App Router layouts/components.
export type User = Omit<BetterAuthUser, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Session = Omit<BetterAuthSession, "expiresAt" | "createdAt" | "updatedAt"> & {
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export interface AuthSession {
  user: User;
  session: Session;
}
