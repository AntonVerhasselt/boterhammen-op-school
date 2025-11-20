"use client"

import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/components/dashboard/orders/OrdersTable"

export default function AdminOrdersPage() {
  const listAllOrdersForAdmin = useAction(api.orders.admin.listAllOrdersForAdmin)
  const [orders, setOrders] = useState<
    Array<{
      _id: string
      _creationTime: number
      childId: string
      childName: string
      orderType: "day-order" | "week-order" | "month-order"
      startDate: string
      endDate: string
      deliveryStatus: "ordered" | "in-progress" | "delivered" | "cancelled"
      paymentStatus: "pending" | "paid" | "refunded" | "failed" | "cancelled"
    }>
  >()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await listAllOrdersForAdmin({})
        setOrders(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [listAllOrdersForAdmin])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage all orders</CardDescription>
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

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
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
          <div>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage all orders</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {orders && orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            orders && <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

