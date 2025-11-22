import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create offDay entries for all dates in a range for multiple schools.
 * Skips entries that already exist for a school+date combination.
 */
export const createOffDays = mutation({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
    schoolIds: v.array(v.id("schools")),
    reason: v.optional(v.string()),
  },
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    const { startDate, endDate, schoolIds, reason } = args;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      throw new Error("startDate must be before or equal to endDate");
    }

    // Helper to format date as YYYY-MM-DD using UTC to avoid timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Generate all dates in the range
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(formatDate(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    let created = 0;
    let skipped = 0;

    // For each date and each school, check if entry exists and create if not
    for (const date of dates) {
      for (const schoolId of schoolIds) {
        // Check if entry already exists using composite index
        const existing = await ctx.db
          .query("offDays")
          .withIndex("by_schoolId_and_date", (q) =>
            q.eq("schoolId", schoolId).eq("date", date)
          )
          .first();

        if (existing) {
          skipped++;
        } else {
          // Create new entry
          await ctx.db.insert("offDays", {
            date,
            schoolId,
            reason,
          });
          created++;
        }
      }
    }

    return { created, skipped };
  },
});

