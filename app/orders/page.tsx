"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/components/dashboard/orders/OrdersTable"
import { Plus } from "lucide-react"

export default function OrdersPage() {
  const orders = useQuery(api.orders.list.listMyOrders, {})

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
            <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

