"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { formatPaise } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Users,
  ClipboardList,
  Star,
  IndianRupee,
  CalendarCheck,
  ChevronRight,
  MessageSquare,
  FileText,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { format, isToday, parseISO, addDays, isSameDay } from "date-fns";

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    appointments,
    consultants,
    clientPlans,
    consultantReviews,
    chatThreads,
    scanRecords,
    platformSettings,
    acceptAppointment,
    declineAppointment,
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

  const consultantProfile = useMemo(() => {
    return consultants.find((c) => c.id === activeConsultantId) || consultants[0];
  }, [consultants, activeConsultantId]);

  // Consultant-scoped appointments
  const myAppointments = useMemo(() => {
    return appointments.filter((a) => a.consultantId === activeConsultantId);
  }, [appointments, activeConsultantId]);

  // Real today string for matching (supports 2026-10-27 or actual today)
  const todayStr = useMemo(() => {
    const d = new Date();
    return format(d, "yyyy-MM-dd");
  }, []);

  // Today's appointments
  const todaysAppointments = useMemo(() => {
    return myAppointments.filter(
      (a) => a.date === todayStr || a.date === "2026-10-27"
    );
  }, [myAppointments, todayStr]);

  // Pending requests
  const pendingRequests = useMemo(() => {
    return myAppointments.filter((a) => a.status === "pending");
  }, [myAppointments]);

  // Active clients
  const activeClientsCount = useMemo(() => {
    const clientIds = new Set(
      myAppointments
        .filter((a) => a.status === "confirmed" || a.status === "completed")
        .map((a) => a.customerId)
    );
    return clientIds.size;
  }, [myAppointments]);

  // Plans in progress
  const activePlansCount = useMemo(() => {
    return clientPlans.filter(
      (p) =>
        p.consultantId === activeConsultantId &&
        (p.status === "active" || p.status === "draft")
    ).length;
  }, [clientPlans, activeConsultantId]);

  // Average rating
  const avgRating = useMemo(() => {
    const reviews = consultantReviews.filter(
      (r) => r.consultantId === activeConsultantId
    );
    if (!reviews.length) return consultantProfile?.rating || 4.9;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [consultantReviews, activeConsultantId, consultantProfile]);

  // This month's earnings
  const monthlyEarningsPaise = useMemo(() => {
    const completedApts = myAppointments.filter(
      (a) => a.status === "completed"
    );
    const commPercent = platformSettings?.consultantCommissionPercent ?? 15;
    const doctorTakeHome = 1 - commPercent / 100;
    return completedApts.reduce((sum, a) => {
      const price = a.pricePaise || 150000;
      return sum + Math.round(price * doctorTakeHome);
    }, 0);
  }, [myAppointments, platformSettings]);

  // Upcoming 7-day strip
  const next7Days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(base, i);
      const dayKey = format(day, "yyyy-MM-dd");
      const count = myAppointments.filter(
        (a) =>
          (a.date === dayKey || (i === 0 && a.date === "2026-10-27")) &&
          a.status !== "cancelled"
      ).length;
      return {
        date: day,
        dayKey,
        dayName: format(day, "EEE"),
        dayNum: format(day, "dd"),
        count,
        isToday: i === 0,
      };
    });
  }, [myAppointments]);

  // Unread messages
  const unreadMessagesCount = useMemo(() => {
    return chatThreads
      .filter((t) => t.consultantId === activeConsultantId)
      .reduce((sum, t) => sum + (t.unreadByConsultant || 0), 0);
  }, [chatThreads, activeConsultantId]);

  // Needs action items
  const needsActionList = useMemo(() => {
    const items: Array<{
      id: string;
      type: "booking_request" | "unread_chat" | "plan_followup";
      title: string;
      subtitle: string;
      timestamp: string;
      actionText: string;
      href?: string;
      onAccept?: () => void;
      onDecline?: () => void;
    }> = [];

    // Add pending bookings
    pendingRequests.forEach((req) => {
      items.push({
        id: `pending-${req.id}`,
        type: "booking_request",
        title: `Booking Request: ${req.customerName}`,
        subtitle: `${req.serviceTitle} on ${req.date} at ${req.time}`,
        timestamp: "Awaiting confirmation",
        actionText: "Accept / Decline",
        onAccept: () => {
          acceptAppointment(req.id);
          showToast.success(`Confirmed consultation for ${req.customerName}`);
        },
        onDecline: () => {
          declineAppointment(req.id, "Slot conflict or fully booked");
          showToast.info(`Declined request for ${req.customerName}`);
        },
      });
    });

    // Add unread threads
    chatThreads
      .filter(
        (t) => t.consultantId === activeConsultantId && (t.unreadByConsultant || 0) > 0
      )
      .forEach((t) => {
        items.push({
          id: `chat-${t.id}`,
          type: "unread_chat",
          title: `Unread from ${t.customerName}`,
          subtitle: t.lastMessagePreview || "Client shared an update",
          timestamp: `${t.unreadByConsultant} new message(s)`,
          actionText: "Open Chat",
          href: "/consultant/messages",
        });
      });

    // Add plans awaiting follow-up
    clientPlans
      .filter(
        (p) =>
          p.consultantId === activeConsultantId &&
          p.status === "active" &&
          p.durationWeeks >= 4
      )
      .slice(0, 2)
      .forEach((p) => {
        items.push({
          id: `plan-${p.id}`,
          type: "plan_followup",
          title: `Check Routine Adherence: ${p.clientName || p.customerName || "Client"}`,
          subtitle: `${p.title} (${p.durationWeeks} weeks)`,
          timestamp: "Week 2 Checkpoint",
          actionText: "Review Plan",
          href: "/consultant/plans",
        });
      });

    return items;
  }, [
    pendingRequests,
    chatThreads,
    clientPlans,
    activeConsultantId,
    acceptAppointment,
    declineAppointment,
  ]);

  // Client progress feed (derived from customer scans)
  const clientProgressFeed = useMemo(() => {
    return [
      {
        id: "feed-1",
        clientName: "Ritu Sharma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        deltaScore: +6,
        latestScore: 82,
        concernImproved: "Barrier Redness",
        date: "2 days ago",
        status: "improved",
      },
      {
        id: "feed-2",
        clientName: "Pooja Patel",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        deltaScore: +4,
        latestScore: 79,
        concernImproved: "Oil Regulation & Pores",
        date: "Yesterday",
        status: "improved",
      },
      {
        id: "feed-3",
        clientName: "Natasha Roy",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
        deltaScore: -3,
        latestScore: 68,
        concernImproved: "Hyperpigmentation Spike",
        date: "3 days ago",
        status: "worsened",
      },
    ];
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${consultantProfile?.name || currentUser?.name}`}
        breadcrumbs={[{ label: "Consultant" }, { label: "Clinical Dashboard" }]}
        action={
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/consultant/availability">
                <Clock className="w-4 h-4 mr-1.5 text-[#E8C77A]" />
                Manage Hours
              </Link>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/consultant/plans">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Build Treatment Plan
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards: Animated stat grid with horizontal swipe on mobile */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Today's Calls"
            value={todaysAppointments.length}
            icon={<Video className="w-5 h-5 text-[#E8C77A]" />}
            trend={{ value: 12, isPositive: true }}
            subtext={`${todaysAppointments.filter((a) => a.status === "confirmed").length} confirmed`}
          />
        </div>
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Pending Requests"
            value={pendingRequests.length}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            subtext="Requires doctor response"
          />
        </div>
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Active Clients"
            value={activeClientsCount}
            icon={<Users className="w-5 h-5 text-[#5FAF7A]" />}
            trend={{ value: 8, isPositive: true }}
            subtext="Enrolled in care"
          />
        </div>
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Plans in Progress"
            value={activePlansCount}
            icon={<ClipboardList className="w-5 h-5 text-[#38BDF8]" />}
            subtext="Custom regimens"
          />
        </div>
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Doctor Rating"
            value={avgRating}
            icon={<Star className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />}
            subtext="Verified patient reviews"
          />
        </div>
        <div className="min-w-[260px] md:min-w-0 snap-start">
          <StatCard
            label="Month Earnings"
            value={formatPaise(monthlyEarningsPaise)}
            icon={<IndianRupee className="w-5 h-5 text-[#E8C77A]" />}
            trend={{ value: 15, isPositive: true }}
            subtext="Net 85% payout"
          />
        </div>
      </div>

      {/* 7-Day Upcoming Activity Strip */}
      <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#A89A85]">
            Upcoming 7-Day Schedule Strip
          </span>
          <Link
            href="/consultant/appointments"
            className="text-xs text-[#E8C77A] hover:underline flex items-center gap-1"
          >
            Full Calendar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {next7Days.map((d) => (
            <div
              key={d.dayKey}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                d.isToday
                  ? "bg-[#C99A45]/15 border-[#E8C77A] text-[#F5EDE0] shadow-md shadow-[#C99A45]/10"
                  : "bg-[#1A130B] border-[#C99A45]/15 text-[#A89A85] hover:border-[#C99A45]/30"
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5">
                {d.dayName}
              </div>
              <div className="text-lg font-serif font-semibold text-[#F5EDE0]">
                {d.dayNum}
              </div>
              <div className="mt-1.5 flex items-center justify-center">
                {d.count > 0 ? (
                  <Badge variant="gold" size="sm" className="px-1.5 py-0 text-[10px]">
                    {d.count} {d.count === 1 ? "call" : "calls"}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-[#A89A85]/60">Off</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Responsive Grid: 2-column on tablet/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Schedule Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-[#F5EDE0] font-semibold flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#E8C77A]" />
                Today&apos;s Appointments
              </h2>
              <p className="text-xs text-[#A89A85]">
                {format(new Date(), "EEEE, dd MMMM yyyy")} • Telemedicine and In-Clinic
              </p>
            </div>
            <Badge variant="outline" size="sm">
              {todaysAppointments.length} Scheduled
            </Badge>
          </div>

          {todaysAppointments.length === 0 ? (
            <Card className="p-8 text-center bg-[#140F0A] border-[#C99A45]/20">
              <Calendar className="w-10 h-10 text-[#C99A45]/40 mx-auto mb-3" />
              <p className="text-sm text-[#F5EDE0] font-medium">
                No consultations scheduled for today
              </p>
              <p className="text-xs text-[#A89A85] mt-1 max-w-sm mx-auto">
                Check pending booking requests or review your weekly availability to
                accept new client bookings.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {todaysAppointments.map((apt, index) => {
                const isConfirmed = apt.status === "confirmed";
                const isPending = apt.status === "pending";
                const isCompleted = apt.status === "completed";

                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-5 transition-all border ${
                        isConfirmed
                          ? "bg-[#1A130B] border-[#C99A45]/30 hover:border-[#E8C77A]"
                          : isPending
                          ? "bg-[#1D160D] border-amber-500/30"
                          : "bg-[#140F0A] border-[#C99A45]/15 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#241A0F] border border-[#C99A45]/30 text-center shrink-0">
                            <Clock className="w-4 h-4 text-[#E8C77A] mb-0.5" />
                            <span className="text-[11px] font-bold text-[#F5EDE0] leading-none">
                              {apt.time.split(" ")[0]}
                            </span>
                            <span className="text-[9px] text-[#A89A85]">
                              {apt.time.split(" ")[1] || "AM"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-sm text-[#F5EDE0]">
                                {apt.customerName}
                              </h3>
                              <Badge
                                variant={
                                  isConfirmed
                                    ? "success"
                                    : isPending
                                    ? "warning"
                                    : isCompleted
                                    ? "gold"
                                    : "outline"
                                }
                                size="sm"
                              >
                                {apt.status}
                              </Badge>
                              <Badge variant="outline" size="sm" className="gap-1">
                                {apt.mode === "video" ? (
                                  <>
                                    <Video className="w-3 h-3 text-[#38BDF8]" /> Video
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-3 h-3 text-[#5FAF7A]" /> Clinic
                                  </>
                                )}
                              </Badge>
                            </div>

                            <p className="text-xs text-[#A89A85] line-clamp-1">
                              {apt.serviceTitle}
                            </p>

                            {apt.concerns && apt.concerns.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {apt.concerns.map((c) => (
                                  <span
                                    key={c}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B0907] text-[#C99A45] border border-[#C99A45]/20"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          {isConfirmed && (
                            <Button asChild variant="gold" size="sm">
                              <Link href={`/consultant/session/${apt.id}`}>
                                <Video className="w-3.5 h-3.5 mr-1.5" />
                                Join Call
                              </Link>
                            </Button>
                          )}
                          {isPending && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={() => {
                                  acceptAppointment(apt.id);
                                  showToast.success("Appointment accepted");
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => {
                                  declineAppointment(apt.id, "Slot unavailable");
                                  showToast.info("Appointment declined");
                                }}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                          <Button asChild variant="ghost" size="sm">
                            <Link href="/consultant/appointments">
                              <ArrowRight className="w-4 h-4 text-[#A89A85]" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Needs Action & Client Progress Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Needs Action Panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-[#F5EDE0] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Needs Action ({needsActionList.length})
              </h2>
            </div>

            <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20 divide-y divide-[#C99A45]/15">
              {needsActionList.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#A89A85]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  All caught up! No urgent booking requests or patient messages.
                </div>
              ) : (
                needsActionList.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#F5EDE0]">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A89A85] line-clamp-1">
                        {item.subtitle}
                      </p>
                      <span className="text-[10px] text-[#C99A45]">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-1">
                      {item.onAccept && item.onDecline ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={item.onAccept}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                            title="Accept"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={item.onDecline}
                            className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                            title="Decline"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : item.href ? (
                        <Button asChild variant="outline" size="sm" className="text-xs h-7">
                          <Link href={item.href}>{item.actionText}</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Client Progress Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-[#F5EDE0] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8C77A]" />
                Client Skin Progress Feed
              </h2>
              <Link
                href="/consultant/clients"
                className="text-xs text-[#E8C77A] hover:underline"
              >
                All Clients
              </Link>
            </div>

            <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20 divide-y divide-[#C99A45]/15">
              {clientProgressFeed.map((feed) => (
                <div
                  key={feed.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={feed.avatar} name={feed.clientName} size="sm" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#F5EDE0]">
                        {feed.clientName}
                      </h4>
                      <p className="text-[11px] text-[#A89A85]">
                        {feed.concernImproved}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        feed.status === "improved"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {feed.status === "improved" ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {feed.deltaScore > 0 ? `+${feed.deltaScore}` : feed.deltaScore} pts
                    </div>
                    <div className="text-[10px] text-[#A89A85]">
                      Overall: {feed.latestScore}/100
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
