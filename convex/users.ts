import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMyUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a user profile");
    }

    const email = identity.email;
    const clerkUserId = identity.subject;

    if (!email) {
      throw new Error("User email is required");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (existingUser) {
      throw new Error("User profile already exists");
    }

    // Insert new user
    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumber: args.phoneNumber,
      email,
      clerkUserId,
    });

    return userId;
  },
});

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

