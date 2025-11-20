import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Delete a child (with parent verification).
 */
export const deleteChildById = mutation({
    args: {
      childId: v.id("children"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("User must be authenticated to delete a child");
      }
  
      const clerkUserId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();
  
      if (!user) {
        throw new Error("User profile not found");
      }
  
      // Get child and verify parent ownership
      const child = await ctx.db.get(args.childId);
      if (!child) {
        throw new Error("Child not found");
      }
      if (child.parentId !== user._id) {
        throw new Error("You do not have permission to delete this child");
      }
  
      // Delete child
      await ctx.db.delete(args.childId);
  
      return null;
    },
  });
  
  