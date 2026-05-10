import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { VerifyEmailHandler } from "@/components/auth/verify-email-handler";
import { AuthPageSkeleton } from "@/components/auth/auth-page-skeleton";

export default async function VerifyEmailPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SplitAuthLayout
      tagline="Check your email"
      subCopy="We've sent you a verification link."
      showDashboardPreview={false}
    >
      <Suspense fallback={<AuthPageSkeleton />}>
        <VerifyEmailHandler />
      </Suspense>
    </SplitAuthLayout>
  );
}
