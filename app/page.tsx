"use client";

import { Authenticated } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <Authenticated>
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome to Boterhammen op School
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your children&apos;s sandwich orders for school
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Children
                </CardTitle>
                <CardDescription>
                  Manage your children&apos;s information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/children">View Children</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Orders
                </CardTitle>
                <CardDescription>
                  View and manage your sandwich orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/orders">View Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Authenticated>
    </main>
  );
}

