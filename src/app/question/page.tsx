"use client";

import ReactPlayer from "react-player";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Question() {
  const router = useRouter();
  const questionAudioUrl = "/sample-question.mp3"; // URL of your question audio

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Question</h2>
        <p className="mb-4">Listen to the following question and record your answer.</p>
        <ReactPlayer url={questionAudioUrl} controls playing />
        <Button
          onClick={() => router.push("/recording")}
          className="bg-blue-500 text-white w-full mt-4"
        >
          Start Recording
        </Button>
      </div>
    </div>
  );
}
