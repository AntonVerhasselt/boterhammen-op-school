import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all off days for a specific child's school within a date range.
 * Includes database-stored off days and automatically generated Wednesdays, Saturdays, and Sundays.
 */
export const listFutureOffDaysByChildId = query({
  args: {
    childId: v.id("children"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const { childId, startDate, endDate } = args;

    // 1. Get the child to find their school
    const child = await ctx.db.get(childId);
    if (!child) {
      throw new Error("Child not found");
    }
    const schoolId = child.schoolId;

    // 2. Query offDays from database using composite index
    const offDays = await ctx.db
      .query("offDays")
      .withIndex("by_schoolId_and_date", (q) =>
        q
          .eq("schoolId", schoolId)
          .gte("date", startDate)
          .lte("date", endDate)
      )
      .collect();

    const offDayDates = new Set<string>(offDays.map((day) => day.date));

    // 3. Generate Wednesdays, Saturdays, and Sundays
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    // Helper to format date as YYYY-MM-DD using UTC to avoid timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    while (current <= end) {
      const dayOfWeek = current.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      
      // 3 is Wednesday, 6 is Saturday, 0 is Sunday
      if (dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0) {
        offDayDates.add(formatDate(current));
      }

      // Move to next day using UTC to ensure we stay at 00:00:00 UTC
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // 4. Return deduplicated sorted array
    return Array.from(offDayDates).sort();
  },
});
