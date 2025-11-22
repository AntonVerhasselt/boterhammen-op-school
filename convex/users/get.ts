import { query } from "../_generated/server";
import { v } from "convex/values";

export const getMyUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      phoneNumber: v.string(),
      email: v.string(),
      clerkUserId: v.string(),
      subscription: v.optional(v.object({
        stripePaymentIntentId: v.optional(v.string()),
        activatedAt: v.optional(v.string()),
        expiresAt: v.optional(v.string()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    return user ?? null;
  },
});