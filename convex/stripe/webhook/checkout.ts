import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

/**
 * Handle Stripe checkout session webhook events.
 * Updates payment status and payment intent ID based on the event type.
 */
export const handleCheckoutEvent = internalAction({
  args: {
    eventType: v.string(),
    data: v.any(), // Checkout session object from Stripe
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventType, data } = args;

    // Extract checkout session ID and payment intent
    const checkoutSessionId = data.id;
    if (!checkoutSessionId || typeof checkoutSessionId !== "string") {
      throw new Error("Invalid checkout session: missing id");
    }

    // Extract payment_intent - it can be a string ID or an expanded object
    let paymentIntentId: string | undefined;
    if (data.payment_intent) {
      paymentIntentId =
        typeof data.payment_intent === "string"
          ? data.payment_intent
          : data.payment_intent.id;
    }

    // Map event type to payment status
    let paymentStatus: "paid" | "failed";
    if (eventType === "checkout.session.completed") {
      paymentStatus = "paid";
    } else if (eventType === "checkout.session.expired") {
      paymentStatus = "failed";
    } else {
      // Unknown checkout event type - log but don't throw
      console.warn(`Unknown checkout event type: ${eventType}`);
      return null;
    }

    // Find the payment by checkout session ID
    const payment = await ctx.runQuery(
      internal.payments.get.getPaymentByCheckoutSessionId,
      {
        checkoutSessionId,
      },
    );

    if (!payment) {
      console.warn(
        `Payment not found for checkout session: ${checkoutSessionId}`,
      );
      return null;
    }

    // Update the payment with new status and payment intent ID
    await ctx.runMutation(
      internal.payments.update.updatePaymentFromWebhook,
      {
        paymentId: payment._id,
        status: paymentStatus,
        stripePaymentIntentId: paymentIntentId,
        webhookProcessed: true,
      },
    );

    // Handle post-payment updates based on payment type
    if (payment.type === "access-fee") {
      // Update user's access expiration for subscription payments
      await ctx.runMutation(internal.users.update.updateUserAccessExpiresAt, {
        userId: payment.userId,
      });
    } else if (payment.type === "order") {
      // Update order payment status for order payments
      if (!payment.orderId) {
        console.error(`Order payment ${payment._id} missing orderId`);
        return null;
      }
      await ctx.runMutation(internal.orders.update.updateOrderPaymentStatusFromWebhook, {
        orderId: payment.orderId,
        status: paymentStatus,
      });

      // Send order confirmation email when payment is successful
      if (paymentStatus === "paid") {
        const orderEmailData = await ctx.runQuery(
          internal.orders.get.getOrderEmailData,
          { orderId: payment.orderId }
        );

        if (orderEmailData) {
          await ctx.runAction(internal.resend.sendEmail.sendEmail, {
            to: orderEmailData.userEmail,
            templateName: "orderConfirmation",
            variables: {
              childName: orderEmailData.childName,
              orderType: orderEmailData.orderType,
              startDate: orderEmailData.startDate,
              endDate: orderEmailData.endDate,
              price: orderEmailData.price,
            },
          });
        } else {
          console.error(`Could not get order email data for order ${payment.orderId}`);
        }
      }
    }

    return null;
  },
});

