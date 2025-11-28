"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Guards access to children based on user onboarding state and performs a client-side redirect to onboarding when required.
 *
 * This component waits for client mount and the user query to settle. If the user is authenticated but has no corresponding database record, it replaces the current route with `/onboarding`. While mounting or loading, or while redirecting, it renders `null`.
 *
 * @param children - The content to render when the user is allowed to access the guarded area or when already on the onboarding page.
 * @returns The `children` when access is allowed (user exists or current path is `/onboarding`); `null` while loading, mounting, or redirecting to `/onboarding`.
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
  const currentUser = useQuery(api.users.getMyUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run redirect logic after component is mounted (client-side only)
    if (!mounted) {
      return;
    }

    // Don't redirect if we're already on the onboarding page
    if (pathname === "/onboarding") {
      return;
    }

    // Wait for the query to complete
    if (currentUser === undefined) {
      return; // Still loading
    }

    // If user is authenticated but doesn't exist in database, redirect to onboarding
    if (currentUser === null) {
      router.replace("/onboarding");
    }
  }, [currentUser, pathname, router, mounted]);

  // Show nothing while loading or redirecting
  if (!mounted || currentUser === undefined) {
    return null; // or a loading spinner
  }

  // If on onboarding page or user exists, show children
  if (pathname === "/onboarding" || currentUser !== null) {
    return <>{children}</>;
  }

  // Otherwise, show nothing while redirecting
  return null;
}
