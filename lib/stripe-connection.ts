import Stripe from "stripe";

/**
 * Create and return a Stripe client configured with the STRIPE_SECRET_KEY environment variable.
 *
 * @returns A `Stripe` client initialized with the value of `STRIPE_SECRET_KEY`.
 * @throws If `STRIPE_SECRET_KEY` is not set, throws an `Error` with message "Missing STRIPE_SECRET_KEY environment variable".
 */
export function getStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  return new Stripe(stripeSecretKey);
}
