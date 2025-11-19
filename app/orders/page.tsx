"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateRange } from "@/lib/date-utils"
import { Plus } from "lucide-react"

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

export default function OrdersPage() {
  const orders = useQuery(api.orders.listMyOrders, {})

  if (orders === undefined) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>View and manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>View and manage your orders</CardDescription>
            </div>
            <Button asChild>
              <Link href="/orders/create">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any orders yet.
              </p>
              <Button asChild>
                <Link href="/orders/create">Create Your First Order</Link>
              </Button>
            </div>
          ) : (
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
                {orders.map((order) => (
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

