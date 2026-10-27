"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Sparkles,
  MessageSquare,
  FileText,
  Clock,
  Wifi,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Plus,
} from "lucide-react";

export default function ConsultantVideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.appointmentId as string;

  const {
    currentUser,
    appointments,
    customers,
    products,
    completeAppointment,
    saveClientNote,
    logAuditEvent,
  } = useAppStore();

  const appointment = useMemo(() => {
    return appointments.find((a) => a.id === appointmentId) || appointments[0];
  }, [appointments, appointmentId]);

  const client = useMemo(() => {
    return (customers || []).find((c: any) => c.id === appointment?.customerId) || customers[0];
  }, [customers, appointment]);

  // Phase: "prejoin" | "incall" | "summary"
  const [phase, setPhase] = useState<"prejoin" | "incall" | "summary">("prejoin");

  // Media states
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Call timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    let interval: any;
    if (phase === "incall") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Request camera and microphone in pre-join
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (mounted) {
            streamRef.current = stream;
            setHasCameraPermission(true);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn("Camera/mic access unavailable in environment:", err);
        if (mounted) setHasCameraPermission(false);
      }
    }

    if (phase !== "summary") {
      initMedia();
    }

    // Cleanup: ALWAYS stop all tracks on unmount or route exit
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [phase]);

  // Toggle Mute Audio
  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = audioMuted;
      });
    }
    setAudioMuted(!audioMuted);
  };

  // Toggle Mute Video
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = videoMuted;
      });
    }
    setVideoMuted(!videoMuted);
  };

  // Active side drawer in call: "notes" | "client" | "products" | null
  const [activeDrawer, setActiveDrawer] = useState<"notes" | "client" | "products" | null>(
    "notes"
  );
  const [quickNote, setQuickNote] = useState(
    "Patient exhibits improved cutaneous barrier resilience. Advised maintaining ceramide night regimen."
  );

  // End Call Action
  const handleEndCall = () => {
    // 1. Stop all hardware tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // 2. Auto-mark appointment as completed
    if (appointment) {
      completeAppointment(appointment.id);
    }

    // 3. Save quick clinical note
    if (appointment && client) {
      saveClientNote({
        customerId: client.id,
        clientId: client.id,
        clientName: client.name,
        consultantId: appointment.consultantId,
        soap: {
          subjective: "Patient conducted telemedicine follow-up call.",
          objective: "Visual examination over HD video verified clear skin barrier.",
          assessment: "Stable progress on active regimen.",
          plan: quickNote,
        },
        disclaimer: "Cosmetic wellness guidance, not a medical diagnosis",
      });
    }

    // 4. Log audit event
    logAuditEvent?.({
      actor: currentUser?.name || "Dr. Meera Nambiar",
      action: `Completed telemedicine consultation with ${client?.name} (Session duration: ${Math.floor(
        elapsedSeconds / 60
      )}m ${elapsedSeconds % 60}s)`,
      resource: "sessions",
      ipAddress: "127.0.0.1 (Consultant Portal)",
    });

    setPhase("summary");
    showToast.success("Telemedicine call concluded successfully");
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#080604] text-[#F5EDE0] flex flex-col p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="max-w-7xl mx-auto w-full mb-4 flex items-center justify-between text-xs py-2 px-4 rounded-xl bg-[#1A130B] border border-[#C99A45]/20">
        <div className="flex items-center gap-2 text-[#E8C77A]">
          <Shield className="w-4 h-4" />
          <span>Demo Video Session (Simulated HD WebRTC Chamber)</span>
        </div>
        <div className="flex items-center gap-2 text-[#A89A85]">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted 256-bit AES</span>
        </div>
      </div>

      {/* 1. PRE-JOIN SCREEN */}
      {phase === "prejoin" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 sm:p-8 bg-[#140F0A] border-[#C99A45]/30 shadow-2xl space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C99A45] font-semibold">
                Telemedicine Chamber Intake
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F5EDE0]">
                Ready to Join Call with {client?.name}?
              </h2>
              <p className="text-xs text-[#A89A85]">
                {appointment?.serviceTitle} • Scheduled for {appointment?.time}
              </p>
            </div>

            {/* Video preview container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B0907] border border-[#C99A45]/30 flex items-center justify-center">
              {hasCameraPermission ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="space-y-2 text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <VideoOff className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#F5EDE0] font-medium">
                    Camera & Microphone Simulated
                  </p>
                  <p className="text-[11px] text-[#A89A85] max-w-xs mx-auto">
                    No physical camera detected or permission bypass mode active. You can still join the session normally.
                  </p>
                </div>
              )}

              {/* Status Chips */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HD Ready
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-[#A89A85] border border-white/10">
                  Doctor: {currentUser?.name || "Dr. Meera Nambiar"}
                </span>
              </div>
            </div>

            {/* Controls before entering */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full border transition-all ${
                  audioMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B] border-[#C99A45]/30 text-[#F5EDE0] hover:border-[#E8C77A]"
                }`}
                title={audioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full border transition-all ${
                  videoMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B] border-[#C99A45]/30 text-[#F5EDE0] hover:border-[#E8C77A]"
                }`}
                title={videoMuted ? "Start Video" : "Stop Video"}
              >
                {videoMuted ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="outline" className="w-full sm:w-auto text-xs">
                <Link href="/consultant/appointments">Back to Agenda</Link>
              </Button>
              <Button
                variant="gold"
                className="w-full sm:w-auto text-xs px-8"
                onClick={() => setPhase("incall")}
              >
                Enter Consultation Room <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. IN-CALL SCREEN */}
      {phase === "incall" && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto w-full">
          {/* Main Video View (Remote peer + PiP self-view) */}
          <div className="flex-1 flex flex-col justify-between rounded-3xl bg-[#0B0907] border border-[#C99A45]/20 overflow-hidden relative min-h-[480px]">
            {/* Top Bar inside Video */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C99A45]/30 text-xs font-semibold text-[#F5EDE0] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatTimer(elapsedSeconds)}
                </div>
                <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-[#A89A85] flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" /> 1080p • 60fps
                </div>
              </div>

              <div className="pointer-events-auto">
                <Badge variant="gold">{client?.name}</Badge>
              </div>
            </div>

            {/* Remote Peer Stage (Simulated patient video using high-res portrait art) */}
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#140F0A] to-[#080604]">
              <div className="relative w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden">
                <img
                  src={
                    client?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={client?.name || "Client"}
                  className="w-full h-full object-cover opacity-90 filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <div className="absolute bottom-6 left-6 text-left">
                  <h3 className="font-serif text-lg font-bold text-[#F5EDE0]">
                    {client?.name}
                  </h3>
                  <p className="text-xs text-[#E8C77A]">{client?.skinType}</p>
                </div>
              </div>

              {/* PiP Self-view (Doctor's camera stream or fallback avatar) */}
              <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden bg-black border-2 border-[#C99A45]/50 shadow-2xl z-20">
                {hasCameraPermission && !videoMuted ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1A130B] text-xs text-[#E8C77A]">
                    Dr. Meera (Self)
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls Floating Dock */}
            <div className="p-4 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-center gap-3 z-10">
              <button
                onClick={toggleAudio}
                className={`p-3.5 rounded-full border transition-all ${
                  audioMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0] hover:border-[#E8C77A]"
                }`}
                title={audioMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-full border transition-all ${
                  videoMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0] hover:border-[#E8C77A]"
                }`}
                title={videoMuted ? "Enable Camera" : "Disable Camera"}
              >
                {videoMuted ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() =>
                  setActiveDrawer(activeDrawer === "notes" ? null : "notes")
                }
                className={`p-3.5 rounded-full border transition-all ${
                  activeDrawer === "notes"
                    ? "bg-[#C99A45] text-[#0B0907]"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
                title="Clinical Notes"
              >
                <FileText className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setActiveDrawer(activeDrawer === "client" ? null : "client")
                }
                className={`p-3.5 rounded-full border transition-all ${
                  activeDrawer === "client"
                    ? "bg-[#C99A45] text-[#0B0907]"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
                title="Client File & Allergies"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setActiveDrawer(activeDrawer === "products" ? null : "products")
                }
                className={`p-3.5 rounded-full border transition-all ${
                  activeDrawer === "products"
                    ? "bg-[#C99A45] text-[#0B0907]"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
                title="Prescribe Product"
              >
                <Layers className="w-5 h-5" />
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 ml-2"
                title="End Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Clinical Drawer Panel */}
          {activeDrawer && (
            <Card className="w-full lg:w-80 p-5 bg-[#140F0A] border-[#C99A45]/20 flex flex-col justify-between space-y-4">
              {activeDrawer === "notes" && (
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between border-b border-[#C99A45]/15 pb-2">
                    <h4 className="font-serif text-sm font-semibold text-[#F5EDE0]">
                      In-Session Clinical Notes
                    </h4>
                    <span className="text-[10px] text-emerald-400">Auto-Saving</span>
                  </div>

                  <Textarea
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    rows={8}
                    className="text-xs"
                    placeholder="Enter immediate clinical observations and directives..."
                  />

                  <div className="p-2.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 text-[10px] text-[#A89A85]">
                    Saved directly to client&apos;s confidential SOAP chart on session completion.
                  </div>
                </div>
              )}

              {activeDrawer === "client" && (
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between border-b border-[#C99A45]/15 pb-2">
                    <h4 className="font-serif text-sm font-semibold text-[#F5EDE0]">
                      Patient Medical Alerts
                    </h4>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      Known Allergies:
                    </div>
                    <div>{client?.allergies?.join(", ") || "No severe allergies"}</div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#A89A85]">
                    <div>Skin Type: {client?.skinType}</div>
                    <div>Concerns: {client?.concerns?.join(", ")}</div>
                  </div>
                </div>
              )}

              {activeDrawer === "products" && (
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between border-b border-[#C99A45]/15 pb-2">
                    <h4 className="font-serif text-sm font-semibold text-[#F5EDE0]">
                      Quick Add to Routine
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {products.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#F5EDE0] truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-[#A89A85]">₹{p.mrp}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => {
                            showToast.success(`Added ${p.name} to follow-up plan draft`);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="gold"
                size="sm"
                className="w-full text-xs"
                onClick={handleEndCall}
              >
                Conclude Consultation
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 3. POST-CALL SUMMARY SCREEN */}
      {phase === "summary" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 bg-[#140F0A] border-emerald-500/30 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#F5EDE0]">
                Consultation Completed
              </h2>
              <p className="text-xs text-[#A89A85]">
                Session with <span className="text-[#E8C77A] font-semibold">{client?.name}</span> concluded.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#A89A85]">Total Session Duration:</span>
                <span className="font-bold text-[#F5EDE0]">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A89A85]">Appointment Status:</span>
                <Badge variant="success" size="sm">
                  Completed
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A89A85]">Clinical Notes:</span>
                <span className="text-emerald-400 font-semibold">Saved to Chart</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="w-full text-xs">
                <Link href="/consultant/appointments">Return to Agenda</Link>
              </Button>
              <Button asChild variant="gold" className="w-full text-xs">
                <Link href={`/consultant/plans?clientId=${client?.id}`}>
                  Build Routine Plan
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
