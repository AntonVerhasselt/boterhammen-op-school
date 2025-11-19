"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

