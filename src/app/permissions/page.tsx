"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useSpring, animated } from "react-spring"; // Animation library

export default function Permissions() {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [hasSpeaker, setHasSpeaker] = useState(false);
  const [hasScreenShare, setHasScreenShare] = useState(false); // Track screen share permission
  const [permissionProgress, setPermissionProgress] = useState(0);
  const router = useRouter();

  // Animation for permission progress
  const progressAnimation = useSpring({
    width: `${permissionProgress}%`,
    config: { tension: 200, friction: 15 },
  });

  // Check Permissions for Camera, Microphone, and Speaker
  const checkPermissions = async () => {
    setPermissionProgress(33); // Camera progress
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
      setPermissionProgress(66); // Microphone progress
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophone(true);
      setPermissionProgress(85); // Speaker progress
      setHasSpeaker(true);
    } catch (err) {
      alert("Please allow camera and microphone permissions.");
    }
  };

  // Request screen sharing permission (entire screen only)
  const startScreenShare = async () => {
    try {
      // Request the user to share only the entire screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // This restricts the user to share the entire screen only
        },
      });
      setHasScreenShare(true);
      
      // Optionally, you can display the shared screen in a video element
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.play();

      // Optionally, stop screen sharing when the user navigates away
      stream.getTracks().forEach(track => track.onended = () => setHasScreenShare(false));
    } catch (err) {
      alert("Screen sharing permission denied or invalid.");
    }
  };

  useEffect(() => {
    if (hasCamera && hasMicrophone && hasSpeaker && hasScreenShare) {
      setTimeout(() => router.push("/question"), 1000); // Go to question page after all permissions
    }
  }, [hasCamera, hasMicrophone, hasSpeaker, hasScreenShare, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Permissions</h2>
        <p className="mb-4">We need to access your camera, microphone, speaker, and screen sharing.</p>
        <animated.div style={progressAnimation}>
          <Progress value={permissionProgress} className="mb-4" />
        </animated.div>
        <Button
          onClick={checkPermissions}
          className="bg-blue-500 text-white w-full mt-4"
        >
          Start Permission Check
        </Button>
        <Button
          onClick={startScreenShare}
          className="bg-yellow-500 text-white w-full mt-4"
        >
          Start Screen Share
        </Button>
        <div className="mt-4 text-center">
          {hasCamera && <p>📷 Camera detected!</p>}
          {hasMicrophone && <p>🎤 Microphone detected!</p>}
          {hasSpeaker && <p>🔊 Speaker detected!</p>}
          {hasScreenShare && <p>🖥️ Screen sharing enabled!</p>}
        </div>
      </Card>
    </div>
  );
}
