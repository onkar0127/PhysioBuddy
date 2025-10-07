// WebcamStream.jsx
import React, { useEffect, useRef, useState } from "react";

export default function WebcamStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [repCount, setRepCount] = useState(0);
  // const [processedSrc, setProcessedSrc] = useState(null);

  useEffect(() => {
    // 1) Get camera
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 360 }, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      startWebSocket();
    })();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  function startWebSocket() {
    const ws = new WebSocket("ws://localhost:8000/ws/exercise/");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      startSendingFrames();
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = (e) => console.error("WS error", e);

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      // if (data.frame) setProcessedSrc(`data:image/jpeg;base64,${data.frame}`);
      if (typeof data.reps === "number") setRepCount(data.reps);
    };
  }

  // Throttle sending (e.g., ~10 FPS)
  function startSendingFrames() {
    const FPS = 10;
    const send = () => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const targetW = 640, targetH = 360;
      canvas.width = targetW; canvas.height = targetH;
      ctx.drawImage(video, 0, 0, targetW, targetH);

      // JPEG for smaller payload
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = dataUrl.split(",")[1];

      wsRef.current.send(JSON.stringify({ frame: base64, exercise_id: 3 }));
      setTimeout(send, 1000 / FPS);
    };
    send();
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
      <div style={{ fontWeight: 600 }}>WebSocket: {connected ? "Connected" : "Disconnected"}</div>
      <div style={{ display: "flex", gap: 12 }}>
        <div>
          <div>Local webcam</div>
          <video ref={videoRef} muted playsInline style={{ width: 320, height: 180, background: "#000", transform: "scaleX(-1)" }} />
        </div>
        <div>
          <div style={{ marginTop: 8 }}>Repetitions: {repCount}</div>
        </div>
      </div>
      {/* Hidden canvas for encoding frames */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
