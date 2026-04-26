import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageSkeleton } from "@/components/auth/auth-page-skeleton";

export default async function ResetPasswordPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
