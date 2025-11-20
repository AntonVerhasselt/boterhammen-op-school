"use node";

import type { ActionCtx } from "../convex/_generated/server";
import { createClerkClient } from "@clerk/backend";

/**
 * Check if the current user is an admin.
 * Throws an error if the user is not authenticated or not an admin.
 */
export async function checkAdmin(ctx: ActionCtx): Promise<void> {
  // Get user identity
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  // Create Clerk client and check admin status
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!clerkSecret) {
    throw new Error("Missing CLERK_SECRET_KEY");
  }
  const clerkClient = createClerkClient({
    secretKey: clerkSecret,
  });

  const user = await clerkClient.users.getUser(identity.subject);
  if (user.publicMetadata?.isAdmin !== true) {
    throw new Error("Unauthorized");
  }
}

