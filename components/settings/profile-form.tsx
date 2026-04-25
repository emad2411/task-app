"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validation/settings";
import { updateProfileAction } from "@/lib/actions/settings";

interface ProfileFormProps {
  /** The user's current display name */
  defaultName: string;
}

/**
 * ProfileForm — Display name update form for the settings page.
 *
 * Allows authenticated users to update their display name.
 * Uses React Hook Form + Zod for validation and calls
 * `updateProfileAction` on submit.
 *
 * @param props - Component props
 * @returns The profile form card component
 */
export function ProfileForm({ defaultName }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  /**
   * Handles form submission for profile update.
   *
   * @param data - The validated form data containing the new name
   */
  function onSubmit(data: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfileAction(data);

      if (result.success) {
        const message =
          typeof result.data === "object" &&
          result.data !== null &&
          "message" in result.data
            ? String((result.data as Record<string, unknown>).message)
            : "Profile updated successfully";
        toast.success(message);
        router.refresh();
      } else {
        form.setError("root", {
          type: "server",
          message: result.error || "Failed to update profile",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Update your public display name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
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
                  <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
                  <Input
                    {...field}
                    id="display-name"
                    type="text"
                    placeholder="Your name"
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
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button type="submit" form="profile-form" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
