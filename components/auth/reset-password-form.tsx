"use client";

import { useState, useTransition, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, FolderOpen } from "lucide-react";
import { z } from "zod";

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
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { resetPasswordAction } from "@/lib/actions/auth";
import { SuccessCard } from "./auth-card";

const resetPasswordFormSchema = resetPasswordSchema
  .extend({
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token. Please request a new password reset link.");
    } else {
      form.setValue("token", token);
    }
  }, [token, form]);

  function onSubmit(data: ResetPasswordFormInput) {
    if (!token) {
      setTokenError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({
        token: data.token,
        newPassword: data.newPassword,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    });
  }

  if (isSuccess) {
    return (
      <SuccessCard
        title="Password Reset Successful"
        message="Your password has been updated. You can now sign in with your new password."
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

  if (tokenError) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline underline-offset-4 font-medium text-sm"
              >
                Request new reset link
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
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
          Reset your password
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <form
          id="reset-password-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password-new">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="reset-password-new"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password-confirm">Confirm Password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="reset-password-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            form="reset-password-form"
            className="w-full"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
