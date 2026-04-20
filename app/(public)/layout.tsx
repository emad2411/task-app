import { ReactNode } from "react";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px]">
        {children}
      </div>
      <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        <p>
          By continuing, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
