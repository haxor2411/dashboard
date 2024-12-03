"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Importing useRouter for navigation
import { useEffect } from "react"; // Import useEffect

export default function HomePage() {
  const { data: session } = useSession();  // Access session data
  const router = useRouter();  // Initialize router for navigation

  // UseEffect to handle redirection after component has rendered
  useEffect(() => {
    if (session) {
      // Redirect to Instructions page after login
      router.push("/instructions");
    }
  }, [session, router]); // Run the effect when session changes

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!session ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2">Access your account with Google</p>
          <Button onClick={() => signIn("google")} className="mt-4">
            Sign In with Google
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
          <p className="mt-2">Email: {session.user?.email}</p>
          <Button onClick={() => signOut()} className="mt-4">
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}
