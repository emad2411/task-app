import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { VerifyEmailHandler } from "@/components/auth/verify-email-handler";

export default async function VerifyEmailPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="py-4 text-center text-muted-foreground">Loading...</div>}>
      <VerifyEmailHandler />
    </Suspense>
  );
}
