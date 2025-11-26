"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Check if access is active.
 * Access is active if accessExpiresAt exists and is >= today (inclusive).
 */
function isAccessActive(accessExpiresAt: string | undefined | null): boolean {
  if (!accessExpiresAt) {
    return false;
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Compare dates as strings (ISO 8601 format allows lexicographic comparison)
  return accessExpiresAt >= today;
}

/**
 * Guards child content based on the current user's onboarding and subscription status, redirecting to onboarding routes when the user is not present in the database or lacks active access.
 *
 * Renders `children` when the component has mounted and either the current route is an onboarding route or the authenticated user exists in the database with active access. While the client check is pending or a redirect is being performed, nothing is rendered.
 *
 * @param children - Content to render when access is allowed or when viewing onboarding pages
 * @returns The `children` when rendering is permitted, `null` otherwise
 */
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
    if (pathname.startsWith("/onboarding")) {
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

    // If user exists but doesn't have active access, redirect to subscription page
    if (!isAccessActive(currentUser.accessExpiresAt)) {
      router.replace("/onboarding/subscription");
    }
  }, [currentUser, pathname, router, mounted]);

  // Show nothing while loading or redirecting
  if (!mounted || currentUser === undefined) {
    return null; // or a loading spinner
  }

  // If on onboarding pages, show children
  if (pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  // If user exists and has active access, show children
  if (currentUser !== null && isAccessActive(currentUser.accessExpiresAt)) {
    return <>{children}</>;
  }

  // Otherwise, show nothing while redirecting
  return null;
}
