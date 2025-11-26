"use node";

import * as React from "react";
import { OrderConfirmation, OrderConfirmationProps } from "./templates/orderConfirmation";

/**
 * Template configuration type
 */
export interface TemplateConfig<T = Record<string, unknown>> {
  component: React.FC<T>;
  subjectTemplate: string;
}

/**
 * Registry of all available email templates.
 * Add new templates here as they are created.
 */
export const templateRegistry = {
  orderConfirmation: {
    component: OrderConfirmation,
    subjectTemplate: "Bestelling bevestigd voor {childName}",
  } as TemplateConfig<OrderConfirmationProps>,
} as const;

/**
 * Type for all available template names
 */
export type TemplateName = keyof typeof templateRegistry;

/**
 * Get a template by name from the registry.
 * 
 * @param templateName - The name of the template to retrieve
 * @returns The template configuration with component and subject template
 * @throws Error if template name is not found
 */
export function getTemplate(templateName: TemplateName): TemplateConfig {
  const template = templateRegistry[templateName];
  
  if (!template) {
    const availableTemplates = Object.keys(templateRegistry).join(", ");
    throw new Error(
      `Template "${templateName}" not found. Available templates: ${availableTemplates}`
    );
  }
  
  // Cast is safe because we're returning a generic TemplateConfig
  // The actual props will be validated at runtime when rendering
  return template as unknown as TemplateConfig;
}

/**
 * Interpolate variables into a subject template string.
 * Replaces {varName} placeholders with actual values.
 * 
 * @param template - The subject template string with {varName} placeholders
 * @param variables - Object containing variable values
 * @returns The interpolated subject string
 */
export function interpolateSubject(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

/**
 * Get list of all available template names.
 * Useful for validation or listing purposes.
 */
export function getAvailableTemplates(): TemplateName[] {
  return Object.keys(templateRegistry) as TemplateName[];
}

