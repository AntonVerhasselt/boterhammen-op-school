"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionPage() {
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
            onClick={() => console.log("Redirect to Stripe")}
          >
            Pay €10 via Stripe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

