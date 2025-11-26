"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { render } from "@react-email/render";
import * as React from "react";
import { internal } from "../_generated/api";
import {
  getTemplate,
  interpolateSubject,
  TemplateName,
  getAvailableTemplates,
} from "./selectTemplate";

/**
 * Generic internal action to send emails using templates.
 * 
 * This action:
 * 1. Selects the appropriate template based on templateName
 * 2. Renders the React Email component with the provided variables
 * 3. Interpolates variables into the subject line
 * 4. Calls the mutation to send via the Convex Resend component
 * 
 * @example
 * // From another Convex function:
 * await ctx.scheduler.runAfter(0, internal.resend.sendEmail.sendEmail, {
 *   to: "parent@email.com",
 *   templateName: "orderConfirmation",
 *   variables: {
 *     childName: "Lucas",
 *     orderType: "week-order",
 *     startDate: "2025-12-01",
 *     endDate: "2025-12-05",
 *     price: 1250
 *   }
 * });
 */
export const sendEmail = internalAction({
  args: {
    to: v.string(),
    templateName: v.string(),
    variables: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { to, templateName, variables = {} } = args;

    // Validate template name
    const availableTemplates = getAvailableTemplates();
    if (!availableTemplates.includes(templateName as TemplateName)) {
      throw new Error(
        `Template "${templateName}" not found. Available templates: ${availableTemplates.join(", ")}`
      );
    }

    // Get template configuration
    const template = getTemplate(templateName as TemplateName);

    // Render the React Email component to HTML
    const Component = template.component;
    const html = await render(React.createElement(Component, variables));

    // Interpolate variables into the subject line
    const subject = interpolateSubject(template.subjectTemplate, variables);

    // Send the email via the Convex Resend component mutation
    await ctx.runMutation(internal.resend.trigger.sendRenderedEmail, {
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to} with template ${templateName}`);
    return null;
  },
});
