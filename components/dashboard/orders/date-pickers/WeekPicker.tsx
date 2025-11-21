"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface WeekPickerProps {
  selectedDate: Date | null
  onDateChange: (date: Date) => void
  unavailableDates: Date[]
}

export function WeekPicker({ selectedDate, onDateChange, unavailableDates }: WeekPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMaxDate = () => {
    const max = new Date()
    max.setMonth(max.getMonth() + 3)
    return max
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - (day === 0 ? 6 : day - 1)
    return new Date(d.setDate(diff))
  }

  const isWeekDisabled = (weekStart: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = getMaxDate()
    maxDate.setHours(23, 59, 59, 999)
    return weekStart < today || weekStart > maxDate
  }

  const countAvailableDaysInWeek = (weekStart: Date) => {
    let count = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)

      const isUnavailable = unavailableDates.some(
        (unavailableDate) => date.toDateString() === unavailableDate.toDateString(),
      )

      if (!isUnavailable) {
        count++
      }
    }
    return count
  }

  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstWeekStart = getWeekStart(firstDay)
    const weeks = []

    const currentWeekStart = new Date(firstWeekStart)
    while (currentWeekStart <= lastDay) {
      weeks.push(new Date(currentWeekStart))
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }

    return weeks
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (
      newDate.getFullYear() > today.getFullYear() ||
      (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() >= today.getMonth())
    ) {
      setCurrentDate(newDate)
    }
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    const maxDate = getMaxDate()
    if (newDate <= maxDate) {
      setCurrentDate(newDate)
    }
  }

  const weeks = getWeeksInMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${weekStart.toLocaleDateString("default", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("default", { month: "short", day: "numeric" })}`
  }

  const isWeekSelected = (weekStart: Date) => {
    if (!selectedDate) return false
    const selectedWeekStart = getWeekStart(selectedDate)
    return weekStart.toDateString() === selectedWeekStart.toDateString()
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{monthName}</h3>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {weeks.map((weekStart, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => !isWeekDisabled(weekStart) && onDateChange(weekStart)}
              disabled={isWeekDisabled(weekStart)}
              className={`
                w-full p-3 rounded-lg text-left font-medium transition-colors border
                ${
                  isWeekDisabled(weekStart)
                    ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-30"
                    : isWeekSelected(weekStart)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-border hover:bg-blue-50 hover:border-blue-300 text-foreground"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>Week {idx + 1}</span>
                <span className="text-sm opacity-75">{formatWeekRange(weekStart)}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedDate && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Selected: {formatWeekRange(getWeekStart(selectedDate))} -{" "}
            {countAvailableDaysInWeek(getWeekStart(selectedDate))} days selected
          </div>
        )}
      </div>
    </Card>
  )
}
