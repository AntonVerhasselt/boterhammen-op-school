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
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Render the order payment success page and update the order payment status by reading `session_id` from the URL.
 *
 * On mount, attempts to update order payment status using the `session_id` query parameter; while the update is in progress it shows a processing message, on failure it shows an error message, and on success it shows confirmation text. Provides a button to navigate back to the orders page.
 *
 * @returns The React element for the order payment success page.
 */
export default function OrderSuccessPage() {
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
          setError("Session ID not found in URL. Please contact support.");
          setIsLoading(false);
          return;
        }
        await updateOrderPaymentStatus({ sessionId, newStatus: "paid" });
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
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your order has been placed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center">
              <p>Processing your order...</p>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive text-center">
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground space-y-4">
              <p className="text-center">
                Thank you for your payment! Your order has been successfully
                placed and will be processed.
              </p>
              <p className="text-center">
                You can view your order details in the orders page.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleGoToOrders}
            disabled={isLoading}
          >
            Go to Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

