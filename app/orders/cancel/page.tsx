"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Render the order payment cancel page.
 *
 * Shows a cancellation message when a user cancels the Stripe checkout for an order.
 * Validates that session_id is present in the URL and provides a button to navigate back to the orders page.
 *
 * @returns The React element for the order payment cancel page.
 */
export default function OrderCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("Session ID not found in URL.");
    }
  }, [searchParams]);

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
          {error ? (
            <div className="text-sm text-muted-foreground text-center">
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

          <Button className="w-full" onClick={handleGoToOrders}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

