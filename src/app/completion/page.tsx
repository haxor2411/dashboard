"use client";

import { useRouter } from "next/navigation";

export default function Completion() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Test Completed!</h1>
      <p className="mt-4">Thank you for completing the test.</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        onClick={() => router.push("/")}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
