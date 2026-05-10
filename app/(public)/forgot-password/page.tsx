import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SplitAuthLayout
      tagline="Reset your password"
      subCopy="Enter your email and we'll send you a reset link."
      showDashboardPreview={false}
    >
      <ForgotPasswordForm />
    </SplitAuthLayout>
  );
}
