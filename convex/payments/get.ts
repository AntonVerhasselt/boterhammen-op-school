import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

const paymentReturnType = v.union(
  v.object({
    _id: v.id("payments"),
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    type: v.union(v.literal("access-fee"), v.literal("order")),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    webhookProcessed: v.boolean(),
    _creationTime: v.number(),
  }),
  v.null(),
);

/**
 * Internal query to get a payment by checkout session ID.
 */
export const getPaymentByCheckoutSessionId = internalQuery({
  args: {
    checkoutSessionId: v.string(),
  },
  returns: paymentReturnType,
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.checkoutSessionId),
      )
      .unique();

    return payment ?? null;
  },
});

/**
 * Internal query to get a payment by payment intent ID.
 */
export const getPaymentByPaymentIntentId = internalQuery({
  args: {
    paymentIntentId: v.string(),
  },
  returns: paymentReturnType,
  handler: async (ctx, args) => {
    // Note: No index on stripePaymentIntentId, so we use filter
    // This is acceptable since payment intent IDs are unique
    const payment = await ctx.db
      .query("payments")
      .filter((q) =>
        q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId),
      )
      .unique();

    return payment ?? null;
  },
});

