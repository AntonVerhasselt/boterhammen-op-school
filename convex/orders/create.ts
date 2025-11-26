import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { calculateBillableDays, calculateOrderPrice } from "../../lib/price-utils";
import { Id } from "../_generated/dataModel";

/**
 * Internal mutation to create a new order.
 * Called by the payOrder action to create an order before payment.
 */
export const createOrder = internalMutation({
  args: {
    userId: v.id("users"),
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
  returns: v.object({
    _id: v.id("orders"),
    _creationTime: v.number(),
    parentId: v.id("users"),
    childId: v.id("children"),
    orderType: v.union(
      v.literal("day-order"),
      v.literal("week-order"),
      v.literal("month-order")
    ),
    startDate: v.string(),
    endDate: v.string(),
    price: v.number(),
    billableDays: v.number(),
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
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    deliveryStatus: v.union(
      v.literal("ordered"),
      v.literal("in-progress"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
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

    // Get off days for the child's school within the date range
    const offDayStrings: Array<string> = await ctx.runQuery(
      internal.offdays.list.getOffDaysInRange,
      {
        childId: args.childId,
        startDate: args.startDate,
        endDate: args.endDate,
      }
    );

    // Convert off day strings to Date objects for calculation
    const offDays = offDayStrings.map((dateStr) => new Date(dateStr));

    // Calculate billable days
    const billableDays = calculateBillableDays(
      new Date(args.startDate),
      new Date(args.endDate),
      offDays
    );

    // Calculate total price
    const priceCalculation = calculateOrderPrice(args.orderType, billableDays);
    
    // Convert price from euros to cents (multiply by 100 and round)
    const priceInCents = Math.round(priceCalculation.totalPrice * 100);

    // Insert new order with default statuses
    const orderId = await ctx.db.insert("orders", {
      parentId: user._id,
      childId: args.childId,
      orderType: args.orderType,
      startDate: args.startDate,
      endDate: args.endDate,
      price: priceInCents,
      billableDays: billableDays,
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

    // Fetch and return the complete order
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Failed to fetch created order");
    }
    return order;
  },
});