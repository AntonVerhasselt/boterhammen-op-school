import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all schools, optionally filtered by search term.
 */
export const listSchools = query({
  args: {
    search: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("schools"),
      _creationTime: v.number(),
      name: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const schoolsQuery = ctx.db.query("schools");

    if (args.search && args.search.trim().length > 0) {
      // Filter schools by name (case-insensitive partial match)
      const searchLower = args.search.toLowerCase().trim();
      const allSchools = await schoolsQuery.collect();
      return allSchools.filter((school) =>
        school.name.toLowerCase().includes(searchLower)
      );
    }

    return await schoolsQuery.collect();
  },
});

/**
 * List classes for a specific school, optionally filtered by search term.
 */
export const listClassesBySchool = query({
  args: {
    schoolId: v.id("schools"),
    search: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("classes"),
      _creationTime: v.number(),
      schoolId: v.id("schools"),
      name: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const classesQuery = ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId));

    if (args.search && args.search.trim().length > 0) {
      // Filter classes by name (case-insensitive partial match)
      const searchLower = args.search.toLowerCase().trim();
      const allClasses = await classesQuery.collect();
      return allClasses.filter((classItem) =>
        classItem.name.toLowerCase().includes(searchLower)
      );
    }

    return await classesQuery.collect();
  },
});

