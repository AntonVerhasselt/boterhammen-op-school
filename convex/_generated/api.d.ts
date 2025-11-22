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
import type * as offdays_list from "../offdays/list.js";
import type * as orders_admin from "../orders/admin.js";
import type * as orders_count from "../orders/count.js";
import type * as orders_create from "../orders/create.js";
import type * as orders_list from "../orders/list.js";
import type * as orders_update from "../orders/update.js";
import type * as schoolsandclasses from "../schoolsandclasses.js";
import type * as users_create from "../users/create.js";
import type * as users_get from "../users/get.js";

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
  "offdays/list": typeof offdays_list;
  "orders/admin": typeof orders_admin;
  "orders/count": typeof orders_count;
  "orders/create": typeof orders_create;
  "orders/list": typeof orders_list;
  "orders/update": typeof orders_update;
  schoolsandclasses: typeof schoolsandclasses;
  "users/create": typeof users_create;
  "users/get": typeof users_get;
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

export declare const components: {};
