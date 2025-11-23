"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function SubscriptionPage() {
  const payAccessFee = useAction(api.stripe.payAccessFee.payAccessFee);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await payAccessFee({});
      if (!url) {
        const errorMessage = "Failed to create checkout session. Please try again or contact support.";
        console.error("Error: payAccessFee returned no URL");
        setError(errorMessage);
        return;
      }
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Failed to create checkout session. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Annual Subscription</CardTitle>
          <CardDescription>
            Support our ecological initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground space-y-4">
            <p>
              To use our services, we ask for a €10 subscription fee for the current school year.
            </p>
            <p>
              This small contribution helps us provide ecological lunchboxes and covers necessary administrative costs to keep the platform running smoothly.
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-destructive text-center">
              <p>{error}</p>
            </div>
          )}
          
          <Button 
            className="w-full" 
            onClick={handlePayClick}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Pay €10 via Stripe"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

