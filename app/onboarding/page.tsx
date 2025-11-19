"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Please enter a valid phone number",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const phoneInputStyles = [
  "[&_.PhoneInputInput]:flex",
  "[&_.PhoneInputInput]:h-9",
  "[&_.PhoneInputInput]:w-full",
  "[&_.PhoneInputInput]:min-w-0",
  "[&_.PhoneInputInput]:rounded-md",
  "[&_.PhoneInputInput]:border",
  "[&_.PhoneInputInput]:border-input",
  "[&_.PhoneInputInput]:bg-transparent",
  "[&_.PhoneInputInput]:px-3",
  "[&_.PhoneInputInput]:py-1",
  "[&_.PhoneInputInput]:text-base",
  "[&_.PhoneInputInput]:shadow-xs",
  "[&_.PhoneInputInput]:transition-[color,box-shadow]",
  "[&_.PhoneInputInput]:outline-none",
  "[&_.PhoneInputInput]:focus-visible:border-ring",
  "[&_.PhoneInputInput]:focus-visible:ring-ring/50",
  "[&_.PhoneInputInput]:focus-visible:ring-[3px]",
  "[&_.PhoneInputInput]:md:text-sm",
  "[&_.PhoneInputCountry]:mr-2",
].join(" ");

export default function OnboardingPage() {
  const router = useRouter();
  const createUser = useMutation(api.users.createMyUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating user:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to create user",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="BE"
                        value={field.value}
                        onChange={field.onChange}
                        className={phoneInputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting..." : "Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

