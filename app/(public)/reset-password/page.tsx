import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageSkeleton } from "@/components/auth/auth-page-skeleton";

export default async function ResetPasswordPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SplitAuthLayout
      tagline="Create a new password"
      subCopy="Choose a strong password you haven't used before."
      showDashboardPreview={false}
    >
      <Suspense fallback={<AuthPageSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </SplitAuthLayout>
  );
}
