import { z } from "zod";

/**
 * Valid theme preference values for the application.
 */
export const themeValues = ["light", "dark", "system"] as const;

/**
 * Valid date format options for display.
 */
export const dateFormatValues = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "MMM d, yyyy",
] as const;

/**
 * Valid default task sort order values.
 */
export const defaultSortValues = [
  "due_date_asc",
  "due_date_desc",
  "created_at_desc",
  "created_at_asc",
  "updated_at_desc",
  "priority_desc",
  "priority_asc",
  "title_asc",
  "title_desc",
] as const;

/**
 * Schema for updating the user's profile (display name).
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
});

/**
 * Schema for updating user preferences.
 * All fields are optional to support partial updates.
 */
export const updatePreferencesSchema = z.object({
  theme: z.enum(themeValues).optional(),
  timezone: z.string().min(1).optional(),
  dateFormat: z.enum(dateFormatValues).optional(),
  defaultTaskSort: z.enum(defaultSortValues).optional(),
});

/** Input type for profile updates */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Input type for preference updates */
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
