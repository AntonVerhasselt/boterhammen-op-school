import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Internal mutation to create a payment record.
 */
export const createPayment = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()), // Optional - set via webhook when payment completes
    amount: v.number(),
    currency: v.string(),
    type: v.union(v.literal("access-fee"), v.literal("order")),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      userId: args.userId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      amount: args.amount,
      currency: args.currency,
      type: args.type,
      status: args.status,
      webhookProcessed: false,
    });
  },
});

