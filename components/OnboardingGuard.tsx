"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Check if a subscription is active.
 * Subscription is active if expiresAt exists and is >= today (inclusive).
 */
function isSubscriptionActive(
  subscription: { expiresAt?: string } | undefined | null
): boolean {
  if (!subscription || !subscription.expiresAt) {
    return false;
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Compare dates as strings (ISO 8601 format allows lexicographic comparison)
  return subscription.expiresAt >= today;
}

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Use useQuery with error handling - if it throws, we treat it as user not found
  const currentUser = useQuery(api.users.get.getMyUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run redirect logic after component is mounted (client-side only)
    if (!mounted) {
      return;
    }

    // Don't redirect if we're already on the onboarding pages
    if (pathname === "/onboarding" || pathname === "/onboarding/subscription") {
      return;
    }

    // Wait for the query to complete
    if (currentUser === undefined) {
      return; // Still loading
    }

    // If user is authenticated but doesn't exist in database, redirect to onboarding
    if (currentUser === null) {
      router.replace("/onboarding");
      return;
    }

    // If user exists but doesn't have an active subscription, redirect to subscription page
    if (!isSubscriptionActive(currentUser.subscription)) {
      router.replace("/onboarding/subscription");
    }
  }, [currentUser, pathname, router, mounted]);

  // Show nothing while loading or redirecting
  if (!mounted || currentUser === undefined) {
    return null; // or a loading spinner
  }

  // If on onboarding pages, show children
  if (pathname === "/onboarding" || pathname === "/onboarding/subscription") {
    return <>{children}</>;
  }

  // If user exists and has active subscription, show children
  if (currentUser !== null && isSubscriptionActive(currentUser.subscription)) {
    return <>{children}</>;
  }

  // Otherwise, show nothing while redirecting
  return null;
}

