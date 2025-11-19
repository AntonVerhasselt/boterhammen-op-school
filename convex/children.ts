import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const breadType = v.union(
  v.literal("white"),
  v.literal("brown"),
  v.literal("none")
);

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
      breadType: breadType,
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  },
  returns: v.id("children"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a child");
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found");
    }

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

/**
 * Get a single child by ID (with parent verification).
 */
export const getChild = query({
  args: {
    childId: v.id("children"),
  },
  returns: v.union(
    v.object({
      _id: v.id("children"),
      _creationTime: v.number(),
      parentId: v.id("users"),
      firstName: v.string(),
      lastName: v.string(),
      schoolId: v.id("schools"),
      classId: v.id("classes"),
      preferences: v.object({
        allergies: v.optional(v.string()),
        breadType: breadType,
        crust: v.boolean(),
        butter: v.boolean(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return null;
    }

    const child = await ctx.db.get(args.childId);
    if (!child) {
      return null;
    }

    // Verify parent ownership
    if (child.parentId !== user._id) {
      return null;
    }

    return child;
  },
});

/**
 * Get a single child by ID with school and class names resolved (with parent verification).
 */
export const getChildWithDetails = query({
  args: {
    childId: v.id("children"),
  },
  returns: v.union(
    v.object({
      _id: v.id("children"),
      _creationTime: v.number(),
      parentId: v.id("users"),
      firstName: v.string(),
      lastName: v.string(),
      schoolId: v.id("schools"),
      classId: v.id("classes"),
      schoolName: v.string(),
      className: v.string(),
      preferences: v.object({
        allergies: v.optional(v.string()),
        breadType: breadType,
        crust: v.boolean(),
        butter: v.boolean(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return null;
    }

    const child = await ctx.db.get(args.childId);
    if (!child) {
      return null;
    }

    // Verify parent ownership
    if (child.parentId !== user._id) {
      return null;
    }

    // Fetch school and class names
    const school = await ctx.db.get(child.schoolId);
    const classItem = await ctx.db.get(child.classId);

    return {
      ...child,
      schoolName: school?.name || "Unknown",
      className: classItem?.name || "Unknown",
    };
  },
});

/**
 * Get all children for the logged-in parent.
 */
export const listMyChildren = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("children"),
      _creationTime: v.number(),
      parentId: v.id("users"),
      firstName: v.string(),
      lastName: v.string(),
      schoolId: v.id("schools"),
      classId: v.id("classes"),
      preferences: v.object({
        allergies: v.optional(v.string()),
        breadType: breadType,
        crust: v.boolean(),
        butter: v.boolean(),
      }),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("children")
      .withIndex("by_parentId", (q) => q.eq("parentId", user._id))
      .collect();
  },
});

/**
 * Get all children for the logged-in parent with school and class names resolved.
 */
export const listMyChildrenWithDetails = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("children"),
      _creationTime: v.number(),
      parentId: v.id("users"),
      firstName: v.string(),
      lastName: v.string(),
      schoolId: v.id("schools"),
      classId: v.id("classes"),
      schoolName: v.string(),
      className: v.string(),
      preferences: v.object({
        allergies: v.optional(v.string()),
        breadType: breadType,
        crust: v.boolean(),
        butter: v.boolean(),
      }),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    const children = await ctx.db
      .query("children")
      .withIndex("by_parentId", (q) => q.eq("parentId", user._id))
      .collect();

    // Fetch all unique school IDs
    const schoolIds = [...new Set(children.map((c) => c.schoolId))];
    const schools = await Promise.all(
      schoolIds.map((id) => ctx.db.get(id))
    );
    const schoolMap = new Map(
      schools.filter((s) => s !== null).map((s) => [s!._id, s!.name])
    );

    // Fetch all unique class IDs
    const classIds = [...new Set(children.map((c) => c.classId))];
    const classes = await Promise.all(
      classIds.map((id) => ctx.db.get(id))
    );
    const classMap = new Map(
      classes.filter((c) => c !== null).map((c) => [c!._id, c!.name])
    );

    // Combine children with school and class names
    return children.map((child) => ({
      ...child,
      schoolName: schoolMap.get(child.schoolId) || "Unknown",
      className: classMap.get(child.classId) || "Unknown",
    }));
  },
});

/**
 * Update an existing child (with parent verification).
 */
export const updateChild = mutation({
  args: {
    childId: v.id("children"),
    firstName: v.string(),
    lastName: v.string(),
    schoolId: v.id("schools"),
    classId: v.id("classes"),
    preferences: v.object({
      allergies: v.optional(v.string()),
      breadType: breadType,
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to update a child");
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found");
    }

    // Get child and verify parent ownership
    const child = await ctx.db.get(args.childId);
    if (!child) {
      throw new Error("Child not found");
    }
    if (child.parentId !== user._id) {
      throw new Error("You do not have permission to update this child");
    }

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

    // Update child
    await ctx.db.patch(args.childId, {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      schoolId: args.schoolId,
      classId: args.classId,
      preferences: {
        ...args.preferences,
        allergies: trimmedAllergies,
      },
    });

    return null;
  },
});

/**
 * Delete a child (with parent verification).
 */
export const deleteChild = mutation({
  args: {
    childId: v.id("children"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to delete a child");
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found");
    }

    // Get child and verify parent ownership
    const child = await ctx.db.get(args.childId);
    if (!child) {
      throw new Error("Child not found");
    }
    if (child.parentId !== user._id) {
      throw new Error("You do not have permission to delete this child");
    }

    // Delete child
    await ctx.db.delete(args.childId);

    return null;
  },
});

