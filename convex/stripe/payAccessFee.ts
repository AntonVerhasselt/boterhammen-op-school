"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { getStripeClient } from "../../lib/stripe-connection";

/**
 * Create a Stripe checkout session for the access fee payment.
 * Returns the checkout session URL for redirect.
 */
export const payAccessFee = action({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args): Promise<{ url: string }> => {
    // Ensure Stripe customer exists and get userId
    const { stripeCustomerId, userId } = await ctx.runAction(
      api.stripe.checkCustomer.checkStripeCustomerByClerkUserId,
      {
        clerkUserId: args.clerkUserId,
      }
    );

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
    }

    // Get Stripe client
    const stripe = getStripeClient();

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Access Fee",
              description: "Annual subscription fee for the current school year",
            },
            unit_amount: 1000, // 10 EUR in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/onboarding/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/onboarding/subscription`,
      metadata: {
        userId: userId,
        clerkUserId: args.clerkUserId,
        type: "access-fee",
      },
    });

    // Log the full session object to debug
    console.log("Stripe checkout session created:", JSON.stringify({
      id: session.id,
      payment_intent: session.payment_intent,
      payment_intent_type: typeof session.payment_intent,
      payment_status: session.payment_status,
      status: session.status,
      mode: session.mode,
    }, null, 2));

    // Store payment record in database
    // Note: As of Stripe API v2022-08-01+, payment_intent is null when session is created
    // It's only populated after the session is confirmed/completed
    // Extract payment intent ID - it can be null, a string, or an expanded object
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    // Payment intent ID is optional initially - it will be set via webhook when payment completes
    await ctx.runMutation(internal.payments.create.createPayment, {
      userId: userId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId ?? undefined,
      amount: 1000, // 10 EUR in cents
      currency: "eur",
      type: "access-fee",
      status: "pending",
    });

    return { url: session.url! };
  },
});

