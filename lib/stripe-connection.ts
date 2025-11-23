import Stripe from "stripe";

/**
 * Get a Stripe client instance.
 * Throws an error if STRIPE_SECRET_KEY is not set.
 */
export function getStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  return new Stripe(stripeSecretKey);
}

