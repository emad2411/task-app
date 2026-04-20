import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <SignInForm />
    </AuthCard>
  );
}
