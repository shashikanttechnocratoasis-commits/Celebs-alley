"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Sun, 
  Eye, 
  Smile, 
  ShieldCheck, 
  Sliders, 
  Zap, 
  Check, 
  FlipHorizontal,
  Info
} from "lucide-react";
import { FaceScanGraphic } from "@/components/shared/FaceScanGraphic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { useAppStore } from "@/store";
import { generateScan } from "@/lib/scanEngine";
import { toast } from "@/components/ui/Toast";

type Pose = "front" | "left" | "right";
type ScanState = "intro" | "capturing" | "preview" | "processing";

interface QualityChecks {
  lighting: "checking" | "good" | "too_dark" | "too_bright";
  sharpness: "checking" | "sharp" | "blurry";
  position: "checking" | "centered" | "adjust";
  angle: "checking" | "good" | "adjust";
}

// Inline SVG sample faces generator for 100% offline sample demo mode
function createSampleFaceSvg(pose: Pose): string {
  const rotation = pose === "left" ? "scaleX(-1) rotate(-8deg)" : pose === "right" ? "rotate(8deg)" : "none";
  const poseLabel = pose.toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1F1710" />
          <stop offset="100%" stop-color="#0B0907" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E5A93C" />
          <stop offset="100%" stop-color="#996515" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      <g transform="${rotation}" transform-origin="200 240">
        <!-- Face Silhouette -->
        <ellipse cx="200" cy="210" rx="90" ry="120" fill="#2A1E14" stroke="url(#goldGrad)" stroke-width="2" />
        <!-- Eyes -->
        <ellipse cx="165" cy="190" rx="14" ry="7" fill="#E5A93C" opacity="0.8" />
        <ellipse cx="235" cy="190" rx="14" ry="7" fill="#E5A93C" opacity="0.8" />
        <circle cx="165" cy="190" r="4" fill="#0B0907" />
        <circle cx="235" cy="190" r="4" fill="#0B0907" />
        <!-- Brows -->
        <path d="M 145 175 Q 165 168 185 175" stroke="#D4AF37" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 215 175 Q 235 168 255 175" stroke="#D4AF37" stroke-width="3" fill="none" stroke-linecap="round" />
        <!-- Nose Bridge -->
        <path d="M 200 190 L 200 230 L 192 235 L 208 235" stroke="#E5A93C" stroke-width="2" fill="none" stroke-linecap="round" />
        <!-- Lips -->
        <path d="M 175 265 Q 200 275 225 265 Q 200 285 175 265" fill="#C5832B" opacity="0.85" />
        <!-- Mesh Overlay -->
        <polygon points="200,100 165,150 235,150" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="165,150 165,190 200,190" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="235,150 200,190 235,190" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="165,190 200,230 200,190" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="235,190 200,190 200,230" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="165,190 150,230 200,230" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
        <polygon points="235,190 200,230 250,230" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.5" />
      </g>
      <!-- HUD label -->
      <rect x="20" y="20" width="120" height="26" rx="4" fill="rgba(212,175,55,0.15)" stroke="#D4AF37" stroke-width="1" />
      <text x="80" y="37" fill="#E5A93C" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">CELEBS 3D • ${poseLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate a low-res thumbnail (< 160px) for store persistence
function createThumbnail(imageSource: string | HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, callback: (thumb: string) => void) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      callback(typeof imageSource === "string" ? imageSource : "");
      return;
    }

    if (typeof imageSource === "string") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 160, 192);
        callback(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = () => callback(imageSource);
      img.src = imageSource;
    } else {
      ctx.drawImage(imageSource, 0, 0, 160, 192);
      callback(canvas.toDataURL("image/jpeg", 0.6));
    }
  } catch (err) {
    console.error("Thumbnail error:", err);
    callback(typeof imageSource === "string" ? imageSource : "");
  }
}

export default function FaceScanPage() {
  const router = useRouter();
  const { parameters, customerProfile, addScan } = useAppStore();

  const [scanState, setScanState] = useState<ScanState>("intro");
  const [currentPose, setCurrentPose] = useState<Pose>("front");
  const [capturedImages, setCapturedImages] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});
  const [capturedThumbs, setCapturedThumbs] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});

  // Camera & Stream states
  const [cameraPermission, setCameraPermission] = useState<"idle" | "requesting" | "granted" | "denied" | "unsupported">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showOverrideCapture, setShowOverrideCapture] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Quality checks state
  const [quality, setQuality] = useState<QualityChecks>({
    lighting: "checking",
    sharpness: "checking",
    position: "checking",
    angle: "checking",
  });
  const [hintMessage, setHintMessage] = useState<string>("Align your face within the golden guide");
  const [currentPoseScore, setCurrentPoseScore] = useState<number>(92);

  // Processing stage animation
  const [processingStageIndex, setProcessingStageIndex] = useState(0);
  const processingStages = [
    "Detecting facial landmarks",
    "Checking image sharpness & depth",
    "Mapping multi-spectral biological zones",
    "Analyzing epidermal hydration & sebum balance",
    "Analyzing pigmentation, texture & redness",
    "Computing diagnostic scores for active parameters",
    "Synthesizing your personalized bio-profile"
  ];

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stabilityCounterRef = useRef(0);
  const overrideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup helper to guarantee no camera is left running
  const stopCamera = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (overrideTimerRef.current) {
      clearTimeout(overrideTimerRef.current);
      overrideTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraPermission("requesting");
    setCameraError(null);
    setShowOverrideCapture(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraPermission("unsupported");
      setCameraError("Camera access is not supported by your browser or requires an HTTPS / localhost connection.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraPermission("granted");
      setScanState("capturing");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Start live quality checks 4 times/sec (250ms)
      startQualityChecks();

      // Show "Capture anyway" secondary button after 8 seconds
      overrideTimerRef.current = setTimeout(() => {
        setShowOverrideCapture(true);
      }, 8000);

    } catch (err: any) {
      console.warn("Camera permission error:", err);
      setCameraPermission("denied");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in browser settings or use photo upload / sample faces.");
      } else {
        setCameraError(`Camera error: ${err.message || "Could not start camera."}`);
      }
    }
  };

  // Live quality assessment heuristic on downscaled canvas
  const startQualityChecks = () => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, 160, 120);

      const frame = ctx.getImageData(0, 0, 160, 120);
      const data = frame.data;

      // 1. Lighting brightness
      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        totalLuminance += luma;
      }
      const avgBrightness = totalLuminance / (data.length / 4);

      let lightingStatus: QualityChecks["lighting"] = "good";
      if (avgBrightness < 50) lightingStatus = "too_dark";
      else if (avgBrightness > 220) lightingStatus = "too_bright";

      // 2. Sharpness (Laplacian high-pass edge variance estimation)
      let edgeEnergy = 0;
      for (let y = 1; y < 119; y += 2) {
        for (let x = 1; x < 159; x += 2) {
          const idx = (y * 160 + x) * 4;
          const valCenter = data[idx];
          const valRight = data[idx + 4];
          const valBottom = data[idx + 160 * 4];
          const diff = Math.abs(valCenter - valRight) + Math.abs(valCenter - valBottom);
          edgeEnergy += diff;
        }
      }
      const sharpnessIndex = edgeEnergy / ((160 * 120) / 4);
      const sharpnessStatus: QualityChecks["sharpness"] = sharpnessIndex > 8 ? "sharp" : "blurry";

      // 3. Position & Angle stability
      stabilityCounterRef.current += 1;
      const positionStatus: QualityChecks["position"] = "centered";
      const angleStatus: QualityChecks["angle"] = "good";

      setQuality({
        lighting: lightingStatus,
        sharpness: sharpnessStatus,
        position: positionStatus,
        angle: angleStatus,
      });

      // Plain language hints
      if (lightingStatus === "too_dark") {
        setHintMessage("Move into better light or face a window");
      } else if (lightingStatus === "too_bright") {
        setHintMessage("Reduce intense glare or backlighting");
      } else if (sharpnessStatus === "blurry") {
        setHintMessage("Hold steady for sharp biometric focus");
      } else {
        if (currentPose === "front") setHintMessage("Perfect! Face straight ahead");
        else if (currentPose === "left") setHintMessage("Turn head ~30° to your left");
        else setHintMessage("Turn head ~30° to your right");
      }

      // Auto-capture trigger if enabled and all pass
      const allPassed = lightingStatus === "good" && sharpnessStatus === "sharp";
      if (allPassed && autoCapture && countdown === null && scanState === "capturing") {
        handleTriggerCapture();
      }
    }, 250);
  };

  // Capture execution with countdown and flash
  const handleTriggerCapture = () => {
    if (countdown !== null) return;
    setCountdown(3);

    let currentCount = 3;
    const countTimer = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(countTimer);
        setCountdown(null);
        executeCapture();
      }
    }, 900);
  };

  const executeCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    // Flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    // Grab full un-mirrored high-res capture in memory
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const fullDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Create low-res thumbnail
      createThumbnail(canvas, (thumbUrl) => {
        setCapturedImages((prev) => ({ ...prev, [currentPose]: fullDataUrl }));
        setCapturedThumbs((prev) => ({ ...prev, [currentPose]: thumbUrl }));
        setCurrentPoseScore(Math.floor(88 + Math.random() * 10));
        setScanState("preview");
      });
    }
  };

  // Upload file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        createThumbnail(result, (thumb) => {
          setCapturedImages((prev) => ({ ...prev, [currentPose]: result }));
          setCapturedThumbs((prev) => ({ ...prev, [currentPose]: thumb }));
          setCurrentPoseScore(94);
          setScanState("preview");
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Use sample faces fallback (Fills all 3 poses with pure SVG faces)
  const handleUseSampleFaces = () => {
    const frontSvg = createSampleFaceSvg("front");
    const leftSvg = createSampleFaceSvg("left");
    const rightSvg = createSampleFaceSvg("right");

    setCapturedImages({
      front: frontSvg,
      left: leftSvg,
      right: rightSvg,
    });
    setCapturedThumbs({
      front: frontSvg,
      left: leftSvg,
      right: rightSvg,
    });

    toast.info("Loaded simulated 3-angle facial sample scans.");
    startProcessingFlow({
      front: frontSvg,
      left: leftSvg,
      right: rightSvg,
    });
  };

  // Confirm photo and advance pose or start processing
  const handleAcceptPose = () => {
    if (currentPose === "front") {
      setCurrentPose("left");
      setScanState("capturing");
      if (cameraPermission === "granted") startQualityChecks();
    } else if (currentPose === "left") {
      setCurrentPose("right");
      setScanState("capturing");
      if (cameraPermission === "granted") startQualityChecks();
    } else {
      stopCamera();
      startProcessingFlow(capturedThumbs);
    }
  };

  // Retake current pose
  const handleRetakePose = () => {
    setCapturedImages((prev) => {
      const copy = { ...prev };
      delete copy[currentPose];
      return copy;
    });
    setScanState("capturing");
    if (cameraPermission === "granted") startQualityChecks();
  };

  // 7-Stage cinematic processing simulation
  const startProcessingFlow = (thumbnailsMap: { front?: string; left?: string; right?: string }) => {
    stopCamera();
    setScanState("processing");
    setProcessingStageIndex(0);

    const totalDuration = 7000;
    const intervalMs = totalDuration / processingStages.length;

    let stage = 0;
    const stageTimer = setInterval(() => {
      stage += 1;
      if (stage < processingStages.length) {
        setProcessingStageIndex(stage);
      } else {
        clearInterval(stageTimer);
        finalizeScanResult(thumbnailsMap);
      }
    }, intervalMs);
  };

  const finalizeScanResult = (thumbnailsMap: { front?: string; left?: string; right?: string }) => {
    try {
      const scanResult = generateScan({
        customerId: customerProfile?.id || "cust-1",
        customerName: customerProfile?.name || "Radhika Singhania",
        questionnaire: customerProfile?.questionnaire || {},
        parameters: parameters,
        seed: Date.now(),
        thumbnails: {
          front: thumbnailsMap.front || createSampleFaceSvg("front"),
          left: thumbnailsMap.left || createSampleFaceSvg("left"),
          right: thumbnailsMap.right || createSampleFaceSvg("right"),
        }
      });

      addScan(scanResult);
      toast.success("Skin diagnostic analysis complete!");
      router.push(`/app/results/${scanResult.id}`);
    } catch (err) {
      console.error("Error creating scan result:", err);
      toast.error("Failed to generate scan diagnostics. Using fallback profile.");
      router.push("/app/results");
    }
  };

  const isQualityPassing = quality.lighting === "good" && quality.sharpness === "sharp";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hidden processing canvas */}
      <canvas ref={analysisCanvasRef} className="hidden" />
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="user" 
        className="hidden" 
        onChange={handleFileUpload} 
      />

      {/* Screen flash effect */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none transition-opacity duration-200" />
      )}

      {/* 1. INTRO SCREEN */}
      {scanState === "intro" && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Clinical AI Analysis
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-cream-100 font-normal">
              3-Angle Biometric Facial Diagnostic
            </h1>
            <p className="text-cream-300/70 text-sm sm:text-base">
              Our camera measures cellular hydration, lipid balance, fine lines, and erythema across 68 landmark zones. All processing happens locally on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Phone Simulation */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-sm rounded-[32px] p-4 bg-surface/80 border border-gold-400/20 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="aspect-[3/4] rounded-[24px] overflow-hidden bg-base relative flex items-center justify-center">
                  <FaceScanGraphic className="w-full h-full" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs font-mono text-gold-400 bg-black/60 px-3 py-1.5 rounded-full border border-gold-400/20">
                    <span>POSES: 3 ANGLES</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> LOCAL SIM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-6 space-y-4 bg-surface/60 border-gold-400/15">
                <h2 className="text-xs font-semibold text-cream-100 uppercase tracking-wider font-mono text-gold-400">
                  Pre-Scan Preparation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-cream-200/80">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-base/50 border border-gold-400/10">
                    <Sun className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span><strong>Bright Even Light</strong><br />Face a window or soft lamp</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-base/50 border border-gold-400/10">
                    <Eye className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span><strong>Remove Glasses</strong><br />Allows clear orbital eye analysis</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-base/50 border border-gold-400/10">
                    <Smile className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span><strong>Neutral Expression</strong><br />Relax jaw and facial muscles</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-base/50 border border-gold-400/10">
                    <Zap className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span><strong>Hair Away from Face</strong><br />Clear forehead and cheek contours</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={startCamera}
                  className="w-full py-4 text-base font-medium shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Start Camera Scan (Recommended)
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setScanState("capturing");
                      fileInputRef.current?.click();
                    }}
                    className="text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" /> Upload Photos
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleUseSampleFaces}
                    className="text-xs sm:text-sm flex items-center justify-center gap-1.5 border-gold-400/30"
                  >
                    <Sparkles className="w-4 h-4 text-gold-400" /> Sample Faces (Demo)
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-cream-400 pt-2 border-t border-gold-400/10">
                <button 
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-gold-400 transition-colors flex items-center gap-1 underline cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> How we protect your biometric privacy
                </button>
                <Link 
                  href="/app/onboarding?retake=true" 
                  className="hover:text-gold-400 transition-colors flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" /> Retake questionnaire
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAPTURE & LIVE QUALITY CHECK SCREEN */}
      {scanState === "capturing" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Pose Progress Bar */}
          <div className="flex items-center justify-between bg-surface/80 border border-gold-400/15 rounded-2xl p-4 backdrop-blur-md">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                stopCamera();
                setScanState("intro");
              }}
              className="text-cream-300 hover:text-cream-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit
            </Button>

            <div className="flex items-center gap-3">
              {(["front", "left", "right"] as Pose[]).map((pose, idx) => {
                const isCurrent = currentPose === pose;
                const isDone = Boolean(capturedThumbs[pose]);
                return (
                  <div 
                    key={pose} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isCurrent 
                        ? "bg-gold-400/20 text-gold-300 border-gold-400" 
                        : isDone 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                        : "bg-surface text-cream-400 border-gold-400/10 opacity-50"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-base">
                      {isDone ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : idx + 1}
                    </span>
                    <span className="capitalize">{pose} Pose</span>
                  </div>
                );
              })}
            </div>

            <label className="hidden sm:flex items-center gap-2 text-xs text-cream-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoCapture} 
                onChange={(e) => setAutoCapture(e.target.checked)} 
                className="rounded border-gold-400/30 text-gold-400 focus:ring-gold-400"
              />
              Auto-capture
            </label>
          </div>

          {/* Camera Viewport & Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full max-w-xl aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/11] bg-black rounded-3xl overflow-hidden relative border-2 border-gold-400/30 shadow-2xl flex items-center justify-center">
                
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {cameraPermission !== "granted" && (
                  <div className="absolute inset-0 bg-base/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
                    <AlertCircle className="w-12 h-12 text-gold-400" />
                    <div className="space-y-1 max-w-md">
                      <h3 className="font-serif text-lg text-cream-100">
                        {cameraPermission === "requesting" ? "Starting Camera..." : "Camera Unavailable"}
                      </h3>
                      <p className="text-xs text-cream-300/80">
                        {cameraError || "Please allow camera access to enable real-time facial scanning."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                      <Button size="sm" onClick={startCamera}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Retry Camera
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1" /> Upload Photo
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleUseSampleFaces}>
                        <Sparkles className="w-4 h-4 mr-1 text-gold-400" /> Use Sample Faces
                      </Button>
                    </div>
                  </div>
                )}

                {cameraPermission === "granted" && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <svg className="w-full h-full max-w-md" viewBox="0 0 400 480">
                      <ellipse 
                        cx="200" 
                        cy="220" 
                        rx={currentPose === "front" ? 110 : 95} 
                        ry="145" 
                        fill="none" 
                        stroke={isQualityPassing ? "#10B981" : "#D4AF37"} 
                        strokeWidth="2.5" 
                        strokeDasharray={isQualityPassing ? "none" : "8 6"}
                        className="transition-all duration-300 opacity-80"
                      />
                      {currentPose === "left" && (
                        <g fill="#D4AF37" className="animate-pulse">
                          <polygon points="120,220 140,205 140,235" />
                          <text x="150" y="224" fill="#D4AF37" fontSize="12" fontWeight="600">Turn Left</text>
                        </g>
                      )}
                      {currentPose === "right" && (
                        <g fill="#D4AF37" className="animate-pulse">
                          <polygon points="280,220 260,205 260,235" />
                          <text x="210" y="224" fill="#D4AF37" fontSize="12" fontWeight="600">Turn Right</text>
                        </g>
                      )}
                    </svg>

                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
                        <span className="font-serif text-8xl font-bold text-gold-400 animate-ping">
                          {countdown}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute bottom-4 inset-x-4 bg-black/70 backdrop-blur-md rounded-xl p-2.5 border border-gold-400/20 text-center text-xs font-medium text-cream-200 z-10 flex items-center justify-center gap-2">
                  <Info className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{hintMessage}</span>
                </div>
              </div>

              {/* Shutter Controls */}
              <div className="w-full max-w-xl flex flex-col items-center gap-3 mt-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> Upload Instead
                  </Button>

                  <button
                    onClick={handleTriggerCapture}
                    disabled={cameraPermission !== "granted" || countdown !== null}
                    aria-label="Capture pose"
                    className={`w-20 h-20 rounded-full p-1.5 border-4 transition-all transform active:scale-95 flex items-center justify-center shadow-gold-glow ${
                      isQualityPassing
                        ? "border-emerald-400 bg-emerald-500/20 hover:scale-105"
                        : "border-gold-400 bg-gold-400/10 hover:border-gold-300"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-gold-400 flex items-center justify-center shadow-inner">
                      <Camera className="w-7 h-7 text-base" />
                    </div>
                  </button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUseSampleFaces}
                    className="text-xs border-gold-400/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-gold-400" /> Demo Faces
                  </Button>
                </div>

                {showOverrideCapture && (
                  <button
                    onClick={executeCapture}
                    className="text-xs text-gold-400 hover:text-gold-300 underline pt-1 cursor-pointer"
                  >
                    Lighting checks taking too long? Click here to capture anyway
                  </button>
                )}
              </div>
            </div>

            {/* Quality Checks & Pose Thumbnails */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-5 space-y-4 bg-surface/70 border-gold-400/15">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Real-time Biometrics Quality
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    quality.lighting === "good"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-base/60 border-gold-400/20 text-cream-300"
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-gold-400" /> Lighting
                    </span>
                    <span className="font-semibold capitalize text-[11px]">
                      {quality.lighting === "good" ? "Good" : quality.lighting.replace("_", " ")}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    quality.sharpness === "sharp"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-base/60 border-gold-400/20 text-cream-300"
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-gold-400" /> Focus
                    </span>
                    <span className="font-semibold capitalize text-[11px]">
                      {quality.sharpness}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-gold-400" /> Position
                    </span>
                    <span className="font-semibold text-[11px]">Centered</span>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FlipHorizontal className="w-3.5 h-3.5 text-gold-400" /> Angle
                    </span>
                    <span className="font-semibold text-[11px] capitalize">{currentPose}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-3 bg-surface/70 border-gold-400/15">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold-400">
                  Captured Poses (3 Required)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {(["front", "left", "right"] as Pose[]).map((pose) => {
                    const thumb = capturedThumbs[pose];
                    return (
                      <div 
                        key={pose}
                        className={`aspect-[3/4] rounded-xl overflow-hidden border relative flex flex-col items-center justify-center bg-base ${
                          thumb ? "border-gold-400 shadow-md" : "border-gold-400/15 border-dashed"
                        }`}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={`${pose} thumb`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] uppercase font-mono text-cream-400/50">{pose}</span>
                        )}
                        <span className="absolute bottom-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-gold-400 uppercase">
                          {pose}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 3. PREVIEW & CONFIRM POSE SCREEN */}
      {scanState === "preview" && (
        <div className="max-w-md mx-auto space-y-6 animate-fadeIn text-center">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-cream-100 font-normal capitalize">
              Review {currentPose} Pose
            </h2>
            <p className="text-xs text-cream-300">
              Pose clarity score: <span className="text-emerald-400 font-bold">{currentPoseScore}%</span> • Biometrics confirmed
            </p>
          </div>

          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-black border-2 border-gold-400 shadow-2xl relative">
            {capturedImages[currentPose] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={capturedImages[currentPose]} 
                alt={`${currentPose} capture`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Quality
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={handleRetakePose} className="w-full">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Retake Photo
            </Button>
            <Button onClick={handleAcceptPose} className="w-full shadow-gold-glow">
              Use Photo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 4. PROCESSING SCREEN */}
      {scanState === "processing" && (
        <div className="max-w-lg mx-auto py-8 space-y-8 animate-fadeIn text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Deep Cellular Mapping
            </div>
            <h2 className="font-serif text-3xl text-cream-100 font-normal">
              Analyzing Epidermal Signatures
            </h2>
            <p className="text-xs text-cream-300/80">
              Evaluating 8 clinical parameters across front, left, and right spectral captures...
            </p>
          </div>

          <div className="w-64 h-80 mx-auto rounded-3xl overflow-hidden bg-surface border-2 border-gold-400/40 shadow-2xl relative flex items-center justify-center p-2">
            {capturedImages.front ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedImages.front} alt="Analyzing front pose" className="w-full h-full object-cover rounded-2xl opacity-75" />
            ) : (
              <FaceScanGraphic className="w-full h-full" />
            )}

            <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-gold-400 animate-ping" />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <Card className="p-5 space-y-3 bg-surface/80 border-gold-400/15 text-left">
            <div className="flex justify-between items-center text-xs font-mono text-gold-400 pb-2 border-b border-gold-400/10">
              <span>ANALYSIS PIPELINE</span>
              <span>STAGE {processingStageIndex + 1} OF 7</span>
            </div>

            <div className="space-y-2">
              {processingStages.map((stageName, index) => {
                const isComplete = index < processingStageIndex;
                const isCurrent = index === processingStageIndex;
                return (
                  <div 
                    key={stageName}
                    className={`flex items-center gap-2.5 text-xs transition-colors duration-300 ${
                      isComplete 
                        ? "text-emerald-400" 
                        : isCurrent 
                        ? "text-gold-300 font-medium" 
                        : "text-cream-400/40"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-gold-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-cream-400/20 shrink-0" />
                    )}
                    <span>{stageName}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setScanState("intro");
            }}
            className="text-xs text-cream-400 hover:text-cream-200"
          >
            Cancel Analysis
          </Button>
        </div>
      )}

      {/* Privacy Dialog */}
      <ResponsiveDialog
        open={privacyModalOpen}
        onOpenChange={setPrivacyModalOpen}
        title="Biometric Privacy & On-Device Analysis"
        description="How Celebs Alley handles your facial scan data"
      >
        <div className="space-y-4 text-xs text-cream-200/90 leading-relaxed">
          <p>
            Celebs Alley uses client-side simulated computer vision to evaluate skin wellness. Your facial photographs are never transmitted to external cloud servers and never used for personal identification.
          </p>
          <div className="p-3 rounded-lg bg-surface/60 border border-gold-400/20 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-gold-400">
              <ShieldCheck className="w-4 h-4" /> 100% Client-Side Privacy
            </div>
            <ul className="list-disc list-inside space-y-1 text-cream-300">
              <li>High-res camera frames stay strictly in active browser memory.</li>
              <li>Only low-res diagnostic thumbnail snippets are saved for history tracking.</li>
              <li>You can download or wipe all scan records anytime from your Privacy Settings.</li>
            </ul>
          </div>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setPrivacyModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
