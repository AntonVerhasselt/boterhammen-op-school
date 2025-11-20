import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user to check admin status
  const user = await currentUser();

  // Check if user is admin
  // Treat missing metadata as non-admin
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  // Redirect to home if not admin
  if (!isAdmin) {
    redirect("/");
  }

  // Render children if admin check passes
  return <>{children}</>;
}

