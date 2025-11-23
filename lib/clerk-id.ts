import type { QueryCtx, MutationCtx } from "../convex/_generated/server";
import type { Doc } from "../convex/_generated/dataModel";

/**
 * Get the authenticated user by their Clerk user ID.
 * Throws an error if the user is not authenticated or not found.
 */
export async function getUserByClerkUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  // Get authenticated user's identity
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("User not authenticated");
  }

  const clerkUserId = identity.subject;
  
  // Get user by clerkUserId
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

