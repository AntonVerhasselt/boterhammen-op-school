import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId } from "../../lib/clerk-id";

/**
 * Mutation to update order payment status and associated payment record.
 * Called from success/cancel pages after Stripe checkout completion.
 */
export const updateOrderPaymentStatus = mutation({
  args: {
    sessionId: v.string(),
    newStatus: v.union(v.literal("paid"), v.literal("cancelled")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getUserByClerkUserId(ctx);

    // Fetch the payment record by session ID
    // Use .unique() to surface duplicate session IDs (throws error if multiple found)
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .unique();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Verify the payment belongs to the authenticated user
    if (payment.userId !== user._id) {
      throw new Error("Payment does not belong to authenticated user");
    }

    // Verify the payment has an associated order
    if (!payment.orderId) {
      throw new Error("Payment does not have an associated order");
    }

    // Get the order
    const order = await ctx.db.get(payment.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: args.newStatus,
    });

    // Update order payment status
    await ctx.db.patch(order._id, {
      paymentStatus: args.newStatus,
    });

    return null;
  },
});

/**
 * Internal mutation to update order payment status from webhook.
 * Called by Stripe webhook handler after payment completion/expiration.
 * No authentication needed as webhooks are validated by Stripe signature.
 */
export const updateOrderPaymentStatusFromWebhook = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("paid"), v.literal("failed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update order payment status
    await ctx.db.patch(args.orderId, {
      paymentStatus: args.status,
    });

    return null;
  },
});

