"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
import {
  calculateEndDate,
  formatDateToISO,
  formatDateRange,
} from "@/lib/date-utils"
import {
  calculateBillableDays,
  calculateOrderPrice,
  formatPrice,
} from "@/lib/price-utils"
import { OrderStepper } from "./OrderStepper"
import { DayPicker } from "./date-pickers/DayPicker"
import { WeekPicker } from "./date-pickers/WeekPicker"
import { MonthPicker } from "./date-pickers/MonthPicker"

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

// Step 1 schema: child and preferences
const step1Schema = z.object({
  childId: z.string().min(1, "Child is required"),
  notes: z.string().optional(),
  allergies: z.string().optional(),
  breadType: z.enum(["white", "brown", "none"]),
  crust: z.boolean(),
  butter: z.boolean(),
})

// Step 2 schema: order type and date
const step2Schema = z.object({
  orderType: z.enum(["day-order", "week-order", "month-order"]),
  startDate: z.date({
    message: "Start date is required",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface OrderFormProps {
  onSuccess?: () => void
}

// Helper functions for formatting
function formatOrderType(orderType: "day-order" | "week-order" | "month-order"): string {
  switch (orderType) {
    case "day-order":
      return "Day Order"
    case "week-order":
      return "Week Order"
    case "month-order":
      return "Month Order"
    default:
      return orderType
  }
}

function formatBreadType(breadType: "white" | "brown" | "none"): string {
  switch (breadType) {
    case "white":
      return "White"
    case "brown":
      return "Brown"
    case "none":
      return "No preference"
    default:
      return breadType
  }
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No"
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [offDays, setOffDays] = React.useState<Date[]>([])
  const [offDaysLoading, setOffDaysLoading] = React.useState(false)

  const children = useQuery(api.children.list.listMyChildren, {})
  const currentUser = useQuery(api.users.get.getMyUser)
  const createOrder = useMutation(api.orders.create.createOrder)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
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
  const selectedChildId = form.watch("childId")

  // Fetch child data when a child is selected
  const selectedChild = useQuery(
    api.children.get.getChildById,
    selectedChildId ? { childId: selectedChildId as Id<"children"> } : "skip"
  )

  // Calculate end date when start date and order type change
  const endDate = React.useMemo(() => {
    if (!selectedStartDate) return null
    return calculateEndDate(selectedStartDate, selectedOrderType)
  }, [selectedStartDate, selectedOrderType])

  // Calculate pricing data
  const pricingData = React.useMemo(() => {
    if (!selectedStartDate || !endDate || offDaysLoading) return null
    
    const billableDays = calculateBillableDays(selectedStartDate, endDate, offDays)
    return calculateOrderPrice(selectedOrderType, billableDays)
  }, [selectedStartDate, endDate, selectedOrderType, offDays, offDaysLoading])

  // Generate query args based on current date + 3 months
  const queryArgs = React.useMemo(() => {
    if (!selectedChildId) return "skip"
    
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    
    return {
      childId: selectedChildId as Id<"children">,
      startDate: formatDateToISO(today),
      endDate: formatDateToISO(maxDate),
    }
  }, [selectedChildId])

  const fetchedOffDays = useQuery(
    api.offdays.list.listFutureOffDaysByChildId, 
    queryArgs
  )

  React.useEffect(() => {
    // Reset offDays when query is skipped
    if (queryArgs === "skip") {
      setOffDays([])
      setOffDaysLoading(false)
    } else if (fetchedOffDays === undefined) {
      // When query is not skipped but data is undefined, we're loading
      setOffDays([])
      setOffDaysLoading(true)
    } else if (Array.isArray(fetchedOffDays)) {
      // Only map and set offDays when fetchedOffDays is a defined array
      setOffDays(fetchedOffDays.map(dateStr => new Date(dateStr)))
      setOffDaysLoading(false)
    }
  }, [fetchedOffDays, queryArgs])

  // Track the last child ID to only populate preferences when child changes
  const lastChildIdRef = React.useRef<string>("")

  // Auto-populate form fields with child preferences when child is selected
  React.useEffect(() => {
    // Use selectedChildId (from watch) as source of truth, but also check form.getValues
    const currentChildId = form.getValues("childId")
    const effectiveChildId = selectedChildId || currentChildId

    // If selectedChildId exists but form.getValues doesn't have it, restore it
    if (selectedChildId && !currentChildId) {
      form.setValue("childId", selectedChildId, { shouldValidate: false })
    }
    
    // Only reset if childId is actually empty (user cleared the selection)
    if (!effectiveChildId) {
      if (lastChildIdRef.current !== "") {
        // Only reset if we had a child before
        form.setValue("allergies", "", { shouldValidate: false })
        form.setValue("breadType", "none", { shouldValidate: false })
        form.setValue("crust", false, { shouldValidate: false })
        form.setValue("butter", false, { shouldValidate: false })
        lastChildIdRef.current = ""
      }
      return
    }

    // Only populate if this is a new child selection AND we have the child data
    if (selectedChild && effectiveChildId && lastChildIdRef.current !== effectiveChildId) {
      // Populate preference fields from child's preferences
      form.setValue("allergies", selectedChild.preferences.allergies || "", {
        shouldValidate: false,
      })
      form.setValue("breadType", selectedChild.preferences.breadType, {
        shouldValidate: false,
      })
      form.setValue("crust", selectedChild.preferences.crust, {
        shouldValidate: false,
      })
      form.setValue("butter", selectedChild.preferences.butter, {
        shouldValidate: false,
      })
      // Note: We intentionally do NOT update the "notes" field as it's order-specific
      lastChildIdRef.current = effectiveChildId
    }
  }, [selectedChild, selectedChildId, form, step])

  const onStep1Next = async () => {
    // Clear any previous errors
    form.clearErrors()

    const step1Fields = {
      childId: form.getValues("childId"),
      notes: form.getValues("notes"),
      allergies: form.getValues("allergies"),
      breadType: form.getValues("breadType"),
      crust: form.getValues("crust"),
      butter: form.getValues("butter"),
    }

    const result = step1Schema.safeParse(step1Fields)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FormValues
        form.setError(fieldName, {
          message: issue.message,
        })
      })
      return
    }

    // Values are already in the form, just move to next step
    setStep(2)
  }

  const onStep2Next = async () => {
    // Clear any previous errors
    form.clearErrors()

    const step2Fields = {
      orderType: form.getValues("orderType"),
      startDate: form.getValues("startDate"),
    }

    const result = step2Schema.safeParse(step2Fields)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FormValues
        form.setError(fieldName, {
          message: issue.message,
        })
      })
      return
    }

    // Values are already in the form, just move to next step
    setStep(3)
  }

  const onStep2Back = () => {
    // Form values are automatically preserved by react-hook-form
    // Just navigate back to step 1
    setStep(1)
  }

  const onStep3Back = () => {
    // Form values are automatically preserved by react-hook-form
    // Just navigate back to step 2
    setStep(2)
  }

  const onSubmit = async (values: FormValues) => {
    // Only allow submission on step 3
    if (step !== 3) {
      return
    }

    // Manually validate the form
    const isValid = await form.trigger()
    if (!isValid) {
      // Check which step has errors and navigate there
      const errors = form.formState.errors
      if (errors.childId || errors.notes || errors.allergies || errors.breadType || errors.crust || errors.butter) {
        setStep(1)
      }
      return
    }

    // Double-check required fields
    if (!values.childId || values.childId === "") {
      form.setError("childId", { message: "Child is required" })
      setStep(1)
      return
    }

    if (!values.startDate) {
      form.setError("startDate", { message: "Start date is required" })
      return
    }

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
      <CardHeader className="pb-4">
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Place an order for your child</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderStepper currentStep={step} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 ? (
              <>
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

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/orders")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={onStep1Next}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                {offDaysLoading && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Loading available dates...
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="orderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Reset startDate when order type changes
                          form.resetField("startDate", { defaultValue: undefined })
                        }}
                        value={field.value}
                        disabled={offDaysLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day-order">Day Order</SelectItem>
                          <SelectItem value="week-order">Week Order</SelectItem>
                          <SelectItem value="month-order">
                            Month Order
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOrderType && (
                  <div className="space-y-2">
                    <FormLabel>
                      {selectedOrderType === "day-order" && "Select a Date"}
                      {selectedOrderType === "week-order" && "Select a Week"}
                      {selectedOrderType === "month-order" && "Select a Month"}
                    </FormLabel>

                      {selectedOrderType === "day-order" && (
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <DayPicker
                                selectedDate={field.value || null}
                                onDateChange={(date) => {
                                  field.onChange(date)
                                }}
                                offDays={offDays}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedOrderType === "week-order" && (
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <WeekPicker
                                selectedDate={field.value || null}
                                onDateChange={(date) => {
                                  field.onChange(date)
                                }}
                                offDays={offDays}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedOrderType === "month-order" && (
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <MonthPicker
                                selectedDate={field.value || null}
                                onDateChange={(date) => {
                                  field.onChange(date)
                                }}
                                offDays={offDays}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onStep2Back}
                    disabled={form.formState.isSubmitting || offDaysLoading}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={onStep2Next}
                    disabled={form.formState.isSubmitting || offDaysLoading}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Step 3: Order Overview */}
                <div className="space-y-6">
                  {/* Two-column layout for desktop, single column for mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Child Info & Order Details */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Child Information</h3>
                        <div className="space-y-3 pl-4 border-l-2">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Child:</span>
                            <p className="text-base mt-1">
                              {selectedChild
                                ? `${selectedChild.firstName} ${selectedChild.lastName}`
                                : "Not selected"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Order Details</h3>
                        <div className="space-y-3 pl-4 border-l-2">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Order Type:</span>
                            <p className="text-base mt-1">
                              {selectedOrderType
                                ? formatOrderType(selectedOrderType)
                                : "Not selected"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Date Range:</span>
                            <p className="text-base mt-1">
                              {selectedStartDate && endDate
                                ? formatDateRange(selectedStartDate, endDate)
                                : "Not selected"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pricing</h3>
                      <div className="space-y-3 pl-4 border-l-2">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Billable Days:</span>
                          <p className="text-base mt-1">
                            {pricingData?.billableDays || 0} days
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Price per Day:</span>
                          <p className="text-base mt-1">
                            {pricingData ? formatPrice(pricingData.pricePerDay) : formatPrice(0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
                          <p className="text-base mt-1 font-semibold">
                            {pricingData ? formatPrice(pricingData.totalPrice) : formatPrice(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Width: Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preferences</h3>
                    <div className="space-y-3 pl-4 border-l-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                        <p className="text-base mt-1">
                          {form.watch("notes") || "None"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Allergies:</span>
                        <p className="text-base mt-1">
                          {form.watch("allergies") || "None"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Bread Type:</span>
                        <p className="text-base mt-1">
                          {formatBreadType(form.watch("breadType"))}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Crust:</span>
                        <p className="text-base mt-1">
                          {formatBoolean(form.watch("crust"))}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Butter:</span>
                        <p className="text-base mt-1">
                          {formatBoolean(form.watch("butter"))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onStep3Back}
                    disabled={form.formState.isSubmitting}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex-1"
                  >
                    {form.formState.isSubmitting
                      ? "Creating..."
                      : "Create Order"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

