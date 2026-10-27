"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { Appointment } from "@/types";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  UserCheck,
  FileText,
  CalendarCheck,
  CalendarDays,
  List,
  Sparkles,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Info,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from "date-fns";

export default function AppointmentManagementPage() {
  const router = useRouter();
  const {
    currentUser,
    appointments,
    acceptAppointment,
    declineAppointment,
    proposeNewAppointmentTime,
    completeAppointment,
    markNoShowAppointment,
    cancelAppointmentWithReason,
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

  // Multi-tenant isolation
  const myAppointments = useMemo(() => {
    return appointments.filter((a) => a.consultantId === activeConsultantId);
  }, [appointments, activeConsultantId]);

  // View state: "calendar" | "list" | "requests"
  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "requests">("calendar");
  const [calendarSubView, setCalendarSubView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 27)); // 27 Oct 2026 anchor

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected appointment for detail panel
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(
    myAppointments[0]?.id || null
  );

  const selectedAppointment = useMemo(() => {
    return myAppointments.find((a) => a.id === selectedAppointmentId) || null;
  }, [myAppointments, selectedAppointmentId]);

  // Modals
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [proposedDate, setProposedDate] = useState("2026-10-28");
  const [proposedTime, setProposedTime] = useState("02:00 PM");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Pending requests count
  const pendingRequests = useMemo(() => {
    return myAppointments.filter((a) => a.status === "pending");
  }, [myAppointments]);

  // Filtered appointments for list view
  const filteredAppointments = useMemo(() => {
    return myAppointments.filter((a) => {
      const matchSearch =
        a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.reference || (a as any).referenceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myAppointments, searchQuery, statusFilter]);

  // Calendar days generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Week days generation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Helpers
  const formatCustomerName = (apt: Appointment) => {
    if (apt.status === "pending") {
      const parts = apt.customerName.trim().split(" ");
      return `${parts[0]} ${parts[1] ? parts[1][0] + "." : ""}`;
    }
    return apt.customerName;
  };

  const getStatusBadgeVariant = (status: Appointment["status"]): "info" | "success" | "warning" | "dark" | "cream" | "outline" | "gold" | "danger" => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "gold";
      case "rescheduled":
        return "outline";
      case "cancelled":
      case "no_show":
        return "danger";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Appointments & Telemedicine Queue"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Appointments" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl p-1 bg-[#1A130B] border border-[#C99A45]/30">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "calendar"
                    ? "bg-[#C99A45] text-[#0B0907] font-semibold shadow-sm"
                    : "text-[#A89A85] hover:text-[#F5EDE0]"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Calendar
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "list"
                    ? "bg-[#C99A45] text-[#0B0907] font-semibold shadow-sm"
                    : "text-[#A89A85] hover:text-[#F5EDE0]"
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 relative ${
                  activeTab === "requests"
                    ? "bg-[#C99A45] text-[#0B0907] font-semibold shadow-sm"
                    : "text-[#A89A85] hover:text-[#F5EDE0]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Requests
                {pendingRequests.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-[#0B0907] text-[10px] font-bold inline-flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        }
      />

      {/* Main Grid: View + Detail Side Panel on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main pane (7 or 8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Calendar View */}
          {activeTab === "calendar" && (
            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
              {/* Calendar controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg text-[#F5EDE0] font-semibold">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        if (calendarSubView === "month") setCurrentDate(subMonths(currentDate, 1));
                        else if (calendarSubView === "week") setCurrentDate(subWeeks(currentDate, 1));
                        else setCurrentDate(subDays(currentDate, 1));
                      }}
                      className="p-1 rounded-lg bg-[#1A130B] border border-[#C99A45]/20 text-[#A89A85] hover:text-[#F5EDE0]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(2026, 9, 27))}
                      className="px-2 py-0.5 rounded-lg bg-[#1A130B] border border-[#C99A45]/20 text-xs text-[#E8C77A]"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        if (calendarSubView === "month") setCurrentDate(addMonths(currentDate, 1));
                        else if (calendarSubView === "week") setCurrentDate(addWeeks(currentDate, 1));
                        else setCurrentDate(addDays(currentDate, 1));
                      }}
                      className="p-1 rounded-lg bg-[#1A130B] border border-[#C99A45]/20 text-[#A89A85] hover:text-[#F5EDE0]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="inline-flex rounded-lg p-1 bg-[#1A130B] border border-[#C99A45]/20">
                  <button
                    onClick={() => setCalendarSubView("month")}
                    className={`px-2.5 py-1 text-xs rounded ${
                      calendarSubView === "month"
                        ? "bg-[#C99A45]/20 text-[#E8C77A] font-medium"
                        : "text-[#A89A85]"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarSubView("week")}
                    className={`px-2.5 py-1 text-xs rounded ${
                      calendarSubView === "week"
                        ? "bg-[#C99A45]/20 text-[#E8C77A] font-medium"
                        : "text-[#A89A85]"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarSubView("day")}
                    className={`px-2.5 py-1 text-xs rounded ${
                      calendarSubView === "day"
                        ? "bg-[#C99A45]/20 text-[#E8C77A] font-medium"
                        : "text-[#A89A85]"
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>

              {/* Month Calendar Grid */}
              {calendarSubView === "month" && (
                <div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#A89A85] py-2 border-b border-[#C99A45]/15">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-1">
                    {monthDays.map((day) => {
                      const dayKey = format(day, "yyyy-MM-dd");
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isSelected = isSameDay(day, currentDate);
                      const dayAppointments = myAppointments.filter(
                        (a) => a.date === dayKey && a.status !== "cancelled"
                      );

                      return (
                        <div
                          key={dayKey}
                          onClick={() => {
                            setCurrentDate(day);
                            if (dayAppointments.length > 0) {
                              setSelectedAppointmentId(dayAppointments[0].id);
                            }
                          }}
                          className={`min-h-[84px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#241A0F] border-[#E8C77A] shadow-md shadow-[#C99A45]/10"
                              : isCurrentMonth
                              ? "bg-[#1A130B]/70 border-[#C99A45]/10 hover:border-[#C99A45]/30"
                              : "bg-[#110D08]/40 border-transparent opacity-40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold ${
                                isSelected ? "text-[#E8C77A]" : "text-[#F5EDE0]"
                              }`}
                            >
                              {format(day, "d")}
                            </span>
                            {dayAppointments.length > 0 && (
                              <span className="w-4 h-4 rounded-full bg-[#E8C77A]/20 text-[#E8C77A] text-[9px] font-bold flex items-center justify-center">
                                {dayAppointments.length}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 mt-1 overflow-hidden">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointmentId(apt.id);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                                  apt.status === "confirmed"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : apt.status === "pending"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-[#C99A45]/20 text-[#E8C77A]"
                                }`}
                              >
                                {apt.time.split(" ")[0]} {formatCustomerName(apt)}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-[9px] text-[#A89A85] text-right">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {calendarSubView === "week" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const dayKey = format(day, "yyyy-MM-dd");
                      const dayAppointments = myAppointments.filter(
                        (a) => a.date === dayKey && a.status !== "cancelled"
                      );
                      const isTodayDate = isSameDay(day, new Date(2026, 9, 27));

                      return (
                        <div
                          key={dayKey}
                          className={`p-3 rounded-xl border min-h-[160px] flex flex-col ${
                            isTodayDate
                              ? "bg-[#241A0F] border-[#E8C77A]"
                              : "bg-[#1A130B] border-[#C99A45]/15"
                          }`}
                        >
                          <div className="text-center pb-2 border-b border-[#C99A45]/10">
                            <div className="text-[10px] uppercase font-bold text-[#A89A85]">
                              {format(day, "EEE")}
                            </div>
                            <div className="text-base font-serif font-bold text-[#F5EDE0]">
                              {format(day, "d")}
                            </div>
                          </div>

                          <div className="space-y-1.5 mt-2 flex-1">
                            {dayAppointments.length === 0 ? (
                              <div className="text-[10px] text-[#A89A85]/50 text-center py-4">
                                No calls
                              </div>
                            ) : (
                              dayAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  onClick={() => setSelectedAppointmentId(apt.id)}
                                  className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                                    selectedAppointmentId === apt.id
                                      ? "bg-[#C99A45]/20 border-[#E8C77A]"
                                      : "bg-[#0B0907] border-[#C99A45]/20 hover:border-[#C99A45]/40"
                                  }`}
                                >
                                  <div className="text-[10px] font-bold text-[#E8C77A]">
                                    {apt.time}
                                  </div>
                                  <div className="text-[11px] font-medium text-[#F5EDE0] truncate">
                                    {formatCustomerName(apt)}
                                  </div>
                                  <Badge
                                    variant={getStatusBadgeVariant(apt.status)}
                                    size="sm"
                                    className="mt-1 text-[9px] px-1 py-0"
                                  >
                                    {apt.status}
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day View */}
              {calendarSubView === "day" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#F5EDE0]">
                      Schedule for {format(currentDate, "EEEE, dd MMMM yyyy")}
                    </span>
                    <Badge variant="gold">
                      {
                        myAppointments.filter(
                          (a) => a.date === format(currentDate, "yyyy-MM-dd")
                        ).length
                      }{" "}
                      Sessions
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {myAppointments
                      .filter((a) => a.date === format(currentDate, "yyyy-MM-dd"))
                      .map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointmentId(apt.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedAppointmentId === apt.id
                              ? "bg-[#241A0F] border-[#E8C77A]"
                              : "bg-[#1A130B] border-[#C99A45]/15 hover:border-[#C99A45]/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 flex flex-col items-center justify-center">
                              <span className="text-xs font-bold text-[#E8C77A]">
                                {apt.time.split(" ")[0]}
                              </span>
                              <span className="text-[9px] text-[#A89A85]">
                                {apt.time.split(" ")[1]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm text-[#F5EDE0]">
                                {formatCustomerName(apt)}
                              </div>
                              <div className="text-xs text-[#A89A85]">
                                {apt.serviceTitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(apt.status)}>
                              {apt.status}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-[#A89A85]" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* List View */}
          {activeTab === "list" && (
            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
                  <Input
                    placeholder="Search by client name, reference, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#1A130B] border border-[#C99A45]/30 text-xs text-[#F5EDE0] rounded-xl px-3 py-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {filteredAppointments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#A89A85]">
                    No appointments matching your filters
                  </div>
                ) : (
                  filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointmentId(apt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedAppointmentId === apt.id
                          ? "bg-[#241A0F] border-[#E8C77A]"
                          : "bg-[#1A130B] border-[#C99A45]/15 hover:border-[#C99A45]/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#F5EDE0]">
                            {formatCustomerName(apt)}
                          </span>
                          <span className="text-xs text-[#A89A85] font-mono">
                            {apt.reference}
                          </span>
                          <Badge variant={getStatusBadgeVariant(apt.status)} size="sm">
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#A89A85]">
                          {apt.serviceTitle} • {apt.mode === "video" ? "Video Consultation" : "In-Clinic"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#E8C77A]">
                        <div className="text-right">
                          <div className="font-semibold">{apt.date}</div>
                          <div className="text-[#A89A85]">{apt.time}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A89A85]" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Requests View */}
          {activeTab === "requests" && (
            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg text-[#F5EDE0] font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Incoming Booking Requests
                  </h2>
                  <p className="text-xs text-[#A89A85]">
                    Requests submitted from the public booking engine or customer app awaiting doctor approval.
                  </p>
                </div>
                <Badge variant="warning">{pendingRequests.length} Pending</Badge>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#A89A85]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No pending consultation requests at this time.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-[#1A130B] border border-amber-500/30 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#F5EDE0]">
                              {formatCustomerName(req)}
                            </span>
                            <span className="text-xs text-[#A89A85] font-mono">
                              {req.reference}
                            </span>
                            <Badge variant="warning" size="sm">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-xs text-[#A89A85]">{req.serviceTitle}</p>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-semibold text-[#E8C77A]">
                            {req.date} at {req.time}
                          </span>
                        </div>
                      </div>

                      {req.concerns && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-[#A89A85]">Concerns:</span>
                          {req.concerns.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B0907] text-[#C99A45] border border-[#C99A45]/20"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {req.notes && (
                        <p className="text-xs text-[#A89A85] bg-[#0B0907] p-2.5 rounded-xl border border-[#C99A45]/15">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointmentId(req.id);
                            setProposeDialogOpen(true);
                          }}
                        >
                          Propose New Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedAppointmentId(req.id);
                            setDeclineDialogOpen(true);
                          }}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => {
                            acceptAppointment(req.id);
                            showToast.success(`Confirmed consultation for ${req.customerName}`);
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Booking
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right pane: Appointment Detail Side Panel (4 columns) */}
        <div className="lg:col-span-4">
          {selectedAppointment ? (
            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-5 sticky top-20">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A89A85]">
                    Ref: {selectedAppointment.reference}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#F5EDE0]">
                    {formatCustomerName(selectedAppointment)}
                  </h3>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                  {selectedAppointment.status}
                </Badge>
              </div>

              {/* Service & Mode */}
              <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 space-y-2">
                <div className="text-xs font-semibold text-[#E8C77A]">
                  {selectedAppointment.serviceTitle}
                </div>
                <div className="flex items-center justify-between text-xs text-[#A89A85]">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#E8C77A]" />
                    {selectedAppointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E8C77A]" />
                    {selectedAppointment.time}
                  </span>
                </div>
                <div className="text-xs text-[#A89A85] flex items-center gap-1">
                  {selectedAppointment.mode === "video" ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-[#38BDF8]" /> Video Consultation
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-[#5FAF7A]" /> In-Clinic Consultation
                    </>
                  )}
                </div>
              </div>

              {/* Privacy / Scan Sharing Status */}
              <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#A89A85] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#E8C77A]" />
                    Scan Sharing Consent:
                  </span>
                  <Badge
                    variant={selectedAppointment.shareScanConsent ? "success" : "warning"}
                    size="sm"
                  >
                    {selectedAppointment.shareScanConsent ? "Granted" : "Private (Locked)"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#A89A85]">
                  {selectedAppointment.shareScanConsent
                    ? "Patient has authorized clinical AI scan inspection."
                    : "Patient has kept scans private. Request access inside client file."}
                </p>
              </div>

              {/* Concerns */}
              {selectedAppointment.concerns && selectedAppointment.concerns.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[#A89A85]">
                    Reported Skin Concerns:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAppointment.concerns.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1A130B] text-[#C99A45] border border-[#C99A45]/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[#A89A85]">
                    Client Intake Note:
                  </span>
                  <p className="text-xs text-[#F5EDE0] bg-[#1A130B] p-2.5 rounded-xl border border-[#C99A45]/15">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#C99A45]/15">
                {selectedAppointment.status === "confirmed" && (
                  <Button asChild variant="gold" className="w-full">
                    <Link href={`/consultant/session/${selectedAppointment.id}`}>
                      <Video className="w-4 h-4 mr-2" /> Start Telemedicine Session
                    </Link>
                  </Button>
                )}

                {selectedAppointment.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="gold"
                      onClick={() => {
                        acceptAppointment(selectedAppointment.id);
                        showToast.success("Appointment accepted");
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-500/30"
                      onClick={() => setDeclineDialogOpen(true)}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link
                      href={`/consultant/clients?clientId=${selectedAppointment.customerId}`}
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Open Client File
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href="/consultant/messages">
                      <Mail className="w-3.5 h-3.5 mr-1" /> Message Client
                    </Link>
                  </Button>
                </div>

                {selectedAppointment.status === "confirmed" && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] text-emerald-400 hover:bg-emerald-500/10 flex-1"
                      onClick={() => {
                        completeAppointment(selectedAppointment.id);
                        showToast.success("Appointment marked as completed");
                      }}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] text-amber-400 hover:bg-amber-500/10 flex-1"
                      onClick={() => {
                        markNoShowAppointment(selectedAppointment.id);
                        showToast.info("Marked as patient no-show");
                      }}
                    >
                      Mark No-Show
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] text-red-400 hover:bg-red-500/10"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Activity Trail */}
              <div className="space-y-2 pt-2 border-t border-[#C99A45]/15">
                <span className="text-xs font-semibold text-[#A89A85]">
                  Audit & Activity Log:
                </span>
                <div className="space-y-2 text-[11px]">
                  {selectedAppointment.activityLog?.map((act, i) => (
                    <div key={i} className="flex items-start gap-2 text-[#A89A85]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8C77A] mt-1 shrink-0" />
                      <div>
                        <span className="text-[#F5EDE0]">{act.action}</span> by{" "}
                        <span className="text-[#E8C77A]">{act.actor}</span>
                        <div className="text-[10px] text-[#A89A85]/70">
                          {act.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-[#140F0A] border-[#C99A45]/20 text-xs text-[#A89A85]">
              Select an appointment to inspect client details and session actions.
            </Card>
          )}
        </div>
      </div>

      {/* Decline Reason Dialog */}
      <ResponsiveDialog
        open={declineDialogOpen}
        onOpenChange={setDeclineDialogOpen}
        title="Decline Consultation Request"
        description="Provide a polite clinical or scheduling reason. The patient will be notified immediately."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. Doctor is engaged in emergency clinical procedures during this slot. Please pick an alternative hour."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedAppointment) {
                  declineAppointment(
                    selectedAppointment.id,
                    declineReason || "Doctor slot unavailable"
                  );
                  showToast.info("Consultation request declined");
                }
                setDeclineDialogOpen(false);
                setDeclineReason("");
              }}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Propose New Time Dialog */}
      <ResponsiveDialog
        open={proposeDialogOpen}
        onOpenChange={setProposeDialogOpen}
        title="Propose Alternative Consultation Time"
        description="Select an available slot on your schedule. The patient will receive a notification to accept or request another."
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A89A85] mb-1 block">New Date</label>
              <Input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[#A89A85] mb-1 block">New Slot</label>
              <select
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                className="w-full bg-[#1A130B] border border-[#C99A45]/30 text-xs text-[#F5EDE0] rounded-xl px-3 py-2"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:30 PM">04:30 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setProposeDialogOpen(false)}>
              Back
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                if (selectedAppointment) {
                  proposeNewAppointmentTime(
                    selectedAppointment.id,
                    proposedDate,
                    proposedTime
                  );
                  showToast.success(
                    `Proposed new time (${proposedDate} at ${proposedTime}) sent to patient`
                  );
                }
                setProposeDialogOpen(false);
              }}
            >
              Send Proposal
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Cancel Appointment Dialog */}
      <ResponsiveDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Confirmed Consultation"
        description="This will cancel the booking, release the slot, and refund or credit the client."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelDialogOpen(false)}>
              Dismiss
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedAppointment) {
                  cancelAppointmentWithReason(
                    selectedAppointment.id,
                    cancelReason || "Cancelled by doctor"
                  );
                  showToast.info("Appointment cancelled");
                }
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
