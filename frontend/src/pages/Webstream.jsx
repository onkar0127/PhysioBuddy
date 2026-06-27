// import React, { useEffect, useRef, useState } from "react";

// // Helper function to get CSRF token for Django
// function getCookie(name) {
//   const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//   return match ? decodeURIComponent(match[2]) : '';
// }

// export default function WebcamStream() {
//   const searchParams = new URLSearchParams(window.location.search);
//   const exercise_id = searchParams.get("exercise_id");
//   const assignment_id = searchParams.get("assignment_id");
//   const target_reps = searchParams.get("reps");
//   const exercise_name = searchParams.get("name") || "Exercise";
//   const patient_name = searchParams.get("patient_name") || "Patient"; 

//   const videoRef = useRef(null);
//   const wsRef = useRef(null);
//   const poseRef = useRef(null);
  
//   const [connected, setConnected] = useState(false);
//   const [repCount, setRepCount] = useState(0);
//   const [cameraError, setCameraError] = useState(null);

//   // Initialize MediaPipe Pose locally
//   useEffect(() => {
//     if (typeof window.Pose !== "undefined") {
//       const poseInstance = new window.Pose({
//         locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
//       });
      
//       poseInstance.setOptions({
//         modelComplexity: 1,
//         smoothLandmarks: true,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5
//       });
      
//       poseInstance.onResults((results) => {
//         const video = videoRef.current;
//         if (!video) return;

//         // Send landmarks to the backend for exercise detection while the visible
//         // stream remains the raw webcam feed for a more real-time display.
//         if (results.poseLandmarks) {
//           if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({
//               landmarks: results.poseLandmarks,
//               width: 640,
//               height: 360,
//               exercise_id: parseInt(exercise_id, 10),
//               target: parseInt(target_reps, 10)
//             }));
//           }
//         }
//       });
      
//       poseRef.current = poseInstance;
//     }

//     return () => {
//       if (poseRef.current) {
//         poseRef.current.close();
//       }
//     };
//   }, [exercise_id, target_reps]);

//   useEffect(() => {
//     // 1. STRICT REDIRECTION: Native JavaScript redirect if no ID or REPS
//     if (!exercise_id || !target_reps) {
//       window.location.href = "/";
//       return;
//     }

//     // 2. Start Camera
//     const startCamera = async () => {
//       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//         setCameraError("Your browser does not support webcam access or requires HTTPS.");
//         return;
//       }

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ 
//           video: { facingMode: "user", width: 640, height: 360 }, 
//           audio: false 
//         });
        
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.play().catch(e => console.error("Error playing video:", e));
//         }
        
//         startWebSocket();
//       } catch (err) {
//         console.error("Camera access denied or error:", err);
//         setCameraError("Camera access denied. Please allow camera permissions in your browser.");
//       }
//     };

//     startCamera();

//     // 3. Cleanup function when user leaves the page
//     return () => {
//       if (wsRef.current) wsRef.current.close();
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [exercise_id, target_reps]);

//   function startWebSocket() {
//     const ws = new WebSocket("ws://localhost:8000/ws/exercise/");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setConnected(true);
//       startSendingFrames();
//     };
    
//     ws.onclose = () => setConnected(false);
//     ws.onerror = (e) => console.error("WS error", e);

//     ws.onmessage = (evt) => {
//       const data = JSON.parse(evt.data);
//       if (typeof data.reps === "number") {
//         setRepCount(data.reps);
//       }
//     };
//   }

//   function startSendingFrames() {
//     const FPS = 10;
//     const send = async () => {
//       if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      
//       const video = videoRef.current;
//       if (video && video.readyState >= 2 && poseRef.current) {
//         try {
//           await poseRef.current.send({ image: video });
//         } catch (err) {
//           console.error("MediaPipe frame send error:", err);
//         }
//       }
      
//       setTimeout(send, 1000 / FPS);
//     };
//     send();
//   }

//   // --- API Submission & Redirection ---
//   const handleDone = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/update-completion/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRFToken": getCookie("csrftoken"),
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           assignment_id: parseInt(assignment_id, 10),
//           patient_name: patient_name
//         }),
//       });

//       if (response.ok) {
//         window.location.href = "http://127.0.0.1:5173/exercise-list";
//       } else {
//         console.error("Failed to update status on the server.");
//         alert("Something went wrong saving your progress. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error updating completion:", error);
//     }
//   };

//   // Prevent rendering if we are about to redirect
//   if (!exercise_id || !target_reps) return null;

//   return (
//     <div style={{ display: "grid", gap: 16, maxWidth: 1000, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      
//       {/* Header UI */}
//       <div style={{ padding: "20px", backgroundColor: "#ecfeff", borderRadius: "16px", border: "1px solid #cffafe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <div>
//           <h2 style={{ margin: 0, fontSize: "28px", color: "#164e63", fontWeight: "800", letterSpacing: "-0.5px" }}>
//             {exercise_name}
//           </h2>
//           <p style={{ margin: "6px 0 0", color: "#0e7490", fontWeight: "600", fontSize: "15px" }}>
//             Target Goal: {target_reps} Repetitions
//           </p>
//         </div>
//         <div style={{ padding: "8px 16px", borderRadius: "99px", backgroundColor: connected ? "#d1fae5" : "#fee2e2", color: connected ? "#065f46" : "#991b1b", fontWeight: 700, fontSize: "14px", border: `1px solid ${connected ? '#a7f3d0' : '#fecaca'}` }}>
//           {connected ? "● Live Tracking" : "○ Disconnected"}
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
        
//         {/* Video feed */}
//         <div style={{ flex: 1, borderRadius: "16px", overflow: "hidden", backgroundColor: "#000", border: "4px solid #f1f5f9", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", position: "relative" }}>
          
//           {cameraError && (
//             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fca5a5", textAlign: "center", padding: "20px" }}>
//               <svg style={{ width: "48px", height: "48px", margin: "0 auto 12px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//               <div style={{ fontWeight: "bold" }}>{cameraError}</div>
//             </div>
//           )}

//           <video 
//             ref={videoRef} 
//             autoPlay
//             muted 
//             playsInline 
//             style={{ 
//               width: "100%", 
//               height: "100%", 
//               objectFit: "cover", 
//               transform: "scaleX(-1)",
//               display: cameraError ? "none" : "block" 
//             }} 
//           />
//         </div>
        
//         {/* Counter display */}
//         <div style={{ minWidth: "220px", padding: "32px 24px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "2px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
//           <div style={{ fontSize: "14px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
//             Current Reps
//           </div>
//           <div style={{ fontSize: "72px", lineHeight: "1", fontWeight: "900", color: "#0891b2" }}>
//             {repCount}
//           </div>
//           <div style={{ width: "40px", height: "4px", backgroundColor: "#cbd5e1", margin: "16px 0", borderRadius: "2px" }} />
//           <div style={{ fontSize: "24px", color: "#94a3b8", fontWeight: "800" }}>
//             Target: {target_reps}
//           </div>
          
//           {repCount >= parseInt(target_reps, 10) && (
//             <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#10b981", color: "white", borderRadius: "12px", textAlign: "center", animation: "pulse 2s infinite" }}>
//               <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px" }}>
//                 Goal Reached! 🎉
//               </div>
              
//               <button 
//                 onClick={handleDone}
//                 style={{
//                   backgroundColor: "white",
//                   color: "#10b981",
//                   border: "none",
//                   padding: "8px 24px",
//                   borderRadius: "99px",
//                   fontWeight: "bold",
//                   fontSize: "14px",
//                   cursor: "pointer",
//                   boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
//                 }}
//               >
//                 Done
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useRef, useState } from "react";

// Helper function to get CSRF token for Django
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

export default function WebcamStream() {
  const searchParams = new URLSearchParams(window.location.search);
  const exercise_id = searchParams.get("exercise_id");
  const assignment_id = searchParams.get("assignment_id");
  const target_reps = searchParams.get("reps");
  const exercise_name = searchParams.get("name") || "Exercise";
  const patient_name = searchParams.get("patient_name") || "Patient"; 

  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const poseRef = useRef(null);
  
  const [connected, setConnected] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const [feedback, setFeedback] = useState(null); // Added feedback state

  // Initialize MediaPipe Pose locally
  useEffect(() => {
    if (typeof window.Pose !== "undefined") {
      const poseInstance = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      
      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      poseInstance.onResults((results) => {
        const video = videoRef.current;
        if (!video) return;

        // Send landmarks to the backend for exercise detection while the visible
        // stream remains the raw webcam feed for a more real-time display.
        if (results.poseLandmarks) {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              landmarks: results.poseLandmarks,
              width: 640,
              height: 360,
              exercise_id: parseInt(exercise_id, 10),
              target: parseInt(target_reps, 10)
            }));
          }
        }
      });
      
      poseRef.current = poseInstance;
    }

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [exercise_id, target_reps]);

  useEffect(() => {
    // 1. STRICT REDIRECTION: Native JavaScript redirect if no ID or REPS
    if (!exercise_id || !target_reps) {
      window.location.href = "/";
      return;
    }

    // 2. Start Camera
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser does not support webcam access or requires HTTPS.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 640, height: 360 }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
        
        startWebSocket();
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setCameraError("Camera access denied. Please allow camera permissions in your browser.");
      }
    };

    startCamera();

    // 3. Cleanup function when user leaves the page
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [exercise_id, target_reps]);

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
      if (typeof data.reps === "number") {
        setRepCount(data.reps);
      }
      // Added logic to handle incoming feedback from the backend
      if (data.feedback) {
        setFeedback(data.feedback);
      } else {
        setFeedback(null); // Clear the message if they correct their posture
      }
    };
  }

  function startSendingFrames() {
    const FPS = 10;
    const send = async () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      
      const video = videoRef.current;
      if (video && video.readyState >= 2 && poseRef.current) {
        try {
          await poseRef.current.send({ image: video });
        } catch (err) {
          console.error("MediaPipe frame send error:", err);
        }
      }
      
      setTimeout(send, 1000 / FPS);
    };
    send();
  }

  // --- API Submission & Redirection ---
  const handleDone = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/update-completion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({
          assignment_id: parseInt(assignment_id, 10),
          patient_name: patient_name
        }),
      });

      if (response.ok) {
        window.location.href = "http://127.0.0.1:5173/exercise-list";
      } else {
        console.error("Failed to update status on the server.");
        alert("Something went wrong saving your progress. Please try again.");
      }
    } catch (error) {
      console.error("Error updating completion:", error);
    }
  };

  // Prevent rendering if we are about to redirect
  if (!exercise_id || !target_reps) return null;

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 1000, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      
      {/* Header UI */}
      <div style={{ padding: "20px", backgroundColor: "#ecfeff", borderRadius: "16px", border: "1px solid #cffafe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#164e63", fontWeight: "800", letterSpacing: "-0.5px" }}>
            {exercise_name}
          </h2>
          <p style={{ margin: "6px 0 0", color: "#0e7490", fontWeight: "600", fontSize: "15px" }}>
            Target Goal: {target_reps} Repetitions
          </p>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: "99px", backgroundColor: connected ? "#d1fae5" : "#fee2e2", color: connected ? "#065f46" : "#991b1b", fontWeight: 700, fontSize: "14px", border: `1px solid ${connected ? '#a7f3d0' : '#fecaca'}` }}>
          {connected ? "● Live Tracking" : "○ Disconnected"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
        
        {/* Video feed */}
        <div style={{ flex: 1, borderRadius: "16px", overflow: "hidden", backgroundColor: "#000", border: "4px solid #f1f5f9", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", position: "relative" }}>
          
          {/* Feedback UI Displayed over the video */}
          {feedback && (
            <div style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(239, 68, 68, 0.9)", // Red color
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "18px",
              zIndex: 10,
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              animation: "pulse 2s infinite"
            }}>
              ⚠️ {feedback}
            </div>
          )}

          {cameraError && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fca5a5", textAlign: "center", padding: "20px" }}>
              <svg style={{ width: "48px", height: "48px", margin: "0 auto 12px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div style={{ fontWeight: "bold" }}>{cameraError}</div>
            </div>
          )}

          <video 
            ref={videoRef} 
            autoPlay
            muted 
            playsInline 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              transform: "scaleX(-1)",
              display: cameraError ? "none" : "block" 
            }} 
          />
        </div>
        
        {/* Counter display */}
        <div style={{ minWidth: "220px", padding: "32px 24px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "2px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Current Reps
          </div>
          <div style={{ fontSize: "72px", lineHeight: "1", fontWeight: "900", color: "#0891b2" }}>
            {repCount}
          </div>
          <div style={{ width: "40px", height: "4px", backgroundColor: "#cbd5e1", margin: "16px 0", borderRadius: "2px" }} />
          <div style={{ fontSize: "24px", color: "#94a3b8", fontWeight: "800" }}>
            Target: {target_reps}
          </div>
          
          {repCount >= parseInt(target_reps, 10) && (
            <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#10b981", color: "white", borderRadius: "12px", textAlign: "center", animation: "pulse 2s infinite" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px" }}>
                Goal Reached! 🎉
              </div>
              
              <button 
                onClick={handleDone}
                style={{
                  backgroundColor: "white",
                  color: "#10b981",
                  border: "none",
                  padding: "8px 24px",
                  borderRadius: "99px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}