import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    clerkUserId: v.string(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  children: defineTable({
    parentId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    schoolId: v.id("schools"),
    classId: v.id("classes"),
    preferences: v.object({
      allergies: v.string(),
      breadType: v.union(
        v.literal("white"),
        v.literal("brown"),
        v.literal("none"),
      ),
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  }).index("by_parentId", ["parentId"]),

  schools: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
  }).index("by_schoolId", ["schoolId"]),
});
