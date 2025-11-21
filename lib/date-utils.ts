import { format, addDays, isWeekend, isSameDay, parseISO } from "date-fns";
import Holidays from "date-holidays";

/**
 * Get Belgian holidays for a given year
 */
function getBelgianHolidays(year: number): Date[] {
  const hd = new Holidays("BE");
  const holidays = hd.getHolidays(year);
  return holidays.map((holiday) => new Date(holiday.date));
}

/**
 * Check if a date is a holiday in Belgium
 */
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getBelgianHolidays(year);
  return holidays.some((holiday) => isSameDay(holiday, date));
}

/**
 * Check if a date is a workday (Monday-Friday, not a holiday)
 */
export function isWorkday(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * Add workdays to a date, skipping weekends and holidays
 */
export function addWorkdays(startDate: Date, workdaysToAdd: number): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < workdaysToAdd) {
    currentDate = addDays(currentDate, 1);
    if (isWorkday(currentDate)) {
      daysAdded++;
    }
  }

  return currentDate;
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Format a date to readable string (e.g., "Jan 15, 2025")
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

/**
 * Format a date range (e.g., "Jan 15 - Jan 20, 2025")
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  // If same year, format differently
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      // Same month: "Jan 15 - 20, 2025"
      return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
    } else {
      // Different months, same year: "Jan 15 - Feb 20, 2025"
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
  } else {
    // Different years: "Dec 15, 2024 - Jan 20, 2025"
    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  }
}

/**
 * Calculate end date based on order type and start date
 */
export function calculateEndDate(
  startDate: Date,
  orderType: "day-order" | "week-order" | "month-order"
): Date {
  switch (orderType) {
    case "day-order":
      return new Date(startDate);
    case "week-order":
      // WeekPicker selects Monday, so add 6 days to get Sunday (end of week)
      const weekEnd = new Date(startDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return weekEnd;
    case "month-order":
      // MonthPicker selects first day of month, so get last day of that month
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      return monthEnd;
    default:
      return new Date(startDate);
  }
}

