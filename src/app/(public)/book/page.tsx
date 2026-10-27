"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  isBefore,
  startOfToday,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import servicesData from "@/data/services.json";
import consultantsData from "@/data/consultants.json";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeConsultants = useAppStore((s) => s.consultants);
  const activeConsultants = useMemo(() => {
    return (storeConsultants || []).filter(
      (c) => c.status !== "suspended" && !(c as any).pauseBookings
    );
  }, [storeConsultants]);

  const initialServiceId = searchParams.get("service") || servicesData[0]?.id || "srv-1";
  const initialExpertId = searchParams.get("expert") || activeConsultants[0]?.id || "cons-1";

  // Step State: 1 = Service & Expert, 2 = Date & Time, 3 = Details & Concerns, 4 = Review & Confirm, 5 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form Selections
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedExpertId, setSelectedExpertId] = useState(initialExpertId);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("11:00 AM");

  // Customer details & Scan sharing consent
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [shareScansConsent, setShareScansConsent] = useState(true);

  // Final confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    dateStr: string;
    time: string;
    serviceTitle: string;
    consultantName: string;
    fee: number;
  } | null>(null);

  const bookAppointment = useAppStore((s) => s.bookAppointment);

  const selectedService = useMemo(
    () => servicesData.find((s) => s.id === selectedServiceId) || servicesData[0],
    [selectedServiceId]
  );

  const selectedConsultant = useMemo(
    () => activeConsultants.find((c) => c.id === selectedExpertId) || activeConsultants[0] || (storeConsultants[0]),
    [selectedExpertId, activeConsultants, storeConsultants]
  );

  // Skin concern options
  const concernOptions = [
    "Melasma & Pigmentation",
    "Acne & Congestion",
    "Fine Lines & Elasticity",
    "Barrier Sensitivity & Redness",
    "Uneven Texture",
    "Dehydration",
  ];

  const handleToggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  // Calendar dates generation (next 14 days)
  const today = startOfToday();
  const availableDates = useMemo(() => {
    return eachDayOfInterval({
      start: addDays(today, 1),
      end: addDays(today, 14),
    });
  }, [today]);

  const timeSlots = [
    { time: "10:00 AM", available: true },
    { time: "11:30 AM", available: true },
    { time: "02:00 PM", available: false }, // simulate booked
    { time: "03:30 PM", available: true },
    { time: "05:00 PM", available: true },
    { time: "06:30 PM", available: true },
  ];

  // Validation
  const validateStep = () => {
    if (currentStep === 1) {
      if (!selectedServiceId || !selectedExpertId) {
        toast.error("Please select a service and consultant.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!selectedDate || !selectedTimeSlot) {
        toast.error("Please choose a valid date and time slot.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!name.trim() || name.length < 2) {
        toast.error("Please enter your full name.");
        return false;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address.");
        return false;
      }
      if (!phone.trim() || phone.length < 10) {
        toast.error("Please enter a valid 10-digit phone number.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmBooking = () => {
    const refNumber = `CA-${format(new Date(), "yyyyMM")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const newCustomerId = `cust-${Date.now()}`;
    const appointment = {
      id: `apt-${Date.now()}`,
      consultantId: selectedConsultant.id,
      consultantName: selectedConsultant.name,
      customerId: newCustomerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceTitle: selectedService.title,
      date: formattedDate,
      time: selectedTimeSlot,
      status: "pending" as const,
      mode: "video" as const,
      concerns: selectedConcerns,
      notes: notes,
      reference: refNumber,
      shareScanConsent: shareScansConsent,
      pricePaise: (selectedConsultant.pricePaise || 150000),
      meetLink: `/consultant/session/apt-${Date.now()}`,
      activityLog: [
        {
          timestamp: new Date().toISOString(),
          action: "Booking submitted by patient from public portal",
          actor: name,
        },
      ],
    };

    bookAppointment(appointment as any);

    if (shareScansConsent) {
      useAppStore.getState().grantScanShareConsent(newCustomerId, selectedConsultant.id);
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#F3E5AB", "#AA771C", "#FFFFFF"],
    });

    setConfirmedBooking({
      reference: refNumber,
      dateStr: format(selectedDate, "EEEE, MMMM dd, yyyy"),
      time: selectedTimeSlot,
      serviceTitle: selectedService.title,
      consultantName: selectedConsultant.name,
      fee: selectedService.price,
    });

    setCurrentStep(5);
    toast.success(`Consultation Reserved! Reference: ${refNumber}`);
  };

  // Generate .ics file download
  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const dateFormatted = format(selectedDate, "yyyyMMdd");
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Celebs Alley//Consultation Booking//EN
BEGIN:VEVENT
SUMMARY:Celebs Alley Consultation: ${confirmedBooking.serviceTitle}
DESCRIPTION:Consultation with ${confirmedBooking.consultantName}. Reference: ${confirmedBooking.reference}
DTSTART:${dateFormatted}T100000Z
DTEND:${dateFormatted}T110000Z
LOCATION:Celebs Alley Virtual Clinic / Kota Flagship
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `CelebsAlley-${confirmedBooking.reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar invite downloaded (.ics)");
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <SectionHeading
            label="Clinical Concierge Reservation"
            title="Book Your Bespoke Consultation"
            accentWord="Sanctuary"
          />
          <p className="text-xs sm:text-sm text-text-secondary">
            Select your clinical treatment, preferred aesthetic dermatologist, and convenient consultation slot.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {currentStep < 5 && (
          <div className="max-w-3xl mx-auto flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-bg-elevated -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-gold-400 -translate-y-1/2 transition-all duration-500 z-0"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {[
              { num: 1, label: "Treatment & Expert" },
              { num: 2, label: "Date & Time" },
              { num: 3, label: "Your Profile" },
              { num: 4, label: "Confirmation" },
            ].map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-gold-500 text-bg-base shadow-gold-sm"
                        : isCurrent
                        ? "bg-bg-surface border-2 border-gold-400 text-gold-300 shadow-gold-sm"
                        : "bg-bg-elevated border border-gold-500/20 text-text-muted"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-heading hidden sm:block ${
                      isCurrent ? "text-gold-300 font-semibold" : "text-text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step Content Layout: 2 Columns on Desktop */}
        {currentStep < 5 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Step Form Content (8 cols) */}
            <div className="lg:col-span-8 p-6 sm:p-10 rounded-3xl bg-bg-surface border border-gold-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: Choose Service & Expert */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-heading font-bold text-text-primary">
                        1. Select Clinical Treatment Protocol
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        Choose your desired dermatological procedure or virtual diagnostic session.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {servicesData.map((srv) => {
                        const isSelected = srv.id === selectedServiceId;
                        return (
                          <button
                            key={srv.id}
                            onClick={() => setSelectedServiceId(srv.id)}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-bg-elevated border-gold-400 shadow-gold-sm"
                                : "bg-bg-base/60 border-gold-500/20 hover:border-gold-500/40"
                            }`}
                          >
                            <span className="text-xs font-semibold text-gold-400">
                              {srv.category}
                            </span>
                            <h4 className="text-sm font-heading font-bold text-text-primary mt-1 line-clamp-1">
                              {srv.title}
                            </h4>
                            <div className="flex items-center justify-between mt-3 text-xs">
                              <span className="text-text-muted">{srv.durationMinutes} mins</span>
                              <span className="font-bold text-gold-300">
                                ₹{srv.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-gold-500/15">
                      <h3 className="text-lg font-heading font-bold text-text-primary mb-2">
                        Select Attending Dermatologist
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {consultantsData.map((cons) => {
                          const isSelected = cons.id === selectedExpertId;
                          return (
                            <button
                              key={cons.id}
                              onClick={() => setSelectedExpertId(cons.id)}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                                isSelected
                                  ? "bg-bg-elevated border-gold-400 shadow-gold-sm"
                                  : "bg-bg-base/60 border-gold-500/20 hover:border-gold-500/40"
                              }`}
                            >
                              <div className="relative w-12 h-12 rounded-xl bg-bg-surface overflow-hidden shrink-0 border border-gold-500/20">
                                <ImageWithFallback
                                  src={cons.avatar}
                                  alt={cons.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-xs font-heading font-bold text-text-primary">
                                  {cons.name}
                                </h4>
                                <span className="text-[11px] text-gold-400 block">
                                  {cons.title.split(",")[0]}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Pick Date & Time */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-heading font-bold text-text-primary">
                        2. Select Date & Time Slot
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        Upcoming appointment slots available for {selectedConsultant.name}.
                      </p>
                    </div>

                    {/* Date Horizontal Carousel */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gold-300 block">Choose Date:</span>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {availableDates.map((date) => {
                          const isSelected = isSameDay(date, selectedDate);
                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => setSelectedDate(date)}
                              className={`min-w-[80px] p-3 rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${
                                isSelected
                                  ? "bg-gradient-to-b from-gold-600 to-gold-400 text-bg-base font-bold shadow-gold-sm"
                                  : "bg-bg-elevated border-gold-500/20 text-text-secondary hover:text-gold-300"
                              }`}
                            >
                              <span className="text-[10px] uppercase block tracking-wider opacity-80">
                                {format(date, "EEE")}
                              </span>
                              <span className="text-base font-heading font-bold block mt-0.5">
                                {format(date, "dd")}
                              </span>
                              <span className="text-[10px] block opacity-80">
                                {format(date, "MMM")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2 pt-2 border-t border-gold-500/15">
                      <span className="text-xs font-semibold text-gold-300 block">
                        Available Time Slots for {format(selectedDate, "MMM dd, yyyy")}:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {timeSlots.map((slot) => {
                          const isSelected = selectedTimeSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              className={`p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                                !slot.available
                                  ? "bg-bg-base/40 border-border-subtle text-text-muted opacity-40 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-gold-500/20 border-gold-400 text-gold-300 font-bold shadow-gold-sm cursor-pointer"
                                  : "bg-bg-elevated border-gold-500/20 text-text-secondary hover:text-gold-300 cursor-pointer"
                              }`}
                            >
                              <span>{slot.time}</span>
                              <span className="text-[10px]">
                                {slot.available ? "Open" : "Booked"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Details & Skin Concerns */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-heading font-bold text-text-primary">
                        3. Patron Information & Skin Profile
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        Provide contact info for appointment sync and initial clinical preparation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Radhika Singhania"
                          className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="radhika@example.com"
                          className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                        WhatsApp / Phone Number *
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98244 24455"
                        className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gold-500/15">
                      <span className="text-xs font-semibold text-gold-300 block">
                        Primary Skin Concerns (Select all that apply):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {concernOptions.map((concern) => {
                          const isSelected = selectedConcerns.includes(concern);
                          return (
                            <button
                              key={concern}
                              type="button"
                              onClick={() => handleToggleConcern(concern)}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-gold-500/20 border-gold-400 text-gold-300 font-medium"
                                  : "bg-bg-elevated border-gold-500/15 text-text-secondary hover:text-gold-300"
                              }`}
                            >
                              {concern}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                        Additional Notes for Dermatologist (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Mention any existing allergies, current active serums, or pregnancy status..."
                        className="w-full p-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 resize-none"
                      />
                    </div>

                    {/* Step 3 Consent Checkbox */}
                    <div className="p-4 rounded-2xl bg-bg-elevated border border-gold-500/20 space-y-1">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareScansConsent}
                          onChange={(e) => setShareScansConsent(e.target.checked)}
                          className="mt-0.5 accent-[#C99A45] rounded w-4 h-4"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                            Share my AI facial diagnostic scans with my consultant
                          </span>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            Authorizes {selectedConsultant.name} to inspect your 8-parameter skin scan, radar charts, and progress during the consultation. You can revoke this anytime in your Privacy settings.
                          </p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Review and Confirm */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-heading font-bold text-text-primary">
                        4. Review and Authorize Reservation
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        Confirm your appointment details below before final dispatch.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-bg-elevated border border-gold-500/20 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gold-500/15">
                        <span className="text-xs text-text-muted uppercase tracking-wider">Treatment</span>
                        <span className="text-sm font-heading font-bold text-gold-300">
                          {selectedService.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gold-500/15">
                        <span className="text-xs text-text-muted uppercase tracking-wider">Dermatologist</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {selectedConsultant.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gold-500/15">
                        <span className="text-xs text-text-muted uppercase tracking-wider">Date & Time</span>
                        <span className="text-sm font-mono text-gold-300">
                          {format(selectedDate, "EEEE, MMMM dd, yyyy")} at {selectedTimeSlot}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gold-500/15">
                        <span className="text-xs text-text-muted uppercase tracking-wider">Patron</span>
                        <span className="text-sm text-text-primary">
                          {name} ({phone})
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-text-primary">Total Consultation Fee</span>
                        <span className="text-2xl font-heading font-bold text-gold-300">
                          ₹{selectedService.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted text-center">
                      Payment is settled directly during check-in or via digital invoice after your consultation.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="pt-6 border-t border-gold-500/20 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="border-gold-500/30 text-gold-300 text-xs py-2 px-4"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={handleNext}
                    className="text-xs py-2 px-6 font-semibold uppercase tracking-wider shadow-gold-sm"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={handleConfirmBooking}
                    className="text-xs py-2.5 px-6 font-semibold uppercase tracking-wider shadow-gold-sm hover:shadow-gold-md"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Confirm Reservation
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Live Summary Card (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
              <span className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400 block">
                Live Reservation Summary
              </span>

              <div className="space-y-3 text-xs text-text-secondary">
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-1">
                  <span className="text-[10px] text-text-muted block">Selected Treatment</span>
                  <p className="font-heading font-bold text-text-primary">{selectedService.title}</p>
                  <p className="text-gold-400 font-semibold">₹{selectedService.price.toLocaleString("en-IN")}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-1">
                  <span className="text-[10px] text-text-muted block">Attending Clinician</span>
                  <p className="font-semibold text-text-primary">{selectedConsultant.name}</p>
                  <p className="text-text-muted">{selectedConsultant.title}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-1">
                  <span className="text-[10px] text-text-muted block">Appointment Timing</span>
                  <p className="font-mono text-gold-300">
                    {format(selectedDate, "EEE, MMM dd, yyyy")}
                  </p>
                  <p className="font-mono text-text-primary">{selectedTimeSlot}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 5: Success Screen */
          <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-bg-surface border border-gold-500/40 text-center space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
                Reservation Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                Your Appointment Is Scheduled
              </h2>
            </div>

            {confirmedBooking && (
              <div className="p-6 rounded-2xl bg-bg-elevated border border-gold-500/25 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gold-500/15">
                  <span className="text-text-muted">Booking Reference</span>
                  <span className="font-mono font-bold text-gold-300 text-sm">
                    {confirmedBooking.reference}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Treatment</span>
                  <span className="font-semibold text-text-primary">{confirmedBooking.serviceTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Dermatologist</span>
                  <span className="text-text-primary">{confirmedBooking.consultantName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Scheduled Slot</span>
                  <span className="font-mono text-gold-300">
                    {confirmedBooking.dateStr} at {confirmedBooking.time}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              A calendar confirmation and secure video consultation link have been generated and dispatched to your email and WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="gold"
                size="md"
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Add to Calendar (.ics)
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto border-gold-500/40 text-gold-300">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold-400">Loading Booking Wizard...</div>}>
      <BookingContent />
    </Suspense>
  );
}
