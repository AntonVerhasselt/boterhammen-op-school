"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  schoolId: z.string().min(1, "School is required"),
  classId: z.string().min(1, "Class is required"),
  allergies: z.string(),
  breadType: z.enum(["white", "brown", "none"]),
  crust: z.boolean(),
  butter: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface ChildFormProps {
  childId?: Id<"children">
  onSuccess?: () => void
}

export function ChildForm({ childId, onSuccess }: ChildFormProps) {
  const router = useRouter()
  const isEditMode = !!childId

  const child = useQuery(
    api.children.getChild,
    childId ? { childId } : "skip"
  )

  const schools = useQuery(api["schoolsandclasses"].listSchools, {})

  const createChild = useMutation(api.children.createChild)
  const updateChild = useMutation(api.children.updateChild)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      schoolId: "",
      classId: "",
      allergies: "",
      breadType: "none",
      crust: true,
      butter: false,
    },
  })

  const selectedSchoolId = form.watch("schoolId")
  const selectedClassId = form.watch("classId")

  // In edit mode, fetch classes for the child's school immediately
  // In create mode, fetch classes when a school is selected
  const schoolIdForClasses = isEditMode && child?.schoolId 
    ? child.schoolId 
    : selectedSchoolId

  // Fetch classes when school changes
  const classesForSchool = useQuery(
    api["schoolsandclasses"].listClassesBySchool,
    schoolIdForClasses
      ? { schoolId: schoolIdForClasses as Id<"schools"> }
      : "skip"
  )

  // Show loading state if we're in edit mode and don't have child data yet, or if we don't have schools
  // Also wait for classes if we're in edit mode and have a school selected
  const isLoading = 
    (isEditMode && child === undefined) || 
    schools === undefined ||
    (isEditMode && child?.schoolId && classesForSchool === undefined)

  // Track previous school ID to detect actual changes (not initial population)
  const prevSchoolIdRef = React.useRef<string | undefined>(undefined)

  // Reset class when school changes (but not during initial form population)
  React.useEffect(() => {
    // Skip if this is the initial population (when prevSchoolIdRef is undefined)
    if (prevSchoolIdRef.current === undefined) {
      prevSchoolIdRef.current = selectedSchoolId
      return
    }

    // Only reset class if school actually changed and we have both values
    if (selectedSchoolId && selectedClassId && prevSchoolIdRef.current !== selectedSchoolId) {
      console.log("[ChildForm] School changed from", prevSchoolIdRef.current, "to", selectedSchoolId);
      // Check if the selected class belongs to the new school
      const classBelongsToSchool = classesForSchool?.some(
        (c) => c._id === selectedClassId
      )
      if (!classBelongsToSchool) {
        console.log("[ChildForm] Clearing class because it doesn't belong to new school");
        form.setValue("classId", "")
      }
    }
    
    // Update the ref to track the current school
    prevSchoolIdRef.current = selectedSchoolId
  }, [selectedSchoolId, selectedClassId, classesForSchool, form])

  // Track if form has been initialized with child data
  const [formInitialized, setFormInitialized] = React.useState(false)
  
  // Track if we're currently initializing to prevent onValueChange from clearing values
  const isInitializingRef = React.useRef(false)

  // Populate form when child data, schools, and classes are loaded (edit mode)
  React.useEffect(() => {
    if (child && isEditMode && schools && classesForSchool && !formInitialized) {
      console.log("[ChildForm] Populating form with data:", {
        child: {
          firstName: child.firstName,
          lastName: child.lastName,
          schoolId: child.schoolId,
          classId: child.classId,
        },
        schoolsCount: schools.length,
        classesCount: classesForSchool.length,
        schoolOptions: schools.map(s => ({ id: s._id, name: s.name })),
        classOptions: classesForSchool.map(c => ({ id: c._id, name: c.name })),
      });

      // Verify the class belongs to the school
      const classBelongsToSchool = classesForSchool.some(
        (c) => c._id === child.classId
      )
      
      console.log("[ChildForm] Class belongs to school:", classBelongsToSchool);
      
      // Ensure IDs are strings for the form
      const schoolIdStr = String(child.schoolId)
      const classIdStr = classBelongsToSchool ? String(child.classId) : ""
      
      const formValues = {
        firstName: child.firstName,
        lastName: child.lastName,
        schoolId: schoolIdStr,
        classId: classIdStr,
        allergies: child.preferences.allergies,
        breadType: child.preferences.breadType,
        crust: child.preferences.crust,
        butter: child.preferences.butter,
      };
      
      console.log("[ChildForm] Resetting form with values:", formValues);
      // Prepare school options for logging
      const schoolOptionsForLog = schools.map(s => String(s._id));
      
      console.log("[ChildForm] School ID comparison:", {
        childSchoolId: child.schoolId,
        childSchoolIdType: typeof child.schoolId,
        formSchoolId: formValues.schoolId,
        formSchoolIdType: typeof formValues.schoolId,
        schoolIdStr: schoolIdStr,
        schoolOptions: schoolOptionsForLog,
        schoolIdInOptions: schoolOptionsForLog.includes(schoolIdStr),
      });
      
      // Update the ref before resetting to prevent the school change effect from firing
      prevSchoolIdRef.current = schoolIdStr;
      
      // Set flag to prevent onValueChange from clearing values during initialization
      isInitializingRef.current = true;
      
      // Reset form with values (validation will not run automatically on reset)
      form.reset(formValues);
      
      setFormInitialized(true);
      
      // Clear the flag after a short delay to allow Select components to update
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 200);
      
      // Log form state after reset
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log("[ChildForm] Form values after reset:", currentValues);
        console.log("[ChildForm] School field value:", currentValues.schoolId);
        console.log("[ChildForm] Class field value:", currentValues.classId);
      }, 100);
    }
  }, [child, isEditMode, schools, classesForSchool, form, formInitialized])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && childId) {
        await updateChild({
          childId,
          firstName: values.firstName,
          lastName: values.lastName,
          schoolId: values.schoolId as Id<"schools">,
          classId: values.classId as Id<"classes">,
          preferences: {
            allergies: values.allergies,
            breadType: values.breadType,
            crust: values.crust,
            butter: values.butter,
          },
        })
      } else {
        await createChild({
          firstName: values.firstName,
          lastName: values.lastName,
          schoolId: values.schoolId as Id<"schools">,
          classId: values.classId as Id<"classes">,
          preferences: {
            allergies: values.allergies,
            breadType: values.breadType,
            crust: values.crust,
            butter: values.butter,
          },
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/children")
      }
    } catch (error) {
      console.error("Error saving child:", error)
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to save child",
      })
    }
  }

  const schoolOptions = React.useMemo(
    () =>
      schools?.map((school) => ({
        value: String(school._id),
        label: school.name,
      })) || [],
    [schools]
  )

  const classOptions = React.useMemo(
    () =>
      classesForSchool?.map((classItem) => ({
        value: String(classItem._id),
        label: classItem.name,
      })) || [],
    [classesForSchool]
  )
  
  // Log options whenever they change
  React.useEffect(() => {
    console.log("[ChildForm] Options prepared:", {
      schoolOptionsCount: schoolOptions.length,
      classOptionsCount: classOptions.length,
      schoolOptions: schoolOptions.slice(0, 5), // Log first 5
      classOptions: classOptions.slice(0, 5), // Log first 5
      currentSchoolId: form.getValues("schoolId"),
      currentClassId: form.getValues("classId"),
    });
  }, [schoolOptions, classOptions, form]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Child" : "Create New Child"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your child's information"
              : "Add a new child to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isEditMode && child === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Child</CardTitle>
          <CardDescription>Update your child&apos;s information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Child not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Child" : "Create New Child"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update your child's information"
            : "Add a new child to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => {
                console.log("[ChildForm] School field render:", {
                  fieldValue: field.value,
                  fieldValueType: typeof field.value,
                  schoolOptions: schoolOptions,
                  matchingOption: schoolOptions.find(opt => opt.value === field.value),
                });
                return (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        console.log("[ChildForm] School changed to:", value, "isInitializing:", isInitializingRef.current);
                        // Ignore empty values during initialization
                        if (isInitializingRef.current && !value) {
                          console.log("[ChildForm] Ignoring empty school value during initialization");
                          return;
                        }
                        if (value) {
                          field.onChange(value)
                          // Only clear class if we're not in the middle of initializing
                          if (!isInitializingRef.current && (formInitialized || !isEditMode)) {
                            form.setValue("classId", "")
                          }
                        }
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schoolOptions.map((school) => (
                          <SelectItem key={school.value} value={school.value}>
                            {school.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => {
                console.log("[ChildForm] Class field render:", {
                  fieldValue: field.value,
                  fieldValueType: typeof field.value,
                  selectedSchoolId: selectedSchoolId,
                  classOptions: classOptions,
                  matchingOption: classOptions.find(opt => opt.value === field.value),
                });
                return (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        console.log("[ChildForm] Class changed to:", value, "isInitializing:", isInitializingRef.current);
                        // Ignore empty values during initialization
                        if (isInitializingRef.current && !value) {
                          console.log("[ChildForm] Ignoring empty class value during initialization");
                          return;
                        }
                        if (value) {
                          field.onChange(value)
                        }
                      }}
                      value={field.value || undefined}
                      disabled={!selectedSchoolId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classOptions.map((classItem) => (
                          <SelectItem key={classItem.value} value={classItem.value}>
                            {classItem.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any allergies or dietary restrictions..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breadType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bread Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bread type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crust"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Crust</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="butter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Butter</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Child"
                    : "Create Child"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/children")}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

