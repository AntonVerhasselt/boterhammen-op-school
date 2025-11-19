import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Create a new order for the logged-in parent.
 */
export const createOrder = mutation({
  args: {
    childId: v.id("children"),
    orderType: v.union(
      v.literal("day-order"),
      v.literal("week-order"),
      v.literal("month-order")
    ),
    startDate: v.string(), // ISO 8601 format: YYYY-MM-DD
    endDate: v.string(), // ISO 8601 format: YYYY-MM-DD
    preferences: v.object({
      notes: v.string(),
      allergies: v.string(),
      breadType: v.union(
        v.literal("white"),
        v.literal("brown"),
        v.literal("none")
      ),
      crust: v.boolean(),
      butter: v.boolean(),
    }),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create an order");
    }

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found");
    }

    // Verify child exists and belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child) {
      throw new Error("Child not found");
    }
    if (child.parentId !== user._id) {
      throw new Error("You do not have permission to create an order for this child");
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(args.startDate) || !dateRegex.test(args.endDate)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }

    // Validate that startDate is before or equal to endDate
    if (args.startDate > args.endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    // Validate notes length
    const trimmedNotes = args.preferences.notes.trim();
    if (trimmedNotes.length > 1000) {
      throw new Error("Notes must be 1000 characters or less");
    }

    // Validate allergies length
    const trimmedAllergies = args.preferences.allergies.trim();
    if (trimmedAllergies.length > 500) {
      throw new Error("Allergies description must be 500 characters or less");
    }

    // Insert new order with default statuses
    return await ctx.db.insert("orders", {
      parentId: user._id,
      childId: args.childId,
      orderType: args.orderType,
      startDate: args.startDate,
      endDate: args.endDate,
      preferences: {
        notes: trimmedNotes,
        allergies: trimmedAllergies,
        breadType: args.preferences.breadType,
        crust: args.preferences.crust,
        butter: args.preferences.butter,
      },
      paymentStatus: "pending",
      deliveryStatus: "ordered",
    });
  },
});

/**
 * Get all orders for the logged-in parent with child names.
 */
export const listMyOrders = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      _creationTime: v.number(),
      childId: v.id("children"),
      childName: v.string(), // firstName + " " + lastName
      orderType: v.union(
        v.literal("day-order"),
        v.literal("week-order"),
        v.literal("month-order")
      ),
      startDate: v.string(),
      endDate: v.string(),
      deliveryStatus: v.union(
        v.literal("ordered"),
        v.literal("delivered"),
        v.literal("cancelled")
      ),
      paymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("refunded"),
        v.literal("failed"),
        v.literal("cancelled")
      ),
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

    // Get all orders for this parent
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_parentId", (q) => q.eq("parentId", user._id))
      .order("desc")
      .collect();

    // Fetch all unique child IDs
    const childIds = [...new Set(orders.map((o) => o.childId))];
    const children = await Promise.all(
      childIds.map((id) => ctx.db.get(id))
    );
    const childMap = new Map(
      children
        .filter((c) => c !== null)
        .map((c) => [c!._id, `${c!.firstName} ${c!.lastName}`])
    );

    // Combine orders with child names
    return orders.map((order) => ({
      _id: order._id,
      _creationTime: order._creationTime,
      childId: order.childId,
      childName: childMap.get(order.childId) || "Unknown",
      orderType: order.orderType,
      startDate: order.startDate,
      endDate: order.endDate,
      deliveryStatus: order.deliveryStatus,
      paymentStatus: order.paymentStatus,
    }));
  },
});

