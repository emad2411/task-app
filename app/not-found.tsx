import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const session = await getSession();
  const isAuthenticated = !!session;
  const href = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="rounded-xl border bg-card p-8 text-center max-w-md shadow-sm">
        <FileQuestion className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href={href}>
              {isAuthenticated ? "Go to Dashboard" : "Go Home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
