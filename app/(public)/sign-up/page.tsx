import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SplitAuthLayout
      tagline="Start your flow."
      subCopy="Create your account. No credit card required."
      showDashboardPreview={true}
    >
      <SignUpForm />
    </SplitAuthLayout>
  );
}
