"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateRange } from "@/lib/date-utils"

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

function getPaymentStatusClassName(
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled"
): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    case "refunded":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
  }
}

function getDeliveryStatusClassName(
  status: "ordered" | "in-progress" | "delivered" | "cancelled"
): string {
  switch (status) {
    case "ordered":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
  }
}

function formatPaymentStatus(
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled"
): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDeliveryStatus(
  status: "ordered" | "in-progress" | "delivered" | "cancelled"
): string {
  if (status === "in-progress") {
    return "In Progress"
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

type Order = {
  _id: string
  _creationTime: number
  childId: string
  childName: string
  orderType: "day-order" | "week-order" | "month-order"
  startDate: string
  endDate: string
  deliveryStatus: "ordered" | "in-progress" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded" | "failed" | "cancelled"
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [childNameFilter, setChildNameFilter] = useState("")
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all")
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")

  // Reset all filters
  const resetFilters = () => {
    setChildNameFilter("")
    setOrderTypeFilter("all")
    setDeliveryStatusFilter("all")
    setPaymentStatusFilter("all")
  }

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Child Name filter (case-insensitive partial match)
      if (
        childNameFilter &&
        !order.childName.toLowerCase().includes(childNameFilter.toLowerCase())
      ) {
        return false
      }

      // Order Type filter
      if (orderTypeFilter !== "all" && order.orderType !== orderTypeFilter) {
        return false
      }

      // Delivery Status filter
      if (
        deliveryStatusFilter !== "all" &&
        order.deliveryStatus !== deliveryStatusFilter
      ) {
        return false
      }

      // Payment Status filter
      if (
        paymentStatusFilter !== "all" &&
        order.paymentStatus !== paymentStatusFilter
      ) {
        return false
      }

      return true
    })
  }, [orders, childNameFilter, orderTypeFilter, deliveryStatusFilter, paymentStatusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Child Name</label>
          <Input
            placeholder="Filter by child name..."
            value={childNameFilter}
            onChange={(e) => setChildNameFilter(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Type</label>
          <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All order types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Types</SelectItem>
              <SelectItem value="day-order">Day Order</SelectItem>
              <SelectItem value="week-order">Week Order</SelectItem>
              <SelectItem value="month-order">Month Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Delivery Status</label>
          <Select
            value={deliveryStatusFilter}
            onValueChange={setDeliveryStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Status</label>
          <Select
            value={paymentStatusFilter}
            onValueChange={setPaymentStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count and reset button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          disabled={
            childNameFilter === "" &&
            orderTypeFilter === "all" &&
            deliveryStatusFilter === "all" &&
            paymentStatusFilter === "all"
          }
        >
          Reset all filters
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Child Name</TableHead>
            <TableHead>Order Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Delivery Status</TableHead>
            <TableHead>Payment Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <p className="text-muted-foreground">No orders match the selected filters.</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">
                  {order.childName}
                </TableCell>
                <TableCell>{formatOrderType(order.orderType)}</TableCell>
                <TableCell>
                  {formatDateRange(order.startDate, order.endDate)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={getDeliveryStatusClassName(order.deliveryStatus)}
                  >
                    {formatDeliveryStatus(order.deliveryStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getPaymentStatusClassName(order.paymentStatus)}
                  >
                    {formatPaymentStatus(order.paymentStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

