import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId } from "../../lib/clerk-id";

/**
 * Delete a child (with parent verification).
 */
export const deleteChildById = mutation({
    args: {
      childId: v.id("children"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
      const user = await getUserByClerkUserId(ctx);
  
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
  
  