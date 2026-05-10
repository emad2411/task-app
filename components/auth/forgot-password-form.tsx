"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { SuccessState } from "./success-state";
import { BackToSignInLink } from "./back-to-sign-in-link";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);

      if (result.success) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("success", "true");
        router.replace(`?${params.toString()}`);
      } else {
        toast.error(result.error || "Failed to send reset link");
      }
    });
  }

  if (isSuccess) {
    return (
      <SuccessState
        title="Check your email"
        message="If an account exists with this email, you will receive a password reset link."
      >
        <BackToSignInLink />
      </SuccessState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form
        id="forgot-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="forgot-password-email"
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
          form="forgot-password-form"
          className="w-full bg-brand text-background hover:bg-brand-deep"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <BackToSignInLink />
    </div>
  );
}
