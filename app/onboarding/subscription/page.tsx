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
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

/**
 * Render the annual subscription page and initiate a Stripe checkout flow when the user clicks the payment button.
 *
 * The payment button is disabled while a request is in progress or when the user is not authenticated. When clicked by an authenticated user, a checkout session is requested using the user's Clerk ID and the browser is redirected to the returned Stripe URL.
 *
 * @returns The subscription page React element.
 */
export default function SubscriptionPage() {
  const { userId } = useAuth();
  const payAccessFee = useAction(api.stripe.payAccessFee.payAccessFee);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayClick = async () => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await payAccessFee({ clerkUserId: userId });
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
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
          
          <Button 
            className="w-full" 
            onClick={handlePayClick}
            disabled={isLoading || !userId}
          >
            {isLoading ? "Loading..." : "Pay €10 via Stripe"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
