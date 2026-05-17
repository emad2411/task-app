"use client";

import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updatePreferencesSchema,
  type UpdatePreferencesInput,
} from "@/lib/validation/settings";
import { updatePreferencesAction } from "@/lib/actions/settings";
import { TimezoneCombobox } from "./timezone-combobox";

interface PreferencesFormProps {
  /** The user's current preferences from the database */
  defaultValues: {
    timezone: string;
    dateFormat: string;
    defaultTaskSort: string;
  };
}

/**
 * Date format options with display labels.
 */
const dateFormatOptions = [
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
  { value: "MMM d, yyyy", label: "MMM D, YYYY" },
];

/**
 * Default task sort options with display labels.
 */
const sortOptions = [
  { value: "due_date_asc", label: "Due Date (Earliest first)" },
  { value: "due_date_desc", label: "Due Date (Latest first)" },
  { value: "created_at_desc", label: "Created Date (Newest first)" },
  { value: "created_at_asc", label: "Created Date (Oldest first)" },
  { value: "updated_at_desc", label: "Updated Date (Recently updated)" },
  { value: "priority_desc", label: "Priority (High to Low)" },
  { value: "priority_asc", label: "Priority (Low to High)" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
];

/**
 * Formats a date according to the selected date format.
 *
 * @param date - The date to format
 * @param format - The date format string
 * @returns The formatted date string
 */
function formatDatePreview(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const shortMonth = date.toLocaleDateString("en-US", { month: "short" });

  switch (format) {
    case "MM/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "MMM d, yyyy":
      return `${shortMonth} ${date.getDate()}, ${year}`;
    default:
      return date.toLocaleDateString();
  }
}

/**
 * PreferencesForm — User preferences form for the settings page.
 *
 * Allows users to configure their timezone, date format, and default
 * task sort order. Includes a live preview of the selected date format.
 *
 * @param props - Component props
 * @returns The preferences form card component
 */
export function PreferencesForm({ defaultValues }: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdatePreferencesInput>({
    resolver: zodResolver(updatePreferencesSchema),
    defaultValues: defaultValues as UpdatePreferencesInput,
  });

  const selectedDateFormat = useWatch<UpdatePreferencesInput>({
    control: form.control,
    name: "dateFormat",
    defaultValue: defaultValues.dateFormat,
  });
  const todayPreview = formatDatePreview(new Date(), selectedDateFormat ?? defaultValues.dateFormat);

  /**
   * Handles form submission for preferences update.
   *
   * @param data - The validated form data
   */
  function onSubmit(data: UpdatePreferencesInput) {
    startTransition(async () => {
      const result = await updatePreferencesAction(data);

      if (result.success) {
        const message =
          typeof result.data === "object" &&
          result.data !== null &&
          "message" in result.data
            ? String((result.data as Record<string, unknown>).message)
            : "Preferences updated successfully";
        toast.success(message);
      } else {
        form.setError("root", {
          type: "server",
          message: result.error || "Failed to update preferences",
        });
      }
    });
  }

  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center gap-3 px-6 py-4 border-b">
        <SlidersHorizontal className="h-5 w-5 text-[#18E299]" />
        <div>
          <h2 className="text-base font-semibold">Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Customize your application experience
          </p>
        </div>
      </header>
      <div className="px-6 py-5">
        <form
          id="preferences-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {form.formState.errors.root && (
            <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              {form.formState.errors.root.message}
            </div>
          )}

          <FieldGroup>
            <Controller
              name="timezone"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                  <TimezoneCombobox
                    value={field.value ?? defaultValues.timezone}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </Field>
              )}
            />

            <Controller
              name="dateFormat"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="date-format">Date Format</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview: <span className="font-medium">{todayPreview}</span>
                  </p>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="defaultTaskSort"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="default-sort">Default Task Sort</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="default-sort">
                      <SelectValue placeholder="Select default sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              form="preferences-form" 
              disabled={isPending}
              className="bg-[#18E299] text-[#0d0d0d] hover:bg-[#0fa76e] font-semibold"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
