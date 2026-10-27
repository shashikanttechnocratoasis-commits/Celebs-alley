"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Video,
  User,
  ArrowRight,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import consultantsData from "@/data/consultants.json";
import { Appointment } from "@/types";

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

export default function CustomerConsultationsPage() {
  const {
    appointments,
    cancelAppointment,
    rescheduleAppointment,
    customerProfile,
    clientPlans,
    planProgress,
    togglePlanChecklistItem,
    customerAcceptProposedTime,
    addToCart,
    setCartDrawerOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  
  // Reschedule state
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState(TIME_SLOTS[0]);

  // Cancel state
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule conflict / Personal emergency");

  const customerId = customerProfile?.id || "cust-1";

  // Filter appointments for current customer (fallback to cust-1 demo if none found)
  let userAppointments = appointments.filter((a) => a.customerId === customerId);
  if (userAppointments.length === 0) {
    userAppointments = appointments.filter((a) => a.customerId === "cust-1");
  }

  // Active prescribed clinical plan for customer
  const myPlan = useMemo(() => {
    return clientPlans.find(
      (p) => (p.clientId === customerId || p.clientId === "cust-1") && p.status === "published"
    ) || clientPlans[0] || null;
  }, [clientPlans, customerId]);

  const currentPlanProgress = myPlan ? planProgress[myPlan.id] : null;

  const handleAddAllPlanProductsToCart = () => {
    if (!myPlan) return;
    const allSteps = [...(myPlan.amSteps || []), ...(myPlan.pmSteps || [])];
    allSteps.forEach((s) => {
      addToCart({
        productId: s.productId,
        productName: s.productName,
        quantity: 1,
        pricePaise: 485000,
        sellerId: "seller-1",
      } as any);
    });
    setCartDrawerOpen(true);
    toast.success("All prescribed regimen products added to your cart!");
  };

  const filteredAppointments = userAppointments.filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return a.status === "upcoming" || a.status === "pending" || a.status === "confirmed" || a.status === "rescheduled";
    if (activeTab === "completed") return a.status === "completed";
    if (activeTab === "cancelled") return a.status === "cancelled";
    return true;
  });

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleTarget(apt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDate(tomorrow.toISOString().split("T")[0]);
    setNewTime(apt.time || TIME_SLOTS[0]);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget || !newDate || !newTime) {
      toast.error("Please pick a valid date and time slot");
      return;
    }
    rescheduleAppointment(rescheduleTarget.id, newDate, newTime);
    toast.success(`Consultation with ${rescheduleTarget.consultantName} rescheduled to ${newDate} at ${newTime}`);
    setRescheduleTarget(null);
  };

  const handleOpenCancel = (apt: Appointment) => {
    setCancelTarget(apt);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id);
    toast.success("Consultation appointment has been cancelled");
    setCancelTarget(null);
  };

  const handleJoinRoom = (aptId: string) => {
    window.location.href = `/app/consultations/session/${aptId}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <PageHeader
        title="Dermatologist Consultations"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Consultations" }]}
      />

      {/* Prescribed Routine Plan Banner (if doctor prescribed plan) */}
      {myPlan && (
        <Card className="p-6 bg-gradient-to-r from-[#1A130B] via-[#241A0F] to-[#140F0A] border-gold-400/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gold-400/20">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-gold-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Plan from {myPlan.consultantName || "Dr. Meera Nambiar"}
              </span>
              <h3 className="font-serif text-xl font-bold text-cream-100">
                {myPlan.title}
              </h3>
              <p className="text-xs text-cream-300/80">
                {myPlan.goals} ({myPlan.durationWeeks} Weeks Clinical Protocol)
              </p>
            </div>

            <Button
              onClick={handleAddAllPlanProductsToCart}
              className="shadow-gold-glow shrink-0 text-xs py-2"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Add All Plan Products to Cart
            </Button>
          </div>

          {/* Daily Adherence Progress Checklist */}
          <div className="p-4 rounded-2xl bg-base/50 border border-gold-400/15 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cream-100">
                Daily Regimen Adherence Tracker
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                {currentPlanProgress?.adherencePercent || 75}% Adherence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[...(myPlan.amSteps || []), ...(myPlan.pmSteps || [])].map((s) => {
                const isChecked = !!currentPlanProgress?.completedChecklist?.[s.id];
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-surface/70 border border-gold-400/10 cursor-pointer hover:border-gold-400/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        togglePlanChecklistItem(myPlan.id, customerId, s.id)
                      }
                      className="accent-gold-400 w-4 h-4 rounded"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-cream-100 block truncate">
                        {s.timeOfDay}: {s.productName}
                      </span>
                      <span className="text-[10px] text-cream-400/80">
                        {s.usage}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-surface via-surface/90 to-base border-gold-400/25 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400">
            <Sparkles className="w-3.5 h-3.5" /> BOARD-CERTIFIED CLINICAL DERMATOLOGY
          </div>
          <h2 className="font-serif text-2xl text-cream-100 font-normal">
            Your Telehealth Consultations
          </h2>
          <p className="text-xs text-cream-300/80">
            Review your 1-on-1 virtual sessions with Celebs Alley aesthetic doctors and skin specialists.
          </p>
        </div>

        <Button asChild className="shadow-gold-glow shrink-0">
          <Link href="/book">
            <Calendar className="w-4 h-4 mr-2" /> Book New Consultation
          </Link>
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gold-400/20 pb-1">
        {(
          [
            { id: "all", label: "All Appointments" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-gold-400/15 text-gold-400 border border-gold-400/30"
                : "text-cream-400 hover:text-cream-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center bg-surface/60 border-gold-400/20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center text-gold-400 mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-serif text-lg text-cream-100 font-normal">
              No Consultations Found
            </h3>
            <p className="text-xs text-cream-400">
              {activeTab === "all"
                ? "You haven't scheduled any dermatologist consultations yet."
                : `You have no ${activeTab} consultations at this time.`}
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="sm" className="shadow-gold-glow">
              <Link href="/book">
                Schedule a Consultation <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((apt) => {
            const consultant = consultantsData.find((c) => c.id === apt.consultantId);
            const isUpcoming = apt.status === "upcoming" || apt.status === "pending";
            const isCompleted = apt.status === "completed";
            const isCancelled = apt.status === "cancelled";

            return (
              <Card
                key={apt.id}
                className="p-6 bg-surface/80 border-gold-400/20 hover:border-gold-400/35 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Status chip & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                        isUpcoming
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : isCompleted
                          ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                          : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {apt.status}
                    </span>

                    <span className="text-xs text-cream-400 font-mono">
                      Ref: #{apt.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gold-400/30 bg-base shrink-0">
                      {consultant?.avatar ? (
                        <Image
                          src={consultant.avatar}
                          alt={apt.consultantName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-400 font-serif font-bold">
                          {apt.consultantName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-lg text-cream-100 font-normal">
                        {apt.consultantName}
                      </h3>
                      <p className="text-xs text-gold-400">
                        {consultant?.title || "Specialist Aesthetic Physician"}
                      </p>
                      <p className="text-[11px] text-cream-300/80 line-clamp-1">
                        {apt.serviceTitle}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Strip */}
                  <div className="p-3 rounded-xl bg-base/60 border border-gold-400/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-cream-200">
                      <Calendar className="w-4 h-4 text-gold-400" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-cream-200">
                      <Clock className="w-4 h-4 text-gold-400" />
                      <span>{apt.time}</span>
                    </div>
                  </div>

                  {/* Doctor Proposed Time Banner */}
                  {apt.proposedDate && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Doctor Proposed Reschedule: {apt.proposedDate} at {apt.proposedTime}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          customerAcceptProposedTime(apt.id);
                          toast.success("Accepted new consultation time!");
                        }}
                        className="shadow-gold-glow text-xs py-1"
                      >
                        Accept Proposed Time
                      </Button>
                    </div>
                  )}

                  {/* Notes if available */}
                  {apt.notes && (
                    <p className="text-xs text-cream-300/70 italic bg-gold-400/5 p-2.5 rounded-lg border border-gold-400/10">
                      &ldquo;{apt.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-gold-400/10 flex flex-wrap items-center justify-between gap-3">
                  {isUpcoming && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleJoinRoom(apt.id)}
                        className="shadow-gold-glow flex-1 min-w-[140px]"
                      >
                        <Video className="w-3.5 h-3.5 mr-1.5" /> Join Video Room
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-gold-400/30 text-xs"
                        >
                          <Link href="/consultant/messages">
                            Message
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReschedule(apt)}
                          className="border-gold-400/30 text-xs"
                          title="Reschedule appointment"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCancel(apt)}
                          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs"
                          title="Cancel appointment"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-cream-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Session Completed
                      </span>
                      <Button asChild size="sm" variant="outline" className="border-gold-400/30 text-xs">
                        <Link href="/book">
                          Book Follow-up <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Cancelled by Patient
                      </span>
                      <Button asChild size="sm" variant="outline" className="border-gold-400/30 text-xs">
                        <Link href="/book">
                          Book Again <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- RESCHEDULE DIALOG --- */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-gold-400/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
              <h3 className="font-serif text-lg text-cream-100 font-normal">
                Reschedule Consultation
              </h3>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-cream-400 hover:text-cream-100 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-cream-300">
              Rescheduling session with <strong className="text-gold-400">{rescheduleTarget.consultantName}</strong>.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gold-400">
                  Select New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-gold-400/30 text-xs text-cream-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gold-400">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTime(slot)}
                      className={`p-2 rounded-lg text-xs font-mono transition-colors border ${
                        newTime === slot
                          ? "bg-gold-400/20 border-gold-400 text-gold-400 font-bold"
                          : "bg-base/60 border-gold-400/15 text-cream-300 hover:border-gold-400/30"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gold-400/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleTarget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReschedule}
                className="shadow-gold-glow"
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- CANCEL DIALOG --- */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg text-cream-100 font-normal">
                Cancel Consultation
              </h3>
            </div>

            <p className="text-xs text-cream-300 leading-relaxed">
              Are you sure you want to cancel your consultation with{" "}
              <strong className="text-gold-400">{cancelTarget.consultantName}</strong> scheduled for{" "}
              <strong className="text-cream-100">{cancelTarget.date} at {cancelTarget.time}</strong>?
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-cream-400">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-base border border-gold-400/30 text-xs text-cream-100 focus:outline-none"
              >
                <option value="Schedule conflict / Personal emergency">Schedule conflict / Personal emergency</option>
                <option value="Skin condition resolved / improved">Skin condition resolved / improved</option>
                <option value="Prefer in-person clinic visit">Prefer in-person clinic visit</option>
                <option value="Consulting alternative dermatologist">Consulting alternative dermatologist</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-rose-500/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelTarget(null)}
              >
                Keep Appointment
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
