"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { ColorPicker } from "./color-picker";
import { z } from "zod";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    color: string | null;
  };
  onSubmit: (data: { name: string; color?: string }) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  submitLabel?: string;
}

const categoryNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").trim(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof categoryNameSchema>;

export function CategoryForm({
  category,
  onSubmit,
  onSuccess,
  submitLabel = category ? "Save Changes" : "Create Category",
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(categoryNameSchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? undefined,
    },
  });

  const onSubmitAction = handleSubmit(async (data) => {
    startTransition(async () => {
      const result = await onSubmit(data);

      if (result.success) {
        toast.success(category ? "Category updated" : "Category created");
        onSuccess?.();
      } else if (result.error) {
        setError("root", { message: result.error });
      }
    });
  });

  return (
    <form onSubmit={onSubmitAction} className="space-y-4">
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category-name">Name *</FieldLabel>
              <Input
                {...field}
                id="category-name"
                placeholder="Enter category name"
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
          name="color"
          control={control}
          render={({ field }) => (
            <Field>
              <ColorPicker
                value={field.value}
                onChange={(color) => field.onChange(color)}
              />
            </Field>
          )}
        />
      </FieldGroup>

      {errors.root && (
        <p className="text-sm text-destructive">{String(errors.root.message)}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}