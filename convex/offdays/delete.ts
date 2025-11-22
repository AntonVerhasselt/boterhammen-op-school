import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteOffDay = mutation({
  args: {
    offDayId: v.id("offDays"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.offDayId);
    return null;
  },
});

