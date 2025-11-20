"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">Boterhammen op School</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-6">
          {isAdminRoute ? (
            <>
              <Link
                href="/admin/charts"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Charts
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Orders
              </Link>
              <Button>
                Download todays tickets
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/children"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Children
              </Link>
              <Button asChild>
                <Link href="/orders/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New order
                </Link>
              </Button>
            </>
          )}
          <UserButton />
        </nav>
      </div>
    </header>
  );
}

