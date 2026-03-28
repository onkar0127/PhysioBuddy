import { useState, useEffect, useRef } from "react";
import "./LiveSession.css";

const EXERCISE = { name: "Shoulder Flexion", target: 12, muscle: "Deltoid" };
const DEMO_VIDEO = {
  youtubeId: "2pLT-olgUJs",
  title: "Shoulder Flexion – Proper Form Guide",
  duration: "2:34",
  tag: "Beginner",
  desc: "Learn correct technique to maximise recovery and avoid re-injury.",
};

export default function LiveSession() {
  const [currentRep,    setCurrentRep]    = useState(0);
  const [session,       setSession]       = useState("idle"); // idle|active|paused|complete
  const [camOn,         setCamOn]         = useState(false);
  const [camErr,        setCamErr]        = useState("");
  const [elapsed,       setElapsed]       = useState(0);
  const [repBounce,     setRepBounce]     = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [poseScore,     setPoseScore]     = useState(null);
  const [feedback,      setFeedback]      = useState("Press Start Session to begin");

  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);
  const repRef     = useRef(null);

  const TARGET   = EXERCISE.target;
  const progress = Math.min((currentRep / TARGET) * 100, 100);
  const isDone   = currentRep >= TARGET;
  const CIRC     = 2 * Math.PI * 54;

  /* timer */
  useEffect(() => {
    if (session === "active") {
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [session]);

  /* simulated rep detection */
  useEffect(() => {
    if (session === "active" && camOn && !isDone) {
      repRef.current = setInterval(() => {
        setCurrentRep(r => {
          const n = r + 1;
          setRepBounce(true);
          setTimeout(() => setRepBounce(false), 550);
          setPoseScore(Math.floor(Math.random() * 14) + 86);
          const tips = ["Great form! 💪","Perfect alignment ✓","Excellent range of motion!","Stay controlled on return.","Outstanding technique!"];
          setFeedback(tips[Math.floor(Math.random() * tips.length)]);
          if (n >= TARGET) { setSession("complete"); clearInterval(repRef.current); setFeedback("🎉 Exercise complete! Great work!"); }
          return n;
        });
      }, 2800);
    }
    return () => clearInterval(repRef.current);
  }, [session, camOn, isDone, TARGET]);

  /* camera */
  const startCam = async () => {
    setCamErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720}, facingMode:"user" }, audio:false });
      streamRef.current = s;
      setCamOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(()=>{}); }
      });
    } catch(e) {
      setCamErr(e.name === "NotAllowedError" ? "Camera permission denied." : e.name === "NotFoundError" ? "No camera found." : "Camera unavailable.");
      setCamOn(false);
    }
  };
  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  };

  const handleStart = async () => {
    setCurrentRep(0); setElapsed(0); setPoseScore(null);
    setFeedback("Session active — begin your exercise!");
    await startCam();
    setSession("active");
  };
  const handlePause = () => {
    const n = session === "paused" ? "active" : "paused";
    setSession(n);
    setFeedback(n === "active" ? "Session resumed!" : "Session paused.");
  };
  const handleStop = () => {
    stopCam(); setSession("idle"); setCurrentRep(0); setElapsed(0); setPoseScore(null);
    setFeedback("Press Start Session to begin");
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="pb-app">
      {/* glow orbs */}
      <div className="pb-orbs" aria-hidden="true">
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      </div>

      {/* ── HEADER ── */}
      <header className="pb-header">
        <div className="pb-logo">
          <svg className="pb-logo-svg" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="url(#lg)" strokeWidth="2"/>
            <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="20" r="3" fill="url(#lg)"/>
            <defs>
              <linearGradient id="lg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f5c4"/><stop offset="1" stopColor="#2979ff"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <span className="pb-brand">PhysioBuddy</span>
            <span className="pb-brand-sub">AI Rehab Assistant</span>
          </div>
        </div>

        <div className={`pb-badge ${session==="active"?"on":session==="complete"?"done":""}`}>
          <span className="pb-badge-dot"/>
          {session==="active"?"● LIVE SESSION":session==="complete"?"✓ COMPLETED":"STANDBY"}
        </div>

        <div className="pb-hdr-end">
          <div className="pb-pill">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {fmt(elapsed)}
          </div>
          <div className="pb-pill">
            <div className="pb-av">JD</div>
            John Doe
          </div>
        </div>
      </header>

      {/* ── BODY: fixed two-column ── */}
      <div className="pb-body">

        {/* ════ LEFT — Camera ════ */}
        <div className="pb-left">
          <div className="pb-cam-card">

            {/* cam header */}
            <div className="pb-cam-hdr">
              <span className="pb-cam-hdr-label">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="1" y="5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 8l5-2.5v7L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Bicep Curl
              </span>
              {camOn && (
                <button className="pb-stop-cam" onClick={stopCam}>
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                    <path d="M3 3l14 14M8 5h7a2 2 0 012 2v6M4 8v7a2 2 0 002 2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Stop
                </button>
              )}
            </div>

            {/* viewport */}
            <div className="pb-viewport">
              <video ref={videoRef} autoPlay playsInline muted className={`pb-video${camOn?" show":""}`}/>

              {/* AR overlay when cam on */}
              {camOn && (
                <div className="pb-ar" aria-hidden="true">
                  <div className="pb-scanline"/>
                  <span className="c tl"/><span className="c tr"/>
                  <span className="c bl"/><span className="c br"/>
                  {session==="active" && (
                    <div className="pb-detecting"><span className="pb-pulse"/>detecting pose…</div>
                  )}
                  {poseScore && (
                    <div className="pb-pscore" style={{"--sc": poseScore>=90?"#00f5c4":poseScore>=75?"#ffc400":"#ff5252"}}>
                      Pose&nbsp;<strong>{poseScore}</strong>/100
                    </div>
                  )}
                </div>
              )}

              {/* placeholder when cam off */}
              {!camOn && (
                <div className="pb-placeholder">
                  {camErr ? (
                    <>
                      <div className="pb-ph-icon err">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5252" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="pb-ph-t">Camera Error</p>
                      <p className="pb-ph-s">{camErr}</p>
                      <button className="pb-en-btn" onClick={startCam}>Retry Camera</button>
                    </>
                  ) : (
                    <>
                      <div className="pb-ph-icon">
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                          <rect x="2" y="12" width="28" height="24" rx="4" stroke="url(#phg)" strokeWidth="2"/>
                          <path d="M30 19l12-6v22l-12-6" stroke="url(#phg)" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="16" cy="24" r="5" stroke="url(#phg)" strokeWidth="2"/>
                          <defs>
                            <linearGradient id="phg" x1="2" y1="12" x2="42" y2="36" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#00f5c4"/><stop offset="1" stopColor="#2979ff"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <p className="pb-ph-t">Camera Inactive</p>
                      <p className="pb-ph-s">Press <strong>Start Session</strong> to enable live AI pose detection</p>
                      <button className="pb-en-btn" onClick={startCam}>Enable Camera</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* feedback bar */}
            <div className={`pb-fb${session==="active"?" live":""}`}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {feedback}
            </div>

            {/* session controls */}
            <div className="pb-controls">
              {session==="idle"||session==="complete" ? (
                <button className="pb-btn pb-start" onClick={handleStart}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  {session==="complete"?"Restart Session":"Start Session"}
                </button>
              ) : (
                <>
                  <button className="pb-btn pb-pause" onClick={handlePause}>
                    {session==="paused"
                      ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Resume</>
                      : <><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pause</>
                    }
                  </button>
                  <button className="pb-btn pb-stop" onClick={handleStop}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                    End Session
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ════ RIGHT — Rep tracker + Demo Video ════ */}
        <div className="pb-right">

          {/* Rep Tracker */}
          <div className="pb-rep-card">
            <div className="pb-section-label">Repetition Tracker</div>

            {/* ring */}
            <div className="pb-ring-wrap">
              <svg className="pb-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9"/>
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={isDone?"#00f5c4":"url(#rg)"}
                  strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC-(progress/100)*CIRC}
                  transform="rotate(-90 60 60)"
                  style={{transition:"stroke-dashoffset 0.4s cubic-bezier(.4,0,.2,1)"}}
                />
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00f5c4"/><stop offset="1" stopColor="#2979ff"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="pb-ring-inner">
                <span className={`pb-rn${repBounce?" pop":""}`}>{currentRep}</span>
                <span className="pb-rof">of {TARGET}</span>
                <span className="pb-rlbl">REPS</span>
              </div>
            </div>

            {/* current / target boxes */}
            <div className="pb-ct">
              <div className="pb-ct-item">
                <span className="pb-ct-num current">{currentRep}</span>
                <span className="pb-ct-lbl">Current</span>
              </div>
              <div className="pb-ct-sep"/>
              <div className="pb-ct-item">
                <span className="pb-ct-num target">{TARGET}</span>
                <span className="pb-ct-lbl">Target</span>
              </div>
            </div>

            {/* progress bar */}
            <div className="pb-bar">
              <div className={`pb-bar-fill${isDone?" done":""}`} style={{width:`${progress}%`}}/>
            </div>
            <div className="pb-bar-meta">
              <span>{Math.round(progress)}% complete</span>
              <span>{Math.max(TARGET-currentRep,0)} remaining</span>
            </div>

            {isDone && (
              <div className="pb-complete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#00f5c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Exercise Complete! 🎉
              </div>
            )}
          </div>

          {/* Demo Video */}
          <div className="pb-video-card">
            <div className="pb-section-label">
              <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 7.5l6 3.5-6 3.5V7.5z" fill="currentColor"/>
              </svg>
              Watch Demo Before You Start
            </div>

            <div className="pb-vthumb" onClick={() => setShowModal(true)} role="button" tabIndex={0}
              onKeyDown={e=>e.key==="Enter"&&setShowModal(true)}>
              <img
                src={`https://img.youtube.com/vi/${DEMO_VIDEO.youtubeId}/hqdefault.jpg`}
                alt={DEMO_VIDEO.title}
                className="pb-vimg"
              />
              <div className="pb-vov">
                <div className="pb-vplay">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <span className="pb-vtag">{DEMO_VIDEO.tag}</span>
              <span className="pb-vdur">{DEMO_VIDEO.duration}</span>
            </div>

            <div className="pb-vinfo">
              <p className="pb-vtitle">{DEMO_VIDEO.title}</p>
              <p className="pb-vdesc">{DEMO_VIDEO.desc}</p>
              <button className="pb-vwatch" onClick={() => setShowModal(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch Demo
              </button>
            </div>
          </div>

        </div>{/* /right */}
      </div>{/* /body */}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="pb-modal-bg" onClick={()=>setShowModal(false)}>
          <div className="pb-modal" onClick={e=>e.stopPropagation()}>
            <div className="pb-modal-hdr">
              <span>{DEMO_VIDEO.title}</span>
              <button className="pb-modal-x" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="pb-modal-body">
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEO.youtubeId}?autoplay=1&rel=0`}
                title={DEMO_VIDEO.title} className="pb-yt"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
