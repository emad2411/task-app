import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email to receive a reset link"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
