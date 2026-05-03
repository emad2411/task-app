import { ZodError } from "zod/v4";

/**
 * Handles errors thrown in server actions by logging them server-side
 * and returning a sanitized, user-friendly error message.
 *
 * NEVER returns the raw `error.message` to the client — this prevents
 * leaking internal error details (database schema, stack traces, etc.).
 *
 * @param actionName - Name of the action for logging (e.g., "[createTaskAction]")
 * @param error - The caught error object
 * @param fallbackMessage - User-friendly message to return to the client
 * @returns An ActionResult with `success: false` and the sanitized error
 *
 * @example
 * ```ts
 * } catch (error) {
 *   return handleActionError("[createTaskAction]", error, "Failed to create task");
 * }
 * ```
 */
export function handleActionError(
  actionName: string,
  error: unknown,
  fallbackMessage: string
): { success: false; error: string } {
  // Zod validation errors — return a generic validation message
  // instead of leaking schema structure
  if (error instanceof ZodError) {
    console.error(actionName, "Validation error:", error.issues);
    return {
      success: false,
      error: "Invalid input. Please check your data and try again.",
    };
  }

  // Log the full error server-side for debugging
  console.error(actionName, error);

  // Return a generic, user-friendly message — never the raw error
  return {
    success: false,
    error: `${fallbackMessage}. Please try again.`,
  };
}
