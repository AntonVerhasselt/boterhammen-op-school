"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  isWorkday,
  calculateEndDate,
  formatDateToISO,
  formatDateReadable,
} from "@/lib/date-utils"

const formSchema = z.object({
  childId: z.string().min(1, "Child is required"),
  orderType: z.enum(["day-order", "week-order", "month-order"]),
  startDate: z.date({
    message: "Start date is required",
  }),
  notes: z.string().optional(),
  allergies: z.string().optional(),
  breadType: z.enum(["white", "brown", "none"]),
  crust: z.boolean(),
  butter: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface OrderFormProps {
  onSuccess?: () => void
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const router = useRouter()

  const children = useQuery(api.children.list.listMyChildren, {})
  const currentUser = useQuery(api.users.get.getMyUser)
  const createOrder = useMutation(api.orders.createOrder)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childId: "",
      orderType: "month-order",
      startDate: undefined,
      notes: "",
      allergies: "",
      breadType: "none",
      crust: false,
      butter: false,
    },
  })

  const selectedStartDate = form.watch("startDate")
  const selectedOrderType = form.watch("orderType")

  // Calculate end date when start date and order type change
  const endDate = React.useMemo(() => {
    if (!selectedStartDate) return null
    return calculateEndDate(selectedStartDate, selectedOrderType)
  }, [selectedStartDate, selectedOrderType])

  // Disable dates that are not workdays or are in the past/today
  const disabledDates = React.useCallback(
    (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dateToCheck = new Date(date)
      dateToCheck.setHours(0, 0, 0, 0)

      // Disable past dates and today
      if (dateToCheck <= today) {
        return true
      }

      // Disable non-workdays
      return !isWorkday(dateToCheck)
    },
    []
  )

  const onSubmit = async (values: FormValues) => {
    try {
      if (!currentUser) {
        throw new Error("User not found")
      }

      if (!endDate) {
        throw new Error("End date calculation failed")
      }

      await createOrder({
        childId: values.childId as Id<"children">,
        orderType: values.orderType,
        startDate: formatDateToISO(values.startDate),
        endDate: formatDateToISO(endDate),
        preferences: {
          notes: values.notes || "",
          allergies: values.allergies || "",
          breadType: values.breadType,
          crust: values.crust,
          butter: values.butter,
        },
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to create order",
      })
    }
  }

  const childOptions =
    children?.map((child) => ({
      value: child._id,
      label: `${child.firstName} ${child.lastName}`,
    })) || []

  const isLoading = children === undefined || currentUser === undefined

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>Place an order for your child</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (children && children.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>Place an order for your child</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You need to add a child before creating an order.
            </p>
            <Button onClick={() => router.push("/children/create")}>
              Add a Child
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Place an order for your child</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a child..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {childOptions.map((child) => (
                        <SelectItem key={child.value} value={child.value}>
                          {child.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="day-order">Day Order</SelectItem>
                      <SelectItem value="week-order">Week Order</SelectItem>
                      <SelectItem value="month-order">Month Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={disabledDates}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {endDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      End Date: {formatDateReadable(endDate)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any allergies or dietary restrictions..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breadType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bread Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bread type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crust"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Crust</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="butter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Butter</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/orders")}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

