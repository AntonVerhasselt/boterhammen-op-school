import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get a single child by ID (with parent verification).
 */
export const getChildById = query({
    args: {
      childId: v.id("children"),
    },
    returns: v.union(
      v.object({
        _id: v.id("children"),
        _creationTime: v.number(),
        parentId: v.id("users"),
        firstName: v.string(),
        lastName: v.string(),
        schoolId: v.id("schools"),
        classId: v.id("classes"),
        preferences: v.object({
          allergies: v.optional(v.string()),
          breadType: v.union(
            v.literal("white"),
            v.literal("brown"),
            v.literal("none")
          ),
          crust: v.boolean(),
          butter: v.boolean(),
        }),
      }),
      v.null()
    ),
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
  
      const clerkUserId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();
  
      if (!user) {
        return null;
      }
  
      const child = await ctx.db.get(args.childId);
      if (!child) {
        return null;
      }
  
      // Verify parent ownership
      if (child.parentId !== user._id) {
        return null;
      }
  
      return child;
    },
  });
  
  /**
   * Get a single child by ID with school and class names resolved (with parent verification).
   */
  export const getChildByIdWithSchoolAndClassNames = query({
    args: {
      childId: v.id("children"),
    },
    returns: v.union(
      v.object({
        _id: v.id("children"),
        _creationTime: v.number(),
        parentId: v.id("users"),
        firstName: v.string(),
        lastName: v.string(),
        schoolId: v.id("schools"),
        classId: v.id("classes"),
        schoolName: v.string(),
        className: v.string(),
        preferences: v.object({
          allergies: v.optional(v.string()),
          breadType: v.union(
            v.literal("white"),
            v.literal("brown"),
            v.literal("none")
          ),
          crust: v.boolean(),
          butter: v.boolean(),
        }),
      }),
      v.null()
    ),
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
  
      const clerkUserId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();
  
      if (!user) {
        return null;
      }
  
      const child = await ctx.db.get(args.childId);
      if (!child) {
        return null;
      }
  
      // Verify parent ownership
      if (child.parentId !== user._id) {
        return null;
      }
  
      // Fetch school and class names
      const school = await ctx.db.get(child.schoolId);
      const classItem = await ctx.db.get(child.classId);
  
      return {
        ...child,
        schoolName: school?.name || "Unknown",
        className: classItem?.name || "Unknown",
      };
    },
  });
  