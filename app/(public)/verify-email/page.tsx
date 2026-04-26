import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { VerifyEmailHandler } from "@/components/auth/verify-email-handler";
import { AuthPageSkeleton } from "@/components/auth/auth-page-skeleton";

export default async function VerifyEmailPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <VerifyEmailHandler />
    </Suspense>
  );
}
