import { requireAuth } from "@/lib/auth/session";
import { getCategoriesForUser } from "@/lib/data/category";
import { AppShell } from "@/components/layout/app-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();
  const categories = user ? await getCategoriesForUser(user.id) : [];

  return <AppShell categories={categories}>{children}</AppShell>;
}
