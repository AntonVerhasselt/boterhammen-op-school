/**
 * Price per day for different order types (in euros)
 */
export const PRICE_PER_DAY = {
  "day-order": 3.10,
  "week-order": 2.90,
  "month-order": 2.75,
} as const;

/**
 * Calculate the number of billable days in a date range, excluding off days.
 * Off days include Wednesdays, Saturdays, Sundays, and custom school off days.
 */
export function calculateBillableDays(
  startDate: Date,
  endDate: Date,
  offDays: Date[]
): number {
  // Normalize off days to date strings for easier comparison
  const offDayStrings = new Set(
    offDays.map((date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized.toDateString();
    })
  );

  let billableDays = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Iterate through all dates from start to end (inclusive)
  while (current <= end) {
    const dateString = current.toDateString();
    
    // Count day if it's NOT in the off days set
    if (!offDayStrings.has(dateString)) {
      billableDays++;
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return billableDays;
}

/**
 * Calculate the price breakdown for an order
 */
export function calculateOrderPrice(
  orderType: "day-order" | "week-order" | "month-order",
  billableDays: number
): {
  pricePerDay: number;
  totalPrice: number;
  billableDays: number;
} {
  const pricePerDay = PRICE_PER_DAY[orderType];
  const totalPrice = billableDays * pricePerDay;

  return {
    pricePerDay,
    totalPrice,
    billableDays,
  };
}

/**
 * Format a price in European format (e.g., €2,75)
 */
export function formatPrice(amount: number): string {
  // Format to 2 decimal places and replace decimal point with comma
  const formatted = amount.toFixed(2).replace(".", ",");
  return `€${formatted}`;
}

