"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

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
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { resetPasswordAction } from "@/lib/actions/auth";
import { SuccessState } from "./success-state";
import { BackToSignInLink } from "./back-to-sign-in-link";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tokenError = !token
    ? "Invalid or missing reset token. Please request a new password reset link."
    : "";

  const isSuccess = searchParams.get("success") === "true";

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ResetPasswordFormInput) {
    if (!token) {
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({
        token: data.token,
        newPassword: data.newPassword,
      });

      if (result.success) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("success", "true");
        router.replace(`?${params.toString()}`);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    });
  }

  if (isSuccess) {
    return (
      <SuccessState
        title="Password Reset Successful"
        message="Your password has been updated. You can now sign in with your new password."
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

  if (tokenError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{tokenError}</AlertDescription>
        </Alert>
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-foreground hover:underline underline-offset-4 font-medium text-sm"
          >
            Request new reset link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

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
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
          className="w-full bg-brand text-background hover:bg-brand-deep"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>

      <BackToSignInLink />
    </div>
  );
}
