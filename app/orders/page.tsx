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

function getPaymentStatusVariant(
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled"
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
    case "cancelled":
      return "destructive"
    case "refunded":
      return "outline"
    default:
      return "secondary"
  }
}

function getDeliveryStatusVariant(
  status: "ordered" | "delivered" | "cancelled"
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered":
      return "default"
    case "ordered":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

function formatPaymentStatus(
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled"
): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDeliveryStatus(
  status: "ordered" | "delivered" | "cancelled"
): string {
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
                        variant={getDeliveryStatusVariant(order.deliveryStatus)}
                      >
                        {formatDeliveryStatus(order.deliveryStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPaymentStatusVariant(order.paymentStatus)}
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

