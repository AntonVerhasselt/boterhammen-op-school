import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Internal query to get order details for email confirmation.
 * Returns order data with child name and user email.
 */
export const getOrderEmailData = internalQuery({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.union(
    v.object({
      childName: v.string(),
      orderType: v.union(
        v.literal("day-order"),
        v.literal("week-order"),
        v.literal("month-order")
      ),
      startDate: v.string(),
      endDate: v.string(),
      price: v.number(),
      userEmail: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get the order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }

    // Get the child for the child name
    const child = await ctx.db.get(order.childId);
    if (!child) {
      return null;
    }

    // Get the user for the email
    const user = await ctx.db.get(order.parentId);
    if (!user) {
      return null;
    }

    return {
      childName: `${child.firstName} ${child.lastName}`,
      orderType: order.orderType,
      startDate: order.startDate,
      endDate: order.endDate,
      price: order.price,
      userEmail: user.email,
    };
  },
});

