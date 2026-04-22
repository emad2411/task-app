import { describe, it, expect } from "vitest";
import {
  isDueToday,
  isOverdue,
  getDueDateBucket,
  formatDate,
  formatRelativeDate,
  toUserTimezone,
  fromUserTimezone,
  getStartOfTodayInTimezone,
  getEndOfTodayInTimezone,
  getUpcomingThreshold,
} from "./date";

describe("date utilities", () => {
  const UTC = "UTC";
  const PST = "America/Los_Angeles";
  const JST = "Asia/Tokyo";

  describe("toUserTimezone", () => {
    it("should convert UTC date to user timezone", () => {
      const utcDate = new Date("2026-04-21T12:00:00Z");
      const zonedDate = toUserTimezone(utcDate, UTC);
      expect(zonedDate).toBeInstanceOf(Date);
    });
  });

  describe("fromUserTimezone", () => {
    it("should convert user timezone date to UTC", () => {
      const date = new Date();
      const utcDate = fromUserTimezone(date, UTC);
      expect(utcDate).toBeInstanceOf(Date);
    });
  });

  describe("getStartOfTodayInTimezone", () => {
    it("should return start of today in UTC", () => {
      const start = getStartOfTodayInTimezone(UTC);
      expect(start).toBeInstanceOf(Date);
      // Should be midnight UTC for current day
      expect(start.getUTCHours()).toBe(0);
      expect(start.getUTCMinutes()).toBe(0);
      expect(start.getUTCSeconds()).toBe(0);
    });

    it("should handle different timezones", () => {
      const startPST = getStartOfTodayInTimezone(PST);
      const startUTC = getStartOfTodayInTimezone(UTC);
      expect(startPST).toBeInstanceOf(Date);
      expect(startUTC).toBeInstanceOf(Date);
    });
  });

  describe("getEndOfTodayInTimezone", () => {
    it("should return end of today in UTC", () => {
      const end = getEndOfTodayInTimezone(UTC);
      expect(end).toBeInstanceOf(Date);
    });
  });

  describe("isDueToday", () => {
    it("should return true for today's date in UTC", () => {
      const today = new Date();
      expect(isDueToday(today, UTC)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isDueToday(yesterday, UTC)).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDueToday(tomorrow, UTC)).toBe(false);
    });

    it("should return false for null date", () => {
      expect(isDueToday(null, UTC)).toBe(false);
    });

    it("should return false for undefined date", () => {
      expect(isDueToday(undefined, UTC)).toBe(false);
    });

    it("should respect timezone boundaries", () => {
      // 2026-04-21T23:00:00Z is April 22 in JST (UTC+9)
      const lateUtc = new Date("2026-04-21T23:00:00Z");
      expect(isDueToday(lateUtc, JST)).toBe(true);
    });
  });

  describe("isOverdue", () => {
    it("should return true for past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isOverdue(yesterday, UTC)).toBe(true);
    });

    it("should return false for today's date", () => {
      const today = new Date();
      expect(isOverdue(today, UTC)).toBe(false);
    });

    it("should return false for future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isOverdue(tomorrow, UTC)).toBe(false);
    });

    it("should return false for null date", () => {
      expect(isOverdue(null, UTC)).toBe(false);
    });

    it("should return false for undefined date", () => {
      expect(isOverdue(undefined, UTC)).toBe(false);
    });

    it("should handle timezone properly", () => {
      // April 21 at 1am PST = April 21 at 8am UTC
      // Since "now" is April 22, this is overdue regardless of timezone
      const pstLate = new Date("2026-04-21T01:00:00-07:00");
      expect(isOverdue(pstLate, PST)).toBe(true);

      // A future date should not be overdue
      const pstFuture = new Date("2026-04-25T01:00:00-07:00");
      expect(isOverdue(pstFuture, PST)).toBe(false);
    });
  });

  describe("getDueDateBucket", () => {
    it("should return 'today' for today's date", () => {
      const today = new Date();
      expect(getDueDateBucket(today, UTC)).toBe("today");
    });

    it("should return 'overdue' for past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getDueDateBucket(yesterday, UTC)).toBe("overdue");
    });

    it("should return 'upcoming' for future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getDueDateBucket(tomorrow, UTC)).toBe("upcoming");
    });

    it("should return 'no_due_date' for null", () => {
      expect(getDueDateBucket(null, UTC)).toBe("no_due_date");
    });

    it("should return 'no_due_date' for undefined", () => {
      expect(getDueDateBucket(undefined, UTC)).toBe("no_due_date");
    });
  });

  describe("formatDate", () => {
    it("should format date with default format", () => {
      const date = new Date("2026-04-21T12:00:00Z");
      const formatted = formatDate(date, "MMM dd, yyyy", UTC);
      expect(formatted).toBe("Apr 21, 2026");
    });

    it("should format date with custom format", () => {
      const date = new Date("2026-04-21T12:00:00Z");
      const formatted = formatDate(date, "yyyy-MM-dd", UTC);
      expect(formatted).toBe("2026-04-21");
    });

    it("should return empty string for null date", () => {
      expect(formatDate(null, "MMM dd", UTC)).toBe("");
    });

    it("should return empty string for undefined date", () => {
      expect(formatDate(undefined, "MMM dd", UTC)).toBe("");
    });

    it("should respect timezone", () => {
      // 2026-04-21T23:00:00Z is April 22 in JST
      const lateUtc = new Date("2026-04-21T23:00:00Z");
      const formatted = formatDate(lateUtc, "MMM dd", JST);
      expect(formatted).toBe("Apr 22");
    });
  });

  describe("formatRelativeDate", () => {
    it("should return 'Today' for today", () => {
      const today = new Date();
      expect(formatRelativeDate(today, UTC)).toBe("Today");
    });

    it("should return 'Tomorrow' for tomorrow", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDate(tomorrow, UTC)).toBe("Tomorrow");
    });

    it("should return formatted date for other dates", () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const result = formatRelativeDate(nextWeek, UTC);
      expect(result).not.toBe("Today");
      expect(result).not.toBe("Tomorrow");
      expect(result).toMatch(/[A-Z][a-z]{2} \d{2}/); // e.g., "Apr 28"
    });

    it("should return 'No due date' for null", () => {
      expect(formatRelativeDate(null, UTC)).toBe("No due date");
    });

    it("should return 'No due date' for undefined", () => {
      expect(formatRelativeDate(undefined, UTC)).toBe("No due date");
    });
  });

  describe("getUpcomingThreshold", () => {
    it("should return date 7 days from now by default", () => {
      const threshold = getUpcomingThreshold(UTC, 7);
      const now = new Date();
      const diffDays = Math.round(
        (threshold.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    });

    it("should handle custom day counts", () => {
      const threshold = getUpcomingThreshold(UTC, 3);
      const now = new Date();
      const diffDays = Math.round(
        (threshold.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeGreaterThanOrEqual(2);
      expect(diffDays).toBeLessThanOrEqual(4);
    });
  });
});
