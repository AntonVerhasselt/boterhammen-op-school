"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MonthPickerProps {
  selectedDate: Date | null
  onDateChange: (date: Date) => void
  offDays: Date[]
}

export function MonthPicker({ selectedDate, onDateChange, offDays }: MonthPickerProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const isMonthDisabled = (monthIndex: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    maxDate.setHours(23, 59, 59, 999)

    const monthDate = new Date(currentYear, monthIndex, 1)
    monthDate.setHours(0, 0, 0, 0)

    return monthDate <= today || monthDate > maxDate
  }

  const countAvailableDaysInMonth = (monthIndex: number, year: number) => {
    let count = 0
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day)

      const isOffDay = offDays.some(
        (offDay) => date.toDateString() === offDay.toDateString(),
      )

      if (!isOffDay) {
        count++
      }
    }
    return count
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handlePrevYear = () => {
    const today = new Date()
    if (currentYear > today.getFullYear()) {
      setCurrentYear(currentYear - 1)
    }
  }

  const handleNextYear = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    if (currentYear < maxDate.getFullYear()) {
      setCurrentYear(currentYear + 1)
    }
  }

  const isMonthSelected = (monthIndex: number) => {
    if (!selectedDate) return false
    return selectedDate.getFullYear() === currentYear && selectedDate.getMonth() === monthIndex
  }

  const handleMonthSelect = (monthIndex: number) => {
    if (!isMonthDisabled(monthIndex)) {
      onDateChange(new Date(currentYear, monthIndex, 1))
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{currentYear}</h3>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handlePrevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {months.map((month, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleMonthSelect(idx)}
              disabled={isMonthDisabled(idx)}
              className={`
                p-3 rounded-lg font-medium transition-colors border text-center
                ${
                  isMonthDisabled(idx)
                    ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-30"
                    : isMonthSelected(idx)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-border hover:bg-blue-50 hover:border-blue-300 text-foreground"
                }
              `}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>

        {selectedDate && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Selected: {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })} -{" "}
            {countAvailableDaysInMonth(selectedDate.getMonth(), selectedDate.getFullYear())} days selected
          </div>
        )}
      </div>
    </Card>
  )
}