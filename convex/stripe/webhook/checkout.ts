import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

/**
 * Handle Stripe checkout session webhook events.
 * Updates payment status and payment intent ID based on the event type.
 */
export const handleCheckoutEvent = internalAction({
  args: {
    eventType: v.string(),
    data: v.any(), // Checkout session object from Stripe
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventType, data } = args;

    // Extract checkout session ID and payment intent
    const checkoutSessionId = data.id;
    if (!checkoutSessionId || typeof checkoutSessionId !== "string") {
      throw new Error("Invalid checkout session: missing id");
    }

    // Extract payment_intent - it can be a string ID or an expanded object
    let paymentIntentId: string | undefined;
    if (data.payment_intent) {
      paymentIntentId =
        typeof data.payment_intent === "string"
          ? data.payment_intent
          : data.payment_intent.id;
    }

    // Map event type to payment status
    let paymentStatus: "paid" | "failed";
    if (eventType === "checkout.session.completed") {
      paymentStatus = "paid";
    } else if (eventType === "checkout.session.expired") {
      paymentStatus = "failed";
    } else {
      // Unknown checkout event type - log but don't throw
      console.warn(`Unknown checkout event type: ${eventType}`);
      return null;
    }

    // Find the payment by checkout session ID
    const payment = await ctx.runQuery(
      internal.payments.get.getPaymentByCheckoutSessionId,
      {
        checkoutSessionId,
      },
    );

    if (!payment) {
      console.warn(
        `Payment not found for checkout session: ${checkoutSessionId}`,
      );
      return null;
    }

    // Update the payment with new status and payment intent ID
    await ctx.runMutation(
      internal.payments.update.updatePaymentFromWebhook,
      {
        paymentId: payment._id,
        status: paymentStatus,
        stripePaymentIntentId: paymentIntentId,
        webhookProcessed: true,
      },
    );

    // Update the user's access expires at
    await ctx.runMutation(internal.users.update.updateUserAccessExpiresAt, {
      userId: payment.userId,
    });

    return null;
  },
});

