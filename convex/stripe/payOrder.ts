"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { getStripeClient } from "../../lib/stripe-connection";

/**
 * Create a Stripe checkout session for an order payment.
 * First creates the order in the database, then creates a Stripe checkout session.
 * Returns the checkout session URL for redirect.
 */
export const payOrder = action({
  args: {
    childId: v.id("children"),
    orderType: v.union(
      v.literal("day-order"),
      v.literal("week-order"),
      v.literal("month-order")
    ),
    startDate: v.string(), // ISO 8601 format: YYYY-MM-DD
    endDate: v.string(), // ISO 8601 format: YYYY-MM-DD
    preferences: v.object({
      notes: v.string(),
      allergies: v.string(),
      breadType: v.union(
        v.literal("white"),
        v.literal("brown"),
        v.literal("none")
      ),
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args): Promise<{ url: string }> => {
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

    // Create the order in the database
    const order = await ctx.runMutation(internal.orders.create.createOrder, {
      userId: userId,
      childId: args.childId,
      orderType: args.orderType,
      startDate: args.startDate,
      endDate: args.endDate,
      preferences: args.preferences,
    });

    // Get Stripe client
    const stripe = getStripeClient();

    // Format price for display (convert cents to euros)
    const priceInEuros = (order.price / 100).toFixed(2);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sandwich Order",
              description: `${order.orderType.replace("-", " ")} from ${order.startDate} to ${order.endDate} (${order.billableDays} days)`,
            },
            unit_amount: order.price, // Price in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/orders/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: userId,
        clerkUserId: clerkUserId,
        type: "order",
        orderId: order._id,
      },
    });

    // Store payment record in database
    await ctx.runMutation(internal.payments.create.createPayment, {
      userId: userId,
      orderId: order._id,
      stripeCheckoutSessionId: session.id,
      amount: order.price,
      currency: "eur",
      type: "order",
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

