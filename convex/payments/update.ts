import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Internal mutation to update payment from webhook event.
 */
export const updatePaymentFromWebhook = internalMutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    stripePaymentIntentId: v.optional(v.string()),
    webhookProcessed: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify payment exists
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Build update object
    const updateData: {
      status: "pending" | "paid" | "refunded" | "failed" | "cancelled";
      stripePaymentIntentId?: string;
      webhookProcessed: boolean;
    } = {
      status: args.status,
      webhookProcessed: args.webhookProcessed,
    };

    // Only include stripePaymentIntentId if provided
    if (args.stripePaymentIntentId !== undefined) {
      updateData.stripePaymentIntentId = args.stripePaymentIntentId;
    }

    await ctx.db.patch(args.paymentId, updateData);
    return null;
  },
});

