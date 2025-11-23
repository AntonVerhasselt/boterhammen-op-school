"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { getStripeClient } from "../../lib/stripe-connection";

type UserWithStripeCustomerId = {
  _id: Id<"users">;
  _creationTime: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  clerkUserId: string;
  stripeCustomerId?: string;
  accessExpiresAt?: string;
};

/**
 * Check if a Stripe customer exists for a user by clerkUserId.
 * If not, create one in Stripe and store the customerId in the database.
 * Returns both the stripeCustomerId and userId.
 */
export const checkStripeCustomerByClerkUserId = action({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.object({
    stripeCustomerId: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args): Promise<{ stripeCustomerId: string; userId: Id<"users"> }> => {
    // Get the user from the database
    const user: UserWithStripeCustomerId | null = await ctx.runQuery(
      internal.users.get.getUserByClerkUserId,
      {
        clerkUserId: args.clerkUserId,
      }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a stripeCustomerId, return it with userId
    if (user.stripeCustomerId) {
      return {
        stripeCustomerId: user.stripeCustomerId,
        userId: user._id,
      };
    }

    // Get Stripe client
    const stripe = getStripeClient();

    // Create a new Stripe customer with user information
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phoneNumber,
      metadata: {
        clerkUserId: user.clerkUserId,
        convexUserId: user._id,
      },
    });

    // Store the customerId in the database
    await ctx.runMutation(internal.users.update.updateUserStripeCustomerId, {
      userId: user._id,
      stripeCustomerId: customer.id,
    });

    return {
      stripeCustomerId: customer.id,
      userId: user._id,
    };
  },
});

