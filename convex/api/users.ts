import { mutation } from "../_generated/server";
import { v } from "convex/values";

// E.164 phone number pattern: + followed by 1-15 digits (first digit must be 1-9)
const E164_PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;

export const createMyUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a user profile");
    }

    const email = identity.email;
    const clerkUserId = identity.subject;

    if (!email) {
      throw new Error("User email is required");
    }

    // Trim and validate firstName
    const trimmedFirstName = args.firstName.trim();
    if (trimmedFirstName.length < 1 || trimmedFirstName.length > 50) {
      throw new Error("First name must be between 1 and 50 characters");
    }

    // Trim and validate lastName
    const trimmedLastName = args.lastName.trim();
    if (trimmedLastName.length < 1 || trimmedLastName.length > 50) {
      throw new Error("Last name must be between 1 and 50 characters");
    }

    // Trim and validate phoneNumber (E.164 format)
    const trimmedPhoneNumber = args.phoneNumber.trim();
    if (!E164_PHONE_PATTERN.test(trimmedPhoneNumber)) {
      throw new Error(
        "Phone number must be in E.164 format (e.g., +1234567890)"
      );
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (existingUser) {
      throw new Error("User profile already exists");
    }

    // Insert new user with trimmed and validated values
    const userId = await ctx.db.insert("users", {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      phoneNumber: trimmedPhoneNumber,
      email,
      clerkUserId,
    });

    return userId;
  },
});

