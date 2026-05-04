/**
 * Standard return type for all server actions.
 *
 * Every server action returns this shape so client components
 * can handle success/error uniformly.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
