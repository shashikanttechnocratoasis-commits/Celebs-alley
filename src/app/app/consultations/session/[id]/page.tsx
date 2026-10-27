"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Star,
  CheckCircle2,
  Shield,
  Wifi,
  ArrowRight,
} from "lucide-react";

export default function CustomerVideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;

  const {
    currentUser,
    appointments,
    consultants,
    completeAppointment,
    addConsultantReview,
  } = useAppStore();

  const appointment = useMemo(() => {
    return appointments.find((a) => a.id === appointmentId) || appointments[0];
  }, [appointments, appointmentId]);

  const consultant = useMemo(() => {
    return (
      consultants.find((c) => c.id === appointment?.consultantId) || consultants[0]
    );
  }, [consultants, appointment]);

  // Phase: "prejoin" | "incall" | "summary"
  const [phase, setPhase] = useState<"prejoin" | "incall" | "summary">("prejoin");

  // Media
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    let interval: any;
    if (phase === "incall") {
      interval = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Init media
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
        if (mounted) setHasCameraPermission(false);
      }
    }

    if (phase !== "summary") {
      initMedia();
    }

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [phase]);

  // Mute audio/video
  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = audioMuted));
    }
    setAudioMuted(!audioMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = videoMuted));
    }
    setVideoMuted(!videoMuted);
  };

  // End Call
  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (appointment) {
      completeAppointment(appointment.id);
    }
    setPhase("summary");
    showToast.success("Session finished");
  };

  // Rating & Review State
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSubmitReview = () => {
    if (!consultant) return;
    const finalReviewText =
      reviewComment ||
      "Exceptional medical guidance and thorough analysis of my skin scan.";
    addConsultantReview({
      consultantId: consultant.id,
      customerId: currentUser?.id || "cust-1",
      customerName: currentUser?.name || "Ritu Sharma",
      rating,
      review: finalReviewText,
      comment: finalReviewText,
      verifiedConsultation: true,
    });
    setReviewSubmitted(true);
    showToast.success("Thank you! Your verified doctor rating has been published.");
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
      {/* Banner */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex items-center justify-between text-xs py-2 px-4 rounded-xl bg-[#1A130B] border border-[#C99A45]/20">
        <div className="flex items-center gap-2 text-[#E8C77A]">
          <Shield className="w-4 h-4" />
          <span>Celebs Alley Telemedicine Virtual Suite</span>
        </div>
        <div className="flex items-center gap-2 text-[#A89A85]">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Peer Connection</span>
        </div>
      </div>

      {/* 1. PRE-JOIN */}
      {phase === "prejoin" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 sm:p-8 bg-[#140F0A] border-[#C99A45]/30 shadow-2xl space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C99A45] font-semibold">
                Patient Telemedicine Check-in
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F5EDE0]">
                Join Session with {consultant?.name}
              </h2>
              <p className="text-xs text-[#A89A85]">
                {appointment?.serviceTitle}
              </p>
            </div>

            {/* Video preview */}
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
                <div className="p-6 text-center space-y-2">
                  <VideoOff className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-[#F5EDE0]">Camera Mode Simulated</p>
                  <p className="text-[11px] text-[#A89A85]">
                    Microphone and camera ready for consultation chamber.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full border transition-all ${
                  audioMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B] border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full border transition-all ${
                  videoMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B] border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
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
                <Link href="/app/consultations">Cancel</Link>
              </Button>
              <Button
                variant="gold"
                className="w-full sm:w-auto text-xs px-8"
                onClick={() => setPhase("incall")}
              >
                Join Video Call Now
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. IN-CALL */}
      {phase === "incall" && (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <div className="flex-1 rounded-3xl bg-[#0B0907] border border-[#C99A45]/20 overflow-hidden relative min-h-[460px] flex flex-col justify-between">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C99A45]/30 text-xs font-semibold text-[#F5EDE0] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {formatTimer(elapsedSeconds)}
              </div>
              <Badge variant="gold">{consultant?.name}</Badge>
            </div>

            {/* Doctor Stage */}
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden">
              <img
                src={consultant?.avatar}
                alt={consultant?.name}
                className="w-full h-full object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="font-serif text-xl font-bold text-[#F5EDE0]">
                  {consultant?.name}
                </h3>
                <p className="text-xs text-[#E8C77A]">{consultant?.title}</p>
              </div>

              {/* PiP */}
              <div className="absolute top-4 right-4 w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden bg-black border-2 border-[#C99A45]/40 shadow-xl z-20">
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
                    You
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-center gap-4 z-10">
              <button
                onClick={toggleAudio}
                className={`p-3.5 rounded-full border transition-all ${
                  audioMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-full border transition-all ${
                  videoMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-[#1A130B]/90 border-[#C99A45]/30 text-[#F5EDE0]"
                }`}
              >
                {videoMuted ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleEndCall}
                className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold ml-2"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-CALL SUMMARY + RATING PROMPT */}
      {phase === "summary" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 bg-[#140F0A] border-gold-400/30 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-[#F5EDE0]">
                Consultation Finished
              </h2>
              <p className="text-xs text-[#A89A85]">
                Duration: {formatTimer(elapsedSeconds)} with {consultant?.name}
              </p>
            </div>

            {!reviewSubmitted ? (
              <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-3 text-left">
                <span className="text-xs font-semibold text-[#E8C77A] block">
                  How was your consultation experience?
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-[#A89A85]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#F5EDE0] ml-2">
                    {rating} / 5
                  </span>
                </div>

                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share feedback on medical recommendations, regimen advice..."
                  rows={2}
                  className="text-xs"
                />

                <Button
                  variant="gold"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleSubmitReview}
                >
                  Submit Doctor Review
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-400">
                Review recorded. Thank you for helping verify specialist quality!
              </div>
            )}

            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/app/consultations">Return to Consultations</Link>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
