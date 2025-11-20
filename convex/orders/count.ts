"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { FunctionReference } from "convex/server";
import { checkAdmin } from "../../lib/admin-check";

/**
 * Count orders per day within a date range.
 * Only accessible by admin users.
 */
export const countOrdersPerDay = action({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
  },
  returns: v.array(
    v.object({
      date: v.string(),
      orderCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Check if user is admin
    await checkAdmin(ctx);

    // Query all orders that overlap with the date range
    // An order overlaps if: order.startDate <= endDate AND order.endDate >= startDate
    type OrderData = {
      _id: string;
      startDate: string;
      endDate: string;
    };
    const listAllOrdersRef = (
      internal.orders as {
        list?: {
          listAllOrders: FunctionReference<
            "query",
            "internal",
            Record<string, never>,
            OrderData[]
          >;
        };
      }
    ).list?.listAllOrders;
    if (!listAllOrdersRef) {
      throw new Error("listAllOrders function not found");
    }
    const allOrders: OrderData[] = await ctx.runQuery(listAllOrdersRef, {});

    // Filter orders that overlap with the date range
    const overlappingOrders = allOrders.filter(
      (order: OrderData) =>
        order.startDate <= args.endDate && order.endDate >= args.startDate
    );

    // Generate array of all dates between startDate and endDate (inclusive)
    const dates: string[] = [];
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }

    // Count orders per day
    const result = dates.map((date) => {
      const orderCount = overlappingOrders.filter((order: OrderData) => {
        return order.startDate <= date && order.endDate >= date;
      }).length;

      return {
        date,
        orderCount,
      };
    });

    return result;
  },
});


