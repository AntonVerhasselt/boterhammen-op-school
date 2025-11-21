"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DayPickerProps {
  selectedDate: Date | null
  onDateChange: (date: Date) => void
  unavailableDates: Date[]
}

export function DayPicker({ selectedDate, onDateChange, unavailableDates }: DayPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMaxDate = () => {
    const max = new Date()
    max.setMonth(max.getMonth() + 3)
    return max
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = getMaxDate()
    maxDate.setHours(23, 59, 59, 999)

    if (date < today || date > maxDate) return true

    // Check if date is in unavailable dates
    return unavailableDates.some((unavailableDate) => date.toDateString() === unavailableDate.toDateString())
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const dayOfWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
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

  const days = []
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

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

        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {days.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => day && !isDateDisabled(day) && onDateChange(day)}
              className={`
                w-full aspect-square flex items-center justify-center rounded text-sm font-medium transition-colors
                ${!day || isDateDisabled(day) ? "bg-muted text-muted-foreground/20 cursor-not-allowed" : "hover:bg-blue-100 hover:text-blue-900 cursor-pointer"}
                ${
                  day && !isDateDisabled(day) && selectedDate && day.toDateString() === selectedDate.toDateString()
                    ? "bg-blue-500 text-white"
                    : day && !isDateDisabled(day)
                      ? "text-foreground"
                      : ""
                }
              `}
              disabled={!day || isDateDisabled(day)}
            >
              {day?.getDate()}
            </button>
          ))}
        </div>

        {selectedDate && (
          <div className="text-sm text-muted-foreground pt-2 border-t">Selected: {selectedDate.toDateString()}</div>
        )}
      </div>
    </Card>
  )
}