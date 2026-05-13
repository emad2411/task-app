import { requireAuth } from "@/lib/auth/session";
import { getCategoriesForUser } from "@/lib/data/category";
import { AppShell } from "@/components/layout/app-shell";
import type { User, Session } from "@/lib/auth/types";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const { user } = session;
  const categories = user ? await getCategoriesForUser(user.id) : [];

  return (
    <AppShell
      categories={categories}
      user={user as User}
      session={session.session as Session}
    >
      {children}
    </AppShell>
  );
}
