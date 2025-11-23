import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

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
 * Mutation to update user's access expires at.
 */
export const updateUserAccess = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const clerkUserId = identity.subject;
    
    // Get user by clerkUserId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate the last day of the next June
    const now = new Date();
    const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
    // June is month 5 (0-indexed)
    const expiresAt = new Date(year, 5 + 1, 0); // last day of June (midnight of July 1st)

    // Format as "YYYY-MM-DD"
    const formattedExpiresAt = expiresAt.toISOString().slice(0, 10);

    await ctx.db.patch(user._id, {
      accessExpiresAt: formattedExpiresAt,
    });

    // Update the payment record with the status paid
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: "paid",
    });
    return null;
  },
});

/**
 * Update user access status via webhook
 */
export const updateUserAccessViaWebhook = internalMutation({
  args: {
    sessionId: v.string(),
    paymentStatus: v.string(),
    eventType: v.union(
      v.literal("checkout.session.async_payment_failed"),
      v.literal("checkout.session.async_payment_succeeded")
    ),
    paymentIntentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get payment by stripeCheckoutSessionId
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .unique();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Prepare update object - always update webhookProcessed
    const updateData: {
      status: "paid" | "failed";
      webhookProcessed: boolean;
      stripePaymentIntentId?: string;
    } = {
      status: args.eventType === "checkout.session.async_payment_succeeded" ? "paid" : "failed",
      webhookProcessed: true,
    };

    // Update payment intent ID if provided
    if (args.paymentIntentId) {
      updateData.stripePaymentIntentId = args.paymentIntentId;
    }

    // Update payment status based on event type
    if (args.eventType === "checkout.session.async_payment_succeeded") {
      // Payment succeeded - update payment status and user access
      await ctx.db.patch(payment._id, updateData);

      // Get the user and update their access
      const user = await ctx.db.get(payment.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Calculate the last day of the next June
      const now = new Date();
      const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
      // June is month 5 (0-indexed)
      const expiresAt = new Date(year, 5 + 1, 0); // last day of June (midnight of July 1st)

      // Format as "YYYY-MM-DD"
      const formattedExpiresAt = expiresAt.toISOString().slice(0, 10);

      await ctx.db.patch(user._id, {
        accessExpiresAt: formattedExpiresAt,
      });
    } else if (args.eventType === "checkout.session.async_payment_failed") {
      // Payment failed - update payment status
      await ctx.db.patch(payment._id, updateData);

      // Check if user has another successful access-fee payment between now and previous July 1st
      const now = Date.now();
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January, 6 = July)
      
      // Calculate previous first of July
      // If we're past July 1st this year, use July 1st of this year
      // Otherwise, use July 1st of last year
      const previousJulyFirst = currentMonth >= 6 
        ? new Date(currentYear, 6, 1) // July 1st of current year (month 6 = July)
        : new Date(currentYear - 1, 6, 1); // July 1st of last year
      const previousJulyFirstTimestamp = previousJulyFirst.getTime();

      // Query all payments for this user
      const userPayments = await ctx.db
        .query("payments")
        .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
        .collect();

      // Check if there's another successful access-fee payment in the time range
      const hasOtherSuccessfulPayment = userPayments.some((p) => {
        // Skip the current payment that just failed
        if (p._id === payment._id) {
          return false;
        }
        
        // Check if it's an access-fee payment with paid status
        if (p.type !== "access-fee" || p.status !== "paid") {
          return false;
        }
        
        // Check if it was created between previous July 1st and now
        const creationTime = p._creationTime;
        return creationTime >= previousJulyFirstTimestamp && creationTime <= now;
      });

      // Only revoke access if there's no other successful payment
      if (!hasOtherSuccessfulPayment) {
        const user = await ctx.db.get(payment.userId);
        if (user) {
          await ctx.db.patch(user._id, {
            accessExpiresAt: undefined,
          });
        }
      }
    }

    return null;
  },
});