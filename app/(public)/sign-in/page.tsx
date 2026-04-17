import { FolderOpen } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <FolderOpen className="h-12 w-12" />
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}