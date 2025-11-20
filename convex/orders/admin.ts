"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { checkAdmin } from "../../lib/admin-check";
import { Id } from "../_generated/dataModel";

/**
 * Get all orders for admin users with child names.
 * Only accessible by admin users.
 */
export const listAllOrdersForAdmin = action({
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
    // Check if user is admin
    await checkAdmin(ctx);

    // Get all orders with child names
    type OrderWithChildName = {
      _id: Id<"orders">;
      _creationTime: number;
      childId: Id<"children">;
      childName: string;
      orderType: "day-order" | "week-order" | "month-order";
      startDate: string;
      endDate: string;
      deliveryStatus: "ordered" | "in-progress" | "delivered" | "cancelled";
      paymentStatus: "pending" | "paid" | "refunded" | "failed" | "cancelled";
    };
    const orders: OrderWithChildName[] = await ctx.runQuery(
      internal.orders.list.listAllOrdersWithChildNames,
      {}
    );
    return orders;
  },
});

