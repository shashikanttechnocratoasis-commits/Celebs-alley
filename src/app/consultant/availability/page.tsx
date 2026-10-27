"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { AvailabilityRule, TimeOff } from "@/types";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Video,
  MapPin,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Save,
  Sun,
  Shield,
  CalendarOff,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: "Monday" },
  { dayOfWeek: 2, name: "Tuesday" },
  { dayOfWeek: 3, name: "Wednesday" },
  { dayOfWeek: 4, name: "Thursday" },
  { dayOfWeek: 5, name: "Friday" },
  { dayOfWeek: 6, name: "Saturday" },
  { dayOfWeek: 0, name: "Sunday" },
];

export default function ScheduleAvailabilityPage() {
  const {
    currentUser,
    consultants,
    availabilityRules,
    timeOffs,
    updateAvailabilityRule,
    addTimeOff,
    deleteTimeOff,
    updateConsultantProfile,
  } = useAppStore();

  const activeConsultantId =
    currentUser?.consultantId ||
    (currentUser?.id === "user-consultant"
      ? "cons-1"
      : currentUser?.id === "user-consultant-2"
      ? "cons-2"
      : currentUser?.id === "user-consultant-3"
      ? "cons-3"
      : "cons-1");

  const consultant = useMemo(() => {
    return consultants.find((c) => c.id === activeConsultantId) || consultants[0];
  }, [consultants, activeConsultantId]);

  // Consultant's availability rules
  const myRules = useMemo(() => {
    return availabilityRules.filter((r) => r.consultantId === activeConsultantId);
  }, [availabilityRules, activeConsultantId]);

  // Consultant's time off
  const myTimeOffs = useMemo(() => {
    return timeOffs.filter((t) => t.consultantId === activeConsultantId);
  }, [timeOffs, activeConsultantId]);

  // Master Pause Toggle
  const isPaused = !!(consultant as any)?.pauseBookings;

  const handleTogglePause = () => {
    updateConsultantProfile(activeConsultantId, {
      ...consultant,
      pauseBookings: !isPaused,
    } as any);
    showToast.info(
      !isPaused
        ? "New client bookings paused. Profile marked unavailable on /book."
        : "Bookings resumed. Open slots now active on /book."
    );
  };

  // Time off dialog
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [timeOffStart, setTimeOffStart] = useState("2026-11-01");
  const [timeOffEnd, setTimeOffEnd] = useState("2026-11-03");
  const [timeOffReason, setTimeOffReason] = useState("Dermatology Conference in Mumbai");

  const handleAddTimeOff = () => {
    addTimeOff({
      consultantId: activeConsultantId,
      startDate: timeOffStart,
      endDate: timeOffEnd,
      reason: timeOffReason,
    });
    setTimeOffOpen(false);
    showToast.success("Time off scheduled");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Schedule & Clinical Availability"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Availability" },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant={isPaused ? "secondary" : "outline"}
              size="sm"
              onClick={handleTogglePause}
              className={isPaused ? "text-amber-400 border-amber-500/40" : ""}
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-1.5 text-emerald-400" /> Resume Bookings
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 mr-1.5 text-amber-400" /> Pause New Bookings
                </>
              )}
            </Button>
            <Button variant="gold" size="sm" onClick={() => setTimeOffOpen(true)}>
              <CalendarOff className="w-4 h-4 mr-1.5" />
              Schedule Time Off
            </Button>
          </div>
        }
      />

      {/* Pause banner notice if paused */}
      {isPaused && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Your public booking calendar is currently <strong>paused</strong>. Prospective clients cannot select new slots on /book or /experts.
            </span>
          </div>
          <Button size="sm" variant="gold" onClick={handleTogglePause} className="h-7 text-xs">
            Resume Now
          </Button>
        </div>
      )}

      {/* Main Grid: Weekly Schedule + Time Off & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Day-by-Day Schedule Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                  Weekly Working Hours
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Configure recurring hours for video telemedicine and in-clinic appointments.
                </p>
              </div>
              <Badge variant="gold">
                {myRules.filter((r) => r.enabled).length} Days Active
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              {DAYS_OF_WEEK.map((day) => {
                const existingRule = myRules.find((r) => r.dayOfWeek === day.dayOfWeek);
                const isEnabled = existingRule?.enabled ?? false;

                return (
                  <div
                    key={day.dayOfWeek}
                    className={`p-4 rounded-2xl border transition-all ${
                      isEnabled
                        ? "bg-[#1A130B] border-[#C99A45]/30"
                        : "bg-[#110D08]/60 border-[#C99A45]/10 opacity-70"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            if (existingRule) {
                              updateAvailabilityRule(existingRule.id, {
                                enabled: e.target.checked,
                              });
                            } else {
                              updateAvailabilityRule(`avail-${activeConsultantId}-${day.name.toLowerCase()}`, {
                                id: `avail-${activeConsultantId}-${day.name.toLowerCase()}`,
                                consultantId: activeConsultantId,
                                dayOfWeek: day.dayOfWeek,
                                dayName: day.name,
                                enabled: e.target.checked,
                                timeRanges: [{ start: "10:00", end: "14:00" }],
                                slotDurationMinutes: 30,
                                bufferMinutes: 10,
                                maxAppointmentsPerDay: 8,
                                mode: ["video", "in-clinic"],
                              });
                            }
                            showToast.success(`${day.name} status updated`);
                          }}
                          className="w-4 h-4 accent-[#C99A45] rounded"
                        />
                        <div>
                          <span className="font-semibold text-sm text-[#F5EDE0]">
                            {day.name}
                          </span>
                          <div className="text-[11px] text-[#A89A85]">
                            {isEnabled ? (
                              <span>
                                {existingRule?.timeRanges?.map((tr) => `${tr.start} - ${tr.end}`).join(", ") || "No ranges configured"}
                              </span>
                            ) : (
                              <span>Closed / Day Off</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEnabled && existingRule && (
                        <div className="flex items-center gap-3 text-xs">
                          {/* Slot Duration */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#A89A85]">Duration:</span>
                            <select
                              value={existingRule.slotDurationMinutes}
                              onChange={(e) => {
                                updateAvailabilityRule(existingRule.id, {
                                  slotDurationMinutes: Number(e.target.value) as 15 | 30 | 45 | 60,
                                });
                              }}
                              className="bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] rounded-lg px-2 py-1 text-xs"
                            >
                              <option value={15}>15m</option>
                              <option value={30}>30m</option>
                              <option value={45}>45m</option>
                              <option value={60}>60m</option>
                            </select>
                          </div>

                          {/* Buffer */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#A89A85]">Buffer:</span>
                            <select
                              value={existingRule.bufferMinutes}
                              onChange={(e) => {
                                updateAvailabilityRule(existingRule.id, {
                                  bufferMinutes: Number(e.target.value),
                                });
                              }}
                              className="bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] rounded-lg px-2 py-1 text-xs"
                            >
                              <option value={5}>5m</option>
                              <option value={10}>10m</option>
                              <option value={15}>15m</option>
                            </select>
                          </div>

                          {/* Modes */}
                          <div className="flex items-center gap-1 text-[#A89A85]">
                            <Video className="w-3.5 h-3.5 text-[#38BDF8]" />
                            <MapPin className="w-3.5 h-3.5 text-[#5FAF7A]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Pane: Telemedicine Parameters & Leave Management (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* General Consultation Settings */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
              Slot Defaults & Limits
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A89A85] mb-1 block">Default Consultation Fee</label>
                <div className="p-2.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 font-semibold text-[#E8C77A]">
                  ₹1,500 per 30-min session (Net: ₹1,275 after 15% platform commission)
                </div>
              </div>

              <div>
                <label className="text-[#A89A85] mb-1 block">Maximum Sessions Per Day</label>
                <select className="w-full bg-[#1A130B] border border-[#C99A45]/30 text-[#F5EDE0] rounded-xl px-3 py-2">
                  <option value={6}>6 sessions (Recommended for quality)</option>
                  <option value={8}>8 sessions</option>
                  <option value={10}>10 sessions</option>
                </select>
              </div>

              <div>
                <label className="text-[#A89A85] mb-1 block">Conflict & Double-Booking Protection</label>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Strict collision avoidance active. Buffer times enforced.</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Scheduled Time Off / Vacations */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                Time Off & Leave
              </h3>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setTimeOffOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>

            {myTimeOffs.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#A89A85]">
                No scheduled leave periods.
              </div>
            ) : (
              <div className="space-y-2">
                {myTimeOffs.map((to) => (
                  <div
                    key={to.id}
                    className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F5EDE0]">
                        {to.startDate} to {to.endDate}
                      </div>
                      <div className="text-[11px] text-[#A89A85]">{to.reason}</div>
                    </div>
                    <button
                      onClick={() => {
                        deleteTimeOff(to.id);
                        showToast.info("Time off removed");
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Schedule Time Off Dialog */}
      <ResponsiveDialog
        open={timeOffOpen}
        onOpenChange={setTimeOffOpen}
        title="Schedule Clinical Leave / Time Off"
        description="Blocked dates will automatically be marked unavailable on the public booking engine."
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A89A85] mb-1 block">Start Date</label>
              <Input
                type="date"
                value={timeOffStart}
                onChange={(e) => setTimeOffStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[#A89A85] mb-1 block">End Date</label>
              <Input
                type="date"
                value={timeOffEnd}
                onChange={(e) => setTimeOffEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#A89A85] mb-1 block">Reason / Note</label>
            <Input
              value={timeOffReason}
              onChange={(e) => setTimeOffReason(e.target.value)}
              placeholder="e.g. Annual Leave, Medical Conference, Travel"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTimeOffOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleAddTimeOff}>
              Save Time Off
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
