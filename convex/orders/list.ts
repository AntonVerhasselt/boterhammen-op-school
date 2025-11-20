import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

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
        v.literal("in-progress"),
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

/**
 * Internal query to get all orders with their date ranges.
 * Used by countOrdersPerDay action.
 */
export const getAllOrders = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      startDate: v.string(),
      endDate: v.string(),
    })
  ),
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.map((order) => ({
      _id: order._id,
      startDate: order.startDate,
      endDate: order.endDate,
    }));
  },
});

