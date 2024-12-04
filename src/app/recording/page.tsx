"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { useSpring, animated } from "react-spring";
import { useRouter } from "next/navigation";

export default function Recording() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // Use useRef for mediaRecorder
  const streamRef = useRef<MediaStream | null>(null); // Use useRef for media stream
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Use useRef for the timer
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [timer, setTimer] = useState(60);
  const { data: session } = useSession();

  const startRecording = async () => {
    if (!session?.user?.email) {
      alert("User is not authenticated.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
      videoRef.current!.play();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setMediaBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            stopRecording(); // Stop recording when timer ends
            clearInterval(timerRef.current!);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert("Error accessing media devices.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const uploadRecording = async () => {
    if (!mediaBlob || !session?.user?.email) {
      alert("No media recorded to upload.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    const fileName = `recording-${session.user.email}.webm`;
    formData.append("video", mediaBlob, fileName);

    try {
      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video.");
      }

      alert("Upload successful!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const timerAnimation = useSpring({
    width: `${(timer / 60) * 100}%`,
    config: { tension: 200, friction: 15 },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Recording Your Answer</h2>
      <video ref={videoRef} className="border mb-4" autoPlay />
      {!isRecording ? (
        <Button onClick={startRecording} className="bg-green-500 text-white w-full mt-4">
          Start Recording
        </Button>
      ) : (
        <>
          <Button onClick={stopRecording} className="bg-red-500 text-white w-full mt-4">
            Stop Recording
          </Button>
          <Button onClick={() => router.push("/completion")} className="bg-red-500 text-white w-full mt-4">
            Submit
          </Button>
        </>
      )}
      <div className="w-full max-w-lg mt-4">
        <Card className="p-4">
          <p className="text-center">Time Remaining: {timer} seconds</p>
          <animated.div style={timerAnimation}>
            <Progress value={(timer / 60) * 100} className="mb-4" />
          </animated.div>
        </Card>
      </div>
      {mediaBlob && !isUploading && !isError && (
        <Button onClick={uploadRecording} className="bg-blue-500 text-white w-full mt-4">
          Upload Recording
        </Button>
      )}
      {isUploading && <p className="mt-4">Uploading...</p>}
      {isError && <p className="mt-4 text-red-500">Error uploading the video. Please try again.</p>}
    </div>
  );
}
