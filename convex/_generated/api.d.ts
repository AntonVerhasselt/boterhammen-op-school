/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as children_create from "../children/create.js";
import type * as children_delete from "../children/delete.js";
import type * as children_get from "../children/get.js";
import type * as children_list from "../children/list.js";
import type * as children_update from "../children/update.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as offdays_create from "../offdays/create.js";
import type * as offdays_delete from "../offdays/delete.js";
import type * as offdays_list from "../offdays/list.js";
import type * as orders_admin from "../orders/admin.js";
import type * as orders_count from "../orders/count.js";
import type * as orders_create from "../orders/create.js";
import type * as orders_get from "../orders/get.js";
import type * as orders_list from "../orders/list.js";
import type * as orders_update from "../orders/update.js";
import type * as orders_updateAll from "../orders/updateAll.js";
import type * as payments_create from "../payments/create.js";
import type * as payments_get from "../payments/get.js";
import type * as payments_update from "../payments/update.js";
import type * as resend_selectTemplate from "../resend/selectTemplate.js";
import type * as resend_sendEmail from "../resend/sendEmail.js";
import type * as resend_templates_orderConfirmation from "../resend/templates/orderConfirmation.js";
import type * as resend_trigger from "../resend/trigger.js";
import type * as schools_list from "../schools/list.js";
import type * as schoolsandclasses from "../schoolsandclasses.js";
import type * as stripe_checkCustomer from "../stripe/checkCustomer.js";
import type * as stripe_payAccessFee from "../stripe/payAccessFee.js";
import type * as stripe_payOrder from "../stripe/payOrder.js";
import type * as stripe_webhook_checkout from "../stripe/webhook/checkout.js";
import type * as stripe_webhook_fulfill from "../stripe/webhook/fulfill.js";
import type * as users_create from "../users/create.js";
import type * as users_get from "../users/get.js";
import type * as users_update from "../users/update.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "children/create": typeof children_create;
  "children/delete": typeof children_delete;
  "children/get": typeof children_get;
  "children/list": typeof children_list;
  "children/update": typeof children_update;
  crons: typeof crons;
  http: typeof http;
  "offdays/create": typeof offdays_create;
  "offdays/delete": typeof offdays_delete;
  "offdays/list": typeof offdays_list;
  "orders/admin": typeof orders_admin;
  "orders/count": typeof orders_count;
  "orders/create": typeof orders_create;
  "orders/get": typeof orders_get;
  "orders/list": typeof orders_list;
  "orders/update": typeof orders_update;
  "orders/updateAll": typeof orders_updateAll;
  "payments/create": typeof payments_create;
  "payments/get": typeof payments_get;
  "payments/update": typeof payments_update;
  "resend/selectTemplate": typeof resend_selectTemplate;
  "resend/sendEmail": typeof resend_sendEmail;
  "resend/templates/orderConfirmation": typeof resend_templates_orderConfirmation;
  "resend/trigger": typeof resend_trigger;
  "schools/list": typeof schools_list;
  schoolsandclasses: typeof schoolsandclasses;
  "stripe/checkCustomer": typeof stripe_checkCustomer;
  "stripe/payAccessFee": typeof stripe_payAccessFee;
  "stripe/payOrder": typeof stripe_payOrder;
  "stripe/webhook/checkout": typeof stripe_webhook_checkout;
  "stripe/webhook/fulfill": typeof stripe_webhook_fulfill;
  "users/create": typeof users_create;
  "users/get": typeof users_get;
  "users/update": typeof users_update;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          createdAt: number;
          errorMessage?: string;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject: string;
          text?: string;
          to: string;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
