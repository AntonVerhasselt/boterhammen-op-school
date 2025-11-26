import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, {
  testMode: false, // Set to true to only allow Resend test addresses
});

// Default sender address
const DEFAULT_FROM = "Boterhammen op School <onboarding@resend.dev>";

/**
 * Internal mutation to send a pre-rendered email using the Convex Resend component.
 * This is called by the sendEmail action after rendering the template.
 */
export const sendRenderedEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: DEFAULT_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    return null;
  },
});

/**
 * @deprecated Use internal.resend.sendEmail.sendEmail instead
 */
export const sendTestEmail = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: DEFAULT_FROM,
      to: "anton.verhasselt@gmail.com",
      subject: "Hi there",
      html: "This is a test email",
    });
    return null;
  },
});
