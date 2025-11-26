import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Update delivery status for all orders based on their start/end dates and order type.
 * This function is called by a cron job daily to automatically update order statuses.
 */
export const updateDeliveryStatusForAllOrders = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get current date in YYYY-MM-DD format (ISO string)
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // Extracts YYYY-MM-DD

    // Query all orders where deliveryStatus is "ordered" or "in-progress"
    const orders = await ctx.db
      .query("orders")
      .filter((q) =>
        q.or(
          q.eq(q.field("deliveryStatus"), "ordered"),
          q.eq(q.field("deliveryStatus"), "in-progress")
        )
      )
      .collect();

    // Process each order
    for (const order of orders) {
      let newStatus: "ordered" | "in-progress" | "delivered" | null = null;

      if (order.orderType === "day-order") {
        // Day-order logic
        if (order.startDate > currentDate) {
          // startDate > currentDate: keep "ordered"
          newStatus = "ordered";
        } else if (order.startDate === currentDate) {
          // startDate === currentDate: set "in-progress"
          newStatus = "in-progress";
        } else {
          // startDate < currentDate: set "delivered"
          newStatus = "delivered";
        }
      } else {
        // Week-order and month-order logic
        if (currentDate < order.startDate) {
          // currentDate < startDate: keep "ordered"
          newStatus = "ordered";
        } else if (
          currentDate >= order.startDate &&
          currentDate <= order.endDate
        ) {
          // currentDate falls into the date range: set "in-progress"
          newStatus = "in-progress";
        } else {
          // currentDate > endDate: set "delivered"
          newStatus = "delivered";
        }
      }

      // Only update if the status has changed
      if (newStatus && newStatus !== order.deliveryStatus) {
        await ctx.db.patch(order._id, {
          deliveryStatus: newStatus,
        });
      }
    }

    return null;
  },
});

