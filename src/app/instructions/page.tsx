"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Instructions() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        <p className="mb-4">
          Please read the following instructions carefully before proceeding with the exam.
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>Make sure your camera and microphone are enabled.</li>
          <li>You will be given a question with audio, and you need to record your answer.</li>
          <li>You have 30 minutes to complete the exam.</li>
        </ul>
        <Button
          onClick={() => router.push("/permissions")}
          className="bg-blue-500 text-white w-full"
        >
          Proceed to Permissions
        </Button>
      </Card>
    </div>
  );
}
