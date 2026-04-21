import {
  isSameDay,
  isBefore,
  startOfDay,
  endOfDay,
  format,
  addDays,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export type DueDateBucket = "today" | "upcoming" | "overdue" | "no_due_date";

/**
 * Converts a UTC date to the user's timezone
 */
export function toUserTimezone(date: Date, timezone: string = "UTC"): Date {
  return toZonedTime(date, timezone);
}

/**
 * Converts a date from the user's timezone to UTC
 */
export function fromUserTimezone(date: Date, timezone: string = "UTC"): Date {
  return fromZonedTime(date, timezone);
}

/**
 * Gets the start of today in the user's timezone
 */
export function getStartOfTodayInTimezone(timezone: string = "UTC"): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const startOfTodayZoned = startOfDay(zonedNow);
  return fromZonedTime(startOfTodayZoned, timezone);
}

/**
 * Gets the end of today in the user's timezone
 */
export function getEndOfTodayInTimezone(timezone: string = "UTC"): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const endOfTodayZoned = endOfDay(zonedNow);
  return fromZonedTime(endOfTodayZoned, timezone);
}

/**
 * Checks if a due date is today in the user's timezone
 */
export function isDueToday(
  dueDate: Date | null | undefined,
  timezone: string = "UTC"
): boolean {
  if (!dueDate) return false;

  const zonedDueDate = toUserTimezone(dueDate, timezone);
  const zonedNow = toUserTimezone(new Date(), timezone);

  return isSameDay(zonedDueDate, zonedNow);
}

/**
 * Checks if a task is overdue (due date is before today and not completed)
 */
export function isOverdue(
  dueDate: Date | null | undefined,
  timezone: string = "UTC"
): boolean {
  if (!dueDate) return false;

  const zonedDueDate = toUserTimezone(dueDate, timezone);
  const zonedNow = toUserTimezone(new Date(), timezone);
  const startOfTodayZoned = startOfDay(zonedNow);

  return isBefore(zonedDueDate, startOfTodayZoned);
}

/**
 * Gets the due date bucket for a task
 */
export function getDueDateBucket(
  dueDate: Date | null | undefined,
  timezone: string = "UTC"
): DueDateBucket {
  if (!dueDate) return "no_due_date";

  if (isDueToday(dueDate, timezone)) return "today";
  if (isOverdue(dueDate, timezone)) return "overdue";
  return "upcoming";
}

/**
 * Formats a date according to the specified format string and timezone
 */
export function formatDate(
  date: Date | null | undefined,
  formatString: string = "MMM dd, yyyy",
  timezone: string = "UTC"
): string {
  if (!date) return "";

  const zonedDate = toUserTimezone(date, timezone);
  return format(zonedDate, formatString);
}

/**
 * Formats a date as a relative string (Today, Tomorrow, or formatted date)
 */
export function formatRelativeDate(
  date: Date | null | undefined,
  timezone: string = "UTC"
): string {
  if (!date) return "No due date";

  const zonedDate = toUserTimezone(date, timezone);
  const zonedNow = toUserTimezone(new Date(), timezone);

  if (isSameDay(zonedDate, zonedNow)) {
    return "Today";
  }

  const zonedTomorrow = addDays(zonedNow, 1);
  if (isSameDay(zonedDate, zonedTomorrow)) {
    return "Tomorrow";
  }

  return format(zonedDate, "MMM dd");
}

/**
 * Gets the date 7 days from now in the user's timezone (for upcoming tasks)
 */
export function getUpcomingThreshold(
  timezone: string = "UTC",
  days: number = 7
): Date {
  const zonedNow = toUserTimezone(new Date(), timezone);
  const zonedFuture = addDays(endOfDay(zonedNow), days - 1);
  return fromZonedTime(zonedFuture, timezone);
}

/**
 * Gets the start of the current day in UTC (for database queries)
 */
export function getTodayStartForQuery(timezone: string = "UTC"): Date {
  return getStartOfTodayInTimezone(timezone);
}

/**
 * Gets the end of the current day in UTC (for database queries)
 */
export function getTodayEndForQuery(timezone: string = "UTC"): Date {
  return getEndOfTodayInTimezone(timezone);
}
