"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Id } from "@/convex/_generated/dataModel"

export default function ChildrenPage() {
  const children = useQuery(api.children.list.listMyChildrenWithSchoolAndClassNames)
  const deleteChild = useMutation(api.children.delete.deleteChildById)

  const handleDelete = async (childId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this child? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      await deleteChild({ childId: childId as Id<"children"> })
    } catch (error) {
      console.error("Error deleting child:", error)
      alert("Failed to delete child. Please try again.")
    }
  }

  if (children === undefined) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Children</CardTitle>
                <CardDescription>
                  Manage your children&apos;s information
                </CardDescription>
              </div>
              <Link href="/children/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create new child
                </Button>
              </Link>
            </div>
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
              <CardTitle>Children</CardTitle>
              <CardDescription>
                Manage your children&apos;s information
              </CardDescription>
            </div>
            <Link href="/children/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create new child
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No children found. Create your first child to get started.
              </p>
              <Link href="/children/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create new child
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <ChildRow
                    key={child._id}
                    child={child}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChildRow({
  child,
  onDelete,
}: {
  child: {
    _id: string
    firstName: string
    lastName: string
    schoolName: string
    className: string
  }
  onDelete: (childId: string) => void
}) {
  const router = useRouter()

  return (
    <TableRow>
      <TableCell>{child.firstName}</TableCell>
      <TableCell>{child.lastName}</TableCell>
      <TableCell>{child.schoolName}</TableCell>
      <TableCell>{child.className}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/children/${child._id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(child._id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

