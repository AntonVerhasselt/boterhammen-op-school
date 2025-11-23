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
 * Render the subscription success page and update the user's access by reading `session_id` from the URL.
 *
 * On mount, attempts to update user access using the `session_id` query parameter; while the update is in progress it shows an activation message, on failure it shows an error message, and on success it shows confirmation text. Provides a button to navigate back to the homepage.
 *
 * @returns The React element for the subscription success page.
 */
export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateUserAccess = useMutation(api.users.update.updateUserAccess);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateAccess = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          setError("Session ID not found in URL. Please contact support.");
          setIsLoading(false);
          return;
        }
        await updateUserAccess({ sessionId });
        setIsLoading(false);
      } catch (err) {
        console.error("Error updating user access:", err);
        setError("Failed to update access. Please contact support.");
        setIsLoading(false);
      }
    };

    updateAccess();
  }, [updateUserAccess, searchParams]);

  const handleGoHome = () => {
    router.push("/");
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
            Your subscription has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center">
              <p>Activating your subscription...</p>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive text-center">
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground space-y-4">
              <p className="text-center">
                Thank you for your payment! Your annual subscription has been
                successfully activated.
              </p>
              <p className="text-center">
                You now have full access to all features until the end of the
                current school year.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleGoHome}
            disabled={isLoading}
          >
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
