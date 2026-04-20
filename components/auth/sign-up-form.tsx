"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import {
  signUpSchema,
  type SignUpInput,
} from "@/lib/validation/auth";
import { signUpAction } from "@/lib/actions/auth";
import { SuccessCard } from "./auth-card";

const signUpFormSchema = signUpSchema.extend({
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormInput = z.infer<typeof signUpFormSchema>;

interface SignUpFormProps {
  onSuccess?: (email: string) => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: SignUpFormInput) {
    startTransition(async () => {
      const result = await signUpAction({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        setRegisteredEmail(data.email);
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(data.email);
        }
      } else {
        form.setError("root", {
          type: "server",
          message: result.error || "Failed to create account"
        });
      }
    });
  }

  if (isSuccess) {
    return (
      <SuccessCard
        title="Check your email"
        message={`We've sent a verification link to ${registeredEmail}. Click the link to verify your account.`}
      >
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="outline"
            onClick={() => window.location.href = `mailto:${registeredEmail}`}
          >
            Open email app
          </Button>
          <div className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              toast.info("Resend functionality coming soon");
            }}
          >
            Resend email
          </Button>
          <Link
            href="/sign-in"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </SuccessCard>
    );
  }

  return (
    <form
      id="sign-up-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {form.formState.errors.root && (
        <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-md">
          {form.formState.errors.root.message}
        </div>
      )}
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
              <Input
                {...field}
                id="sign-up-name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
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

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="sign-up-password"
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
              <FieldLabel htmlFor="sign-up-confirm-password">Confirm Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="sign-up-confirm-password"
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
        form="sign-up-form"
        className="w-full"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline underline-offset-4 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
