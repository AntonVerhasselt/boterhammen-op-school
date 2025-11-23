import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkUserId } from "../../lib/clerk-id";

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
    const user = await getUserByClerkUserId(ctx);

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