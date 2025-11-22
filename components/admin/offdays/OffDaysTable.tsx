"use client"

import { useState, useMemo, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateReadable } from "@/lib/date-utils"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

type OffDay = {
  _id: Id<"offDays">
  _creationTime: number
  date: string
  schoolId: Id<"schools">
  schoolName: string
  reason?: string
}

type School = {
  _id: Id<"schools">
  name: string
}

interface OffDaysTableProps {
  offDays: OffDay[]
  schools: School[]
}

export function OffDaysTable({ offDays, schools }: OffDaysTableProps) {
  const [schoolNameFilter, setSchoolNameFilter] = useState<string>("all")
  const [reasonFilter, setReasonFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const deleteOffDay = useMutation(api.offdays.delete.deleteOffDay)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [schoolNameFilter, reasonFilter])

  // Reset all filters
  const resetFilters = () => {
    setSchoolNameFilter("all")
    setReasonFilter("")
    setCurrentPage(1)
  }

  // Handle delete with confirmation
  const handleDelete = async (offDayId: Id<"offDays">, date: string, schoolName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the off day on ${formatDateReadable(date)} for ${schoolName}? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      await deleteOffDay({ offDayId })
    } catch (error) {
      console.error("Error deleting off day:", error)
      alert("Failed to delete off day. Please try again.")
    }
  }

  // Filter off days based on selected filters
  const filteredOffDays = useMemo(() => {
    return offDays.filter((offDay) => {
      // School Name filter
      if (schoolNameFilter !== "all" && offDay.schoolName !== schoolNameFilter) {
        return false
      }

      // Reason filter (case-insensitive partial match)
      if (reasonFilter) {
        const reason = offDay.reason || ""
        if (!reason.toLowerCase().includes(reasonFilter.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [offDays, schoolNameFilter, reasonFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOffDays.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOffDays = useMemo(() => {
    return filteredOffDays.slice(startIndex, endIndex)
  }, [filteredOffDays, startIndex, endIndex])

  // Pagination handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">School Name</label>
          <Select value={schoolNameFilter} onValueChange={setSchoolNameFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school._id} value={school.name}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason</label>
          <Input
            placeholder="Filter by reason..."
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results count and reset button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOffDays.length === 0 ? 0 : startIndex + 1}-
          {Math.min(endIndex, filteredOffDays.length)} of {filteredOffDays.length} off days
          {filteredOffDays.length !== offDays.length && ` (${offDays.length} total)`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          disabled={
            schoolNameFilter === "all" &&
            reasonFilter === ""
          }
        >
          Reset all filters
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>School Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOffDays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-muted-foreground">
                  {filteredOffDays.length === 0
                    ? "No off days match the selected filters."
                    : "No off days on this page."}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            paginatedOffDays.map((offDay) => (
              <TableRow key={offDay._id}>
                <TableCell className="font-medium">
                  {offDay.schoolName}
                </TableCell>
                <TableCell>
                  {formatDateReadable(offDay.date)}
                </TableCell>
                <TableCell>
                  {offDay.reason || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(offDay._id, offDay.date, offDay.schoolName)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredOffDays.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Items per page:</label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

