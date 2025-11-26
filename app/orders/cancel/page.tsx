"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Render the order payment cancel page and update the order payment status by reading `session_id` from the URL.
 *
 * On mount, attempts to update order payment status to cancelled using the `session_id` query parameter; while the update is in progress it shows a processing message, on failure it shows an error message, and on success it shows confirmation text. Provides a button to navigate back to the orders page.
 *
 * @returns The React element for the order payment cancel page.
 */
export default function OrderCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateOrderPaymentStatus = useMutation(
    api.orders.update.updateOrderPaymentStatus
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          setError("Session ID not found in URL.");
          setIsLoading(false);
          return;
        }
        await updateOrderPaymentStatus({ sessionId, newStatus: "cancelled" });
        setIsLoading(false);
      } catch (err) {
        console.error("Error updating order payment status:", err);
        setError("Failed to update order status. Please contact support.");
        setIsLoading(false);
      }
    };

    updatePaymentStatus();
  }, [updateOrderPaymentStatus, searchParams]);

  const handleGoToOrders = () => {
    router.push("/orders");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <X className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your order payment was cancelled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center">
              <p>Processing cancellation...</p>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive text-center">
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground space-y-4">
              <p className="text-center">
                Your payment was cancelled. The order has not been placed. You
                can try again anytime.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleGoToOrders}
            disabled={isLoading}
          >
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

