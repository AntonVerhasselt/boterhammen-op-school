import { query } from "../_generated/server";
import { v } from "convex/values";

export const listSchools = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("schools"),
      _creationTime: v.number(),
      name: v.string(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("schools").withIndex("by_name").collect();
  },
});
