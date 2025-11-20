import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all children for the logged-in parent.
 */
export const listMyChildren = query({
    args: {},
    returns: v.array(
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
      })
    ),
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }
  
      const clerkUserId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();
  
      if (!user) {
        return [];
      }
  
      return await ctx.db
        .query("children")
        .withIndex("by_parentId", (q) => q.eq("parentId", user._id))
        .collect();
    },
  });
  
  /**
   * Get all children for the logged-in parent with school and class names resolved.
   */
  export const listMyChildrenWithSchoolAndClassNames = query({
    args: {},
    returns: v.array(
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
      })
    ),
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }
  
      const clerkUserId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();
  
      if (!user) {
        return [];
      }
  
      const children = await ctx.db
        .query("children")
        .withIndex("by_parentId", (q) => q.eq("parentId", user._id))
        .collect();
  
      // Fetch all unique school IDs
      const schoolIds = [...new Set(children.map((c) => c.schoolId))];
      const schools = await Promise.all(
        schoolIds.map((id) => ctx.db.get(id))
      );
      const schoolMap = new Map(
        schools.filter((s) => s !== null).map((s) => [s!._id, s!.name])
      );
  
      // Fetch all unique class IDs
      const classIds = [...new Set(children.map((c) => c.classId))];
      const classes = await Promise.all(
        classIds.map((id) => ctx.db.get(id))
      );
      const classMap = new Map(
        classes.filter((c) => c !== null).map((c) => [c!._id, c!.name])
      );
  
      // Combine children with school and class names
      return children.map((child) => ({
        ...child,
        schoolName: schoolMap.get(child.schoolId) || "Unknown",
        className: classMap.get(child.classId) || "Unknown",
      }));
    },
  });