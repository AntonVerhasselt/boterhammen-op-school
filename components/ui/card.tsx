import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a card container div with predefined slot and base styling.
 *
 * @returns A div element with `data-slot="card"` that applies the component's base card classes, merges any provided `className`, and forwards remaining props to the underlying div.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card header slot with the component's responsive grid and spacing classes.
 *
 * @param className - Additional class names to merge with the component's base classes.
 * @param props - Additional props are forwarded to the underlying div element.
 * @returns The header div element with `data-slot="card-header"` and combined classes.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card title slot with heading typography and merges any provided classes.
 *
 * @returns A div with `data-slot="card-title"` and typography classes (`leading-none`, `font-semibold`), with any passed props applied.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the card description slot with muted, small body text styling.
 *
 * @param className - Additional CSS class names to merge with the component's default styles
 * @param props - Passed-through props applied to the underlying `div`
 * @returns A `div` element with `data-slot="card-description"` and text-muted small styling
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's action container slot.
 *
 * Accepts standard div props and merges any provided `className` into the element's classes.
 *
 * @returns A div element used for the card action slot.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card content container used to hold a card's main children.
 *
 * Forwards any additional props to the underlying div.
 *
 * @returns A div element with `data-slot="card-content"`, horizontal padding (`px-6`), and any classes provided via `className`
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders the card footer container used to host footer content and actions.
 *
 * @returns A `div` element with `data-slot="card-footer"`, horizontal padding, center-aligned items, and an optional top padding when a border is present.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}