"use client";

import { useState, useTransition, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  verifyEmailSchema,
  forgotPasswordSchema,
  type VerifyEmailInput,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { verifyEmailAction } from "@/lib/actions/auth";
import { SuccessCard } from "./auth-card";

export function VerifyEmailHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

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
          setError(result.error || "Failed to verify email");
        }
      });
    } else {
      setIsLoading(false);
      setError("No verification token provided");
    }
  }, [token]);

  function handleResend(data: ForgotPasswordInput) {
    toast.info("Resend functionality coming soon");
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <SuccessCard
        title="Email Verified"
        message="Your email has been verified successfully. You can now sign in to your account."
      >
        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={() => {
              window.location.href = "/sign-in";
            }}
          >
            Sign In
          </Button>
        </div>
      </SuccessCard>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center font-semibold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Confirm your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
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
              className="w-full"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Verification Email
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
