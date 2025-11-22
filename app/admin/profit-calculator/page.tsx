"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

// --- Constants & Types ---

const FIXED_VALUES = {
  VAT_RATE: 0.06,
  STRIPE_FEE: 0.35,
  SCHOOL_DAYS_PER_MONTH: 17,
  LUNCHES_PER_ORDER: {
    MAAND: 17,
    WEEK: 4,
    DAG: 1,
  },
}

type CalculatorState = {
  priceMaand: number
  priceWeek: number
  priceDag: number
  foodCost: number
  distMaand: number
  distWeek: number
  distDag: number
}

const INITIAL_STATE: CalculatorState = {
  priceMaand: 2.75,
  priceWeek: 2.90,
  priceDag: 3.10,
  foodCost: 0.90,
  distMaand: 60,
  distWeek: 30,
  distDag: 10,
}

export default function ProfitCalculatorPage() {
  const [values, setValues] = useState<CalculatorState>(INITIAL_STATE)

  // --- Calculations ---

  const calculations = useMemo(() => {
    // 1. Prices excl. VAT
    const vatDivisor = 1 + FIXED_VALUES.VAT_RATE
    const priceMaandExcl = values.priceMaand / vatDivisor
    const priceWeekExcl = values.priceWeek / vatDivisor
    const priceDagExcl = values.priceDag / vatDivisor

    // 2. Weighted Average Selling Price (excl VAT)
    // Convert percentages to decimals (e.g. 60 -> 0.6)
    const shareMaand = values.distMaand / 100
    const shareWeek = values.distWeek / 100
    const shareDag = values.distDag / 100

    const avgPriceExcl =
      shareMaand * priceMaandExcl +
      shareWeek * priceWeekExcl +
      shareDag * priceDagExcl

    // 3. Food Cost excl. VAT
    const foodCostExcl = values.foodCost / vatDivisor

    // 4. Weighted Average Stripe Fee per Lunch
    // Fee per lunch = Fixed Fee / Lunches in package
    const feePerLunchMaand =
      FIXED_VALUES.STRIPE_FEE / FIXED_VALUES.LUNCHES_PER_ORDER.MAAND
    const feePerLunchWeek =
      FIXED_VALUES.STRIPE_FEE / FIXED_VALUES.LUNCHES_PER_ORDER.WEEK
    const feePerLunchDag =
      FIXED_VALUES.STRIPE_FEE / FIXED_VALUES.LUNCHES_PER_ORDER.DAG

    const avgStripeFee =
      shareMaand * feePerLunchMaand +
      shareWeek * feePerLunchWeek +
      shareDag * feePerLunchDag

    // 5. Profit per Lunch
    const profitPerLunch = avgPriceExcl - foodCostExcl - avgStripeFee

    return {
      priceMaandExcl,
      priceWeekExcl,
      priceDagExcl,
      avgPriceExcl,
      foodCostExcl,
      avgStripeFee,
      profitPerLunch,
      totalDist: values.distMaand + values.distWeek + values.distDag,
    }
  }, [values])

  // --- Chart Data ---

  const chartData = useMemo(() => {
    const data = []
    if (calculations.profitPerLunch <= 0) return []

    for (let target = 1000; target <= 25000; target += 1000) {
      const lunchesNeeded = target / calculations.profitPerLunch
      const lunchesPerDay = lunchesNeeded / FIXED_VALUES.SCHOOL_DAYS_PER_MONTH
      data.push({
        target,
        lunchesNeeded: Math.round(lunchesNeeded),
        lunchesPerDay: Math.round(lunchesPerDay),
      })
    }
    return data
  }, [calculations.profitPerLunch])

  // --- Handlers ---

  const handleChange = (field: keyof CalculatorState, value: string) => {
    const numValue = parseFloat(value)
    setValues((prev) => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }))
  }

  // --- Render Helpers ---

  const formatEuro = (val: number) =>
    new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR",
    }).format(val)

  const formatNumber = (val: number, decimals = 2) =>
    new Intl.NumberFormat("nl-BE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val)

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profit Calculator</h1>
        <p className="text-muted-foreground">
          Simulate pricing, costs, and volume scenarios to estimate gross profit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        {/* LEFT COLUMN: Inputs & Fixed Values */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Variables</CardTitle>
              <CardDescription>Adjust prices and distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prices */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Prices (incl. VAT)
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priceMaand">Maandpakket Price (€)</Label>
                    <Input
                      id="priceMaand"
                      type="number"
                      step="0.01"
                      value={values.priceMaand}
                      onChange={(e) =>
                        handleChange("priceMaand", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priceWeek">Weekpakket Price (€)</Label>
                    <Input
                      id="priceWeek"
                      type="number"
                      step="0.01"
                      value={values.priceWeek}
                      onChange={(e) =>
                        handleChange("priceWeek", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priceDag">Dagpakket Price (€)</Label>
                    <Input
                      id="priceDag"
                      type="number"
                      step="0.01"
                      value={values.priceDag}
                      onChange={(e) =>
                        handleChange("priceDag", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Costs (incl. VAT)
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="foodCost">Food Cost per Lunch (€)</Label>
                  <Input
                    id="foodCost"
                    type="number"
                    step="0.01"
                    value={values.foodCost}
                    onChange={(e) => handleChange("foodCost", e.target.value)}
                  />
                </div>
              </div>

              {/* Distribution */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Distribution Mix (%)
                  </h3>
                  <span
                    className={
                      Math.abs(calculations.totalDist - 100) < 0.1
                        ? "text-green-600 text-xs font-medium"
                        : "text-red-600 text-xs font-bold"
                    }
                  >
                    Total: {calculations.totalDist}%
                  </span>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="distMaand">Maandpakket %</Label>
                    <Input
                      id="distMaand"
                      type="number"
                      value={values.distMaand}
                      onChange={(e) =>
                        handleChange("distMaand", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="distWeek">Weekpakket %</Label>
                    <Input
                      id="distWeek"
                      type="number"
                      value={values.distWeek}
                      onChange={(e) =>
                        handleChange("distWeek", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="distDag">Dagpakket %</Label>
                    <Input
                      id="distDag"
                      type="number"
                      value={values.distDag}
                      onChange={(e) => handleChange("distDag", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fixed Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">VAT Rate</dt>
                  <dd className="font-medium">
                    {FIXED_VALUES.VAT_RATE * 100}%
                  </dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Stripe Fee/Order</dt>
                  <dd className="font-medium">
                    {formatEuro(FIXED_VALUES.STRIPE_FEE)}
                  </dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">School Days/Month</dt>
                  <dd className="font-medium">
                    {FIXED_VALUES.SCHOOL_DAYS_PER_MONTH}
                  </dd>
                </div>
                <div className="pt-2">
                  <dt className="text-muted-foreground mb-2">
                    Lunches per Order
                  </dt>
                  <dd className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted p-2 rounded">
                      <div className="text-xs text-muted-foreground">Maand</div>
                      <div className="font-bold">
                        {FIXED_VALUES.LUNCHES_PER_ORDER.MAAND}
                      </div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="text-xs text-muted-foreground">Week</div>
                      <div className="font-bold">
                        {FIXED_VALUES.LUNCHES_PER_ORDER.WEEK}
                      </div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="text-xs text-muted-foreground">Dag</div>
                      <div className="font-bold">
                        {FIXED_VALUES.LUNCHES_PER_ORDER.DAG}
                      </div>
                    </div>
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p>
                  <strong>Note:</strong> 17 days based on typical schedule (4
                  days/week × ~4.33 weeks ≈ 17.3).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Calculations & Charts */}
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Profit Analysis</CardTitle>
              <CardDescription>
                Step-by-step breakdown of margin per lunch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="grid gap-2 pb-4 border-b">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  Prices excl. VAT (6%)
                </h4>
                <div className="grid grid-cols-3 gap-4 pl-8 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Maand</span>
                    <span className="font-mono">
                      {formatEuro(calculations.priceMaandExcl)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Week</span>
                    <span className="font-mono">
                      {formatEuro(calculations.priceWeekExcl)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Dag</span>
                    <span className="font-mono">
                      {formatEuro(calculations.priceDagExcl)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid gap-2 pb-4 border-b">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  Avg. Selling Price (Weighted)
                </h4>
                <div className="pl-8 text-sm">
                  <div className="font-mono text-lg font-medium text-foreground">
                    {formatEuro(calculations.avgPriceExcl)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({values.distMaand}% ×{" "}
                    {formatNumber(calculations.priceMaandExcl)}) + (
                    {values.distWeek}% ×{" "}
                    {formatNumber(calculations.priceWeekExcl)}) + (
                    {values.distDag}% × {formatNumber(calculations.priceDagExcl)}
                    )
                  </p>
                </div>
              </div>

              {/* Step 3 & 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
                <div className="grid gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      3
                    </span>
                    Food Cost excl. VAT
                  </h4>
                  <div className="pl-8 text-sm">
                    <div className="font-mono text-lg text-red-600 dark:text-red-400">
                      - {formatEuro(calculations.foodCostExcl)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatEuro(values.foodCost)} ÷ 1.06
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      4
                    </span>
                    Avg. Stripe Fee
                  </h4>
                  <div className="pl-8 text-sm">
                    <div className="font-mono text-lg text-red-600 dark:text-red-400">
                      - {formatEuro(calculations.avgStripeFee)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Weighted avg of fees per lunch
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            <div className="space-y-2">
                              <p className="font-semibold">Calculation Breakdown:</p>
                              <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li>
                                  Maand: €0.35 / {FIXED_VALUES.LUNCHES_PER_ORDER.MAAND} = {formatEuro(0.35 / FIXED_VALUES.LUNCHES_PER_ORDER.MAAND)}
                                </li>
                                <li>
                                  Week: €0.35 / {FIXED_VALUES.LUNCHES_PER_ORDER.WEEK} = {formatEuro(0.35 / FIXED_VALUES.LUNCHES_PER_ORDER.WEEK)}
                                </li>
                                <li>
                                  Dag: €0.35 / {FIXED_VALUES.LUNCHES_PER_ORDER.DAG} = {formatEuro(0.35)}
                                </li>
                              </ul>
                              <p className="border-t pt-1 opacity-90">
                                Weighted by distribution: {values.distMaand}% / {values.distWeek}% / {values.distDag}%
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-4">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    5
                  </span>
                  Net Profit Per Lunch
                </h4>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-bold text-primary tracking-tight">
                      {formatEuro(calculations.profitPerLunch)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Average Price - Food Cost - Stripe Fee
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">Margin</div>
                    <div className="font-bold text-foreground">
                      {calculations.avgPriceExcl > 0
                        ? Math.round(
                            (calculations.profitPerLunch /
                              calculations.avgPriceExcl) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Scenarios</CardTitle>
              <CardDescription>
                Lunches needed to reach gross profit targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="target"
                      tickFormatter={(val) => `€${val / 1000}k`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                              <div className="font-bold mb-2 text-primary">
                                {formatEuro(data.target)} Profit
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-muted-foreground">
                                  Monthly Lunches:
                                </span>
                                <span className="font-mono text-right">
                                  {data.lunchesNeeded.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground">
                                  Daily Lunches:
                                </span>
                                <span className="font-mono text-right">
                                  {data.lunchesPerDay.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="lunchesNeeded"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

