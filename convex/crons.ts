import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run updateDeliveryStatusForAllOrders every day at 0:00 UTC (1:00 AM Brussels time in winter, 2:00 AM in summer)
crons.cron(
  "update delivery status for all orders",
  "0 0 * * *",
  internal.orders.update.updateDeliveryStatusForAllOrders,
  {}
);

export default crons;

