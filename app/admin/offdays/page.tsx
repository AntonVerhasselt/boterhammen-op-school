"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { OffDaysTable } from "@/components/admin/offdays/OffDaysTable"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function OffDaysPage() {
  const offDays = useQuery(api.offdays.list.listAllFutureOffDays)
  const schools = useQuery(api.schools.list.listSchools)

  if (offDays === undefined || schools === undefined) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Off Days</CardTitle>
            <CardDescription>Manage school off days and holidays</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Off Days</CardTitle>
              <CardDescription>Manage school off days and holidays</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/offdays/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Off Day
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {offDays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No off days have been created yet.
              </p>
              <Button asChild>
                <Link href="/admin/offdays/create">Create Your First Off Day</Link>
              </Button>
            </div>
          ) : (
            <OffDaysTable offDays={offDays} schools={schools} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

