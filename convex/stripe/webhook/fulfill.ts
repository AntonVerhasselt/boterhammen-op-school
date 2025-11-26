"use node";

import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import Stripe from "stripe";

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { signature, payload }) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Stripe environment variables not configured");
      return { success: false };
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
    });

    try {
      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      if (event.type === "checkout.session.completed" || event.type === "checkout.session.expired") {
        await ctx.runAction(internal.stripe.webhook.checkout.handleCheckoutEvent, {
          eventType: event.type,
          data: event.data.object,
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Webhook error:", err);
      return { success: false };
    }
  },
});

