import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "../_generated/server";

export const resend: Resend = new Resend(components.resend, {});

export const sendTestEmail = internalMutation({
  args: {},
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "Boterhammen op School <onboarding@resend.dev",
      to: "anton.verhasselt@gmail.com",
      subject: "Hi there",
      html: "This is a test email",
    });
  },
});
