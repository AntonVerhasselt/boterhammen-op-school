import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId } from "../../lib/clerk-id";

/**
 * Helper function to calculate the access expiration date.
 * Returns the last day of the next June formatted as "YYYY-MM-DD".
 */
function calculateAccessExpiresAt(): string {
  const now = new Date();
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  // June is month 5 (0-indexed)
  const expiresAt = new Date(year, 5 + 1, 0); // last day of June (midnight of July 1st)

  // Format as "YYYY-MM-DD"
  return expiresAt.toISOString().slice(0, 10);
}

/**
 * Internal mutation to update user's stripeCustomerId.
 */
export const updateUserStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });
    return null;
  },
});

/**
 * Internal mutation to update user's access expires at.
 * Calculates the expiration date as the last day of the next June.
 * Used by webhook handlers.
 */
export const updateUserAccessExpiresAt = internalMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const formattedExpiresAt = calculateAccessExpiresAt();

    await ctx.db.patch(args.userId, {
      accessExpiresAt: formattedExpiresAt,
    });
    return null;
  },
});

/**
 * Mutation to update user's access expires at.
 */
export const updateUserAccess = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getUserByClerkUserId(ctx);
  

    // Fetch the payment record by session ID
    // Use .unique() to surface duplicate session IDs (throws error if multiple found)
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .unique();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Verify the payment belongs to the authenticated user
    if (payment.userId !== user._id) {
      throw new Error("Payment does not belong to authenticated user");
    }

    const formattedExpiresAt = calculateAccessExpiresAt();

    // Only update accessExpiresAt and payment status when the payment belongs to the user
    await ctx.db.patch(user._id, {
      accessExpiresAt: formattedExpiresAt,
    });

    await ctx.db.patch(payment._id, {
      status: "paid",
    });
    return null;
  },
});

