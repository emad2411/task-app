import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SplitAuthLayout
      tagline="Your tasks. Your flow."
      subCopy="Sign in to pick up where you left off."
      showDashboardPreview={true}
    >
      <SignInForm />
    </SplitAuthLayout>
  );
}
