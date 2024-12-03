"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react"; // Get session for email
import { useSpring, animated } from "react-spring"; // For the timer animation
import { Router } from "next/router";
import { useRouter } from "next/navigation";


export default function Recording() {

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null); // Store the media Blob
  const [isUploading, setIsUploading] = useState(false); // Flag to handle upload state
  const [isError, setIsError] = useState(false); // Handle errors
  const [timer, setTimer] = useState(60); // Timer state for countdown
  const { data: session } = useSession(); // Get session data (email ID)

  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let stream: MediaStream | null = null; // Store the media stream to stop tracks later
  let timerInterval: NodeJS.Timeout | null = null; // Store the interval ID for the timer

  // Start recording
  const startRecording = async () => {
    if (!session?.user?.email) {
      alert("User is not authenticated.");
      return;
    }

    try {
      // Request access to camera and microphone
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current!.srcObject = stream;
      videoRef.current!.play();

      // Mute the user's own audio
      const audioTracks = stream.getAudioTracks();
      if (audioTracks[0]) {
        audioTracks[0].enabled = false; // Mute the microphone
      }

      // Create a MediaRecorder instance
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data); // Collect the recorded chunks
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setMediaBlob(blob); // Set the captured media as Blob
        chunks = []; // Clear the chunks array after stopping
      };

      mediaRecorder.start();
      setIsRecording(true); // Set state to recording

      // Start a 60-second timer
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            stopRecording(); // Stop recording when the timer reaches 0
            clearInterval(timerInterval!); // Clear the interval
          }
          return prev - 1;
        });
      }, 1000); // Update the timer every second
    } catch (error) {
      alert("Error accessing media devices.");
    }
  };

  // Stop recording (manual or auto stop)
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop(); // Stop the recording
      setIsRecording(false); // Update state to stop recording
    }

    if (stream) {
      // Stop all media tracks (video and audio) to release resources
      stream.getTracks().forEach(track => track.stop());
    }

    if (timerInterval) {
      clearInterval(timerInterval); // Clear the timer if stopped manually
    }
  };

  // Upload the recorded media to the backend
  const uploadRecording = async () => {
    if (!mediaBlob || !session?.user?.email) {
      alert("No media recorded to upload.");
      return;
    }

    setIsUploading(true);

    // Create a form data object to send the video file to the server
    const formData = new FormData();
    const fileName = `recording-${session.user.email}.webm`; // Save file under session email
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
      setIsError(true); // Set error state
    } finally {
      setIsUploading(false);
    }
  };

  // Animation for the timer
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
      ) : (<>
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
