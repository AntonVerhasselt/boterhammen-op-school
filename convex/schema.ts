import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const breadType = v.union(
  v.literal("white"),
  v.literal("brown"),
  v.literal("none")
);

const orderType = v.union(
  v.literal("day-order"),
  v.literal("week-order"),
  v.literal("month-order")
);

// Payments lifecycle kept simple for now
const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("failed"),
  v.literal("cancelled")
);

// Delivery/fulfillment lifecycle
const deliveryStatus = v.union(
  v.literal("ordered"),
  v.literal("in-progress"),
  v.literal("delivered"),
  v.literal("cancelled")
);

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
      allergies: v.optional(v.string()),
      breadType: breadType,
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  }).index("by_parentId", ["parentId"]),

  orders: defineTable({
    parentId: v.id("users"),
    childId: v.id("children"),
    orderType: orderType,
    startDate: v.string(),  // ISO 8601 format: YYYY-MM-DD
    endDate: v.string(),    // ISO 8601 format: YYYY-MM-DD
    preferences: v.object({
      notes: v.string(),       // free text (can be empty string)
      allergies: v.string(),   // keep simple as free text for now
      breadType,               // "white" | "brown" | "none"
      crust: v.boolean(),
      butter: v.boolean(),
    }),
    paymentStatus: paymentStatus,
    deliveryStatus: deliveryStatus,
  }).index("by_parentId", ["parentId"])
  .index("by_childId", ["childId"])
  .index("by_startDate", ["startDate"])
  .index("by_date_range", ["startDate", "endDate"])
  .index("by_paymentStatus", ["paymentStatus"])
  .index("by_deliveryStatus", ["deliveryStatus"]),

  schools: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
  }).index("by_schoolId", ["schoolId"]),

  offDays: defineTable({
    date: v.string(),
    schoolId: v.id("schools"),
    reason: v.optional(v.string()),
  }).index("by_date", ["date"])
  .index("by_schoolId", ["schoolId"])
  .index("by_schoolId_and_date", ["schoolId", "date"]),
});
