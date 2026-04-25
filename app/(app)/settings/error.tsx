"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * SettingsError — Error boundary for the settings page.
 *
 * Catches errors thrown during settings page rendering and provides
 * a user-friendly error message with a retry action.
 *
 * @param props - The error boundary props
 * @param props.error - The error object caught by the boundary
 * @param props.reset - Function to reset the error boundary and retry rendering
 * @returns The error boundary fallback UI
 */
export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          We couldn&apos;t load your settings. Please try again.
        </p>
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  );
}
