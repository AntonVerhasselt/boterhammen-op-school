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
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx): Promise<{ url: string }> => {
    // Get user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const clerkUserId = identity.subject;

    // Ensure Stripe customer exists and get userId
    const { stripeCustomerId, userId } = await ctx.runAction(
      api.stripe.checkCustomer.checkStripeCustomerByClerkUserId,
      {}
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
      success_url: `${baseUrl}/onboarding/subscription/success?session_id={CHECKOUT_SESSION_ID}&`,
      cancel_url: `${baseUrl}/onboarding/subscription`,
      metadata: {
        userId: userId,
        clerkUserId: clerkUserId,
        type: "access-fee",
      },
    });

    // Store payment record in database
    await ctx.runMutation(internal.payments.create.createPayment, {
      userId: userId,
      stripeCheckoutSessionId: session.id,
      amount: 1000, // 10 EUR in cents
      currency: "eur",
      type: "access-fee",
      status: "pending",
    });

    // Verify session URL is present before returning
    if (!session.url) {
      throw new Error(
        `Stripe checkout session created but URL is missing. Session ID: ${session.id}`
      );
    }

    return { url: session.url };
  },
});

