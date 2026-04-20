import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started"
    >
      <SignUpForm />
    </AuthCard>
  );
}
