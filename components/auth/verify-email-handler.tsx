"use client";

import { useState, useTransition, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { verifyEmailAction } from "@/lib/actions/auth";
import { SuccessState } from "./success-state";

export function VerifyEmailHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasToken = !!token;
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(hasToken);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const error = !hasToken ? "No verification token provided" : apiError;

  const resendForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (token) {
      startTransition(async () => {
        const result = await verifyEmailAction({ token });
        setIsLoading(false);
        
        if (result.success) {
          setIsSuccess(true);
        } else {
          setApiError(result.error || "Failed to verify email");
        }
      });
    }
  }, [token]);

  function handleResend(_data: ForgotPasswordInput) {
    toast.info("Resend functionality coming soon");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
        <p className="text-sm text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <SuccessState
        title="Email Verified"
        message="Your email has been verified successfully. You can now sign in to your account."
      >
        <Button
          className="w-full bg-brand text-background hover:bg-brand-deep"
          onClick={() => {
            window.location.href = "/sign-in";
          }}
        >
          Sign In
        </Button>
      </SuccessState>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Enter your email below to resend the verification link.
        </p>
      </div>

      <form
        id="resend-verification-form"
        onSubmit={resendForm.handleSubmit(handleResend)}
        className="space-y-4"
      >
        <FieldGroup>
          <Controller
            name="email"
            control={resendForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="resend-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="resend-email"
                  type="email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          form="resend-verification-form"
          className="w-full bg-brand text-background hover:bg-brand-deep"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend Verification Email
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/sign-in"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
