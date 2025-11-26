"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Menu, X } from "lucide-react";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname?.startsWith("/onboarding")) {
    return null;
  }

  const isAdminRoute = pathname?.startsWith("/admin");

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">Boterhammen op School</span>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {isAdminRoute ? (
              <>
                <Link
                  href="/admin"
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
                <Link
                  href="/admin/offdays"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Off days
                </Link>
                <Link
                  href="/admin/profit-calculator"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Calculator
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

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-4">
            <UserButton />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-background md:hidden">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-xl font-bold">Boterhammen op School</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col flex-1 items-center justify-start px-4 py-6 gap-4">
              {isAdminRoute ? (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Charts
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/offdays"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Off days
                  </Link>
                  <Link
                    href="/admin/profit-calculator"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Calculator
                  </Link>
                  <Button onClick={closeMobileMenu} className="w-full justify-center">
                    Download todays tickets
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/children"
                    onClick={closeMobileMenu}
                    className="text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Children
                  </Link>
                  <Button asChild onClick={closeMobileMenu} className="w-full justify-center">
                    <Link href="/orders/create">
                      <Plus className="mr-2 h-4 w-4" />
                      New order
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

