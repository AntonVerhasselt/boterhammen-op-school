"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, CartesianGrid, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format, subDays, addDays, isToday, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import type { FunctionReference } from "convex/server";

const chartConfig = {
  orderCount: {
    label: "Orders",
    color: "#3b82f6", // Blue color
  },
} satisfies ChartConfig;

type OrderCountData = Array<{ date: string; orderCount: number }>;

export function OrdersChart() {
  // Calculate date range: 30 days ago to 30 days in the future
  const today = new Date();
  const startDate = format(subDays(today, 30), "yyyy-MM-dd");
  const endDate = format(addDays(today, 30), "yyyy-MM-dd");

  const countOrdersPerDayRef = (
    api.orders as {
      count?: {
        countOrdersPerDay: FunctionReference<
          "action",
          "public",
          { startDate: string; endDate: string },
          OrderCountData
        >;
      };
    }
  ).count?.countOrdersPerDay;

  const countOrdersPerDay = useAction(
    countOrdersPerDayRef as FunctionReference<
      "action",
      "public",
      { startDate: string; endDate: string },
      OrderCountData
    >
  );

  const [data, setData] = useState<OrderCountData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    countOrdersPerDay({ startDate, endDate })
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load data"))
      .finally(() => setIsLoading(false));
  }, [countOrdersPerDay, startDate, endDate]);

  // Format date for display (e.g., "Jan 15")
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d");
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Orders Per Day</h2>
      <p className="text-muted-foreground mb-4">
        Showing orders from {formatDate(startDate)} to {formatDate(endDate)}
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <p>Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <p className="text-destructive">Error: {error}</p>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <p className="text-muted-foreground">No data available</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatDate}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="orderCount" fill="#3b82f6" radius={4}>
              {data.map((entry, index) => {
                const isTodayDate = isToday(parseISO(entry.date));
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isTodayDate ? "#ef4444" : "#3b82f6"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

