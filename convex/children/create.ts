import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId } from "../../lib/clerk-id";

/**
 * Validates and trims a name field.
 * @param name - The name to validate
 * @param fieldName - The field name for error messages (e.g., "First name", "Last name")
 * @returns The trimmed name
 * @throws Error if the name is invalid
 */
function validateName(name: string, fieldName: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw new Error(`${fieldName} must be between 1 and 50 characters`);
  }
  return trimmed;
}

/**
 * Validates and trims an optional allergies string.
 * @param allergies - The allergies string (may be undefined)
 * @returns The trimmed allergies string or undefined if empty/undefined
 * @throws Error if the allergies string is too long
 */
function validateAllergies(allergies: string | undefined): string | undefined {
  if (!allergies) {
    return undefined;
  }
  const trimmed = allergies.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > 500) {
    throw new Error("Allergies description must be 500 characters or less");
  }
  return trimmed;
}

/**
 * Create a new child for the logged-in parent.
 */
export const createChild = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    schoolId: v.id("schools"),
    classId: v.id("classes"),
    preferences: v.object({
      allergies: v.optional(v.string()),
      breadType: v.union(
        v.literal("white"),
        v.literal("brown"),
        v.literal("none")
      ),
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  },
  returns: v.id("children"),
  handler: async (ctx, args) => {
    const user = await getUserByClerkUserId(ctx);

    // Validate and trim names
    const trimmedFirstName = validateName(args.firstName, "First name");
    const trimmedLastName = validateName(args.lastName, "Last name");

    // Verify school exists
    const school = await ctx.db.get(args.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // Verify class exists and belongs to the school
    const classItem = await ctx.db.get(args.classId);
    if (!classItem) {
      throw new Error("Class not found");
    }
    if (classItem.schoolId !== args.schoolId) {
      throw new Error("Class does not belong to the selected school");
    }

    // Validate allergies (optional field)
    const trimmedAllergies = validateAllergies(args.preferences.allergies);

    // Insert new child
    return await ctx.db.insert("children", {
      parentId: user._id,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      schoolId: args.schoolId,
      classId: args.classId,
      preferences: {
        ...args.preferences,
        allergies: trimmedAllergies,
      },
    });
  },
});