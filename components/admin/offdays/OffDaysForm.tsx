"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateToISO } from "@/lib/date-utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "./DateRangePicker";
import { SchoolMultiSelect } from "./SchoolMultiSelect";

const formSchema = z
  .object({
    schoolIds: z
      .array(z.custom<Id<"schools">>((val) => typeof val === "string"))
      .min(1, "Select at least one school"),
    startDate: z.date({ message: "Start date is required" }),
    endDate: z.date({ message: "End date is required" }),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof formSchema>;

export function OffDaysForm() {
  const router = useRouter();
  const schools = useQuery(api.schools.list.listSchools);
  const createOffDays = useMutation(api.offdays.create.createOffDays);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolIds: [],
      reason: "",
    },
  });

  const watchedEndDate = form.watch("endDate");

  const onSubmit = async (values: FormValues) => {
    try {
      await createOffDays({
        startDate: formatDateToISO(values.startDate),
        endDate: formatDateToISO(values.endDate),
        schoolIds: values.schoolIds,
        reason: values.reason,
      });
      router.push("/admin/offdays");
    } catch (error) {
      console.error("Error creating offdays:", error);
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to create offdays",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Off Days</CardTitle>
        <CardDescription>
          Select schools and a date range to mark days as off (e.g., holidays,
          teacher training).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="schoolIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schools</FormLabel>
                  <FormControl>
                    <SchoolMultiSelect
                      schools={schools?.map((s) => ({
                        _id: s._id,
                        name: s.name,
                      })) || []}
                      selectedSchoolIds={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      startDate={field.value}
                      endDate={watchedEndDate}
                      onRangeChange={(range) => {
                        if (range?.from) {
                          form.setValue("startDate", range.from);
                          if (range.to) {
                            form.setValue("endDate", range.to);
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {form.formState.errors.endDate && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Christmas Holidays"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Off Days"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

