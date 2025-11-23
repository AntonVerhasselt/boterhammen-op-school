import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId as getUserByClerkUserIdHelper } from "../../lib/clerk-id";

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
      stripeCustomerId: v.optional(v.string()),
      accessExpiresAt: v.optional(v.string()),
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

/**
 * Internal query to get user by clerkUserId.
 */
export const getUserByClerkUserId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      phoneNumber: v.string(),
      email: v.string(),
      clerkUserId: v.string(),
      stripeCustomerId: v.optional(v.string()),
      accessExpiresAt: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    return user ?? null;
  },
});

/**
 * Internal query to get the authenticated user using the helper function.
 */
export const getAuthenticatedUser = internalQuery({
  args: {},
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    clerkUserId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    accessExpiresAt: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    return await getUserByClerkUserIdHelper(ctx);
  },
});