"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { Calendar, CheckCircle2, User, Phone, Mail, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import servicesData from "@/data/services.json";
import consultantsData from "@/data/consultants.json";

const quickBookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^[0-9+ -]{10,15}$/, "Please enter a valid 10-digit phone number"),
  serviceId: z.string().min(1, "Please select a treatment service"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time slot"),
});

type QuickBookingFormData = z.infer<typeof quickBookingSchema>;

export function QuickBookingForm() {
  const [successBooking, setSuccessBooking] = useState<{
    reference: string;
    serviceName: string;
    date: string;
    time: string;
  } | null>(null);

  const bookAppointment = useAppStore((s) => s.bookAppointment);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickBookingFormData>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      serviceId: servicesData[0]?.id || "",
      preferredTime: "11:00 AM",
    },
  });

  const onSubmit = async (data: QuickBookingFormData) => {
    // Generate booking reference
    const refNumber = `CA-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedService = servicesData.find((s) => s.id === data.serviceId);
    const assignedConsultant = consultantsData[0];

    const appointment = {
      id: `apt-${Date.now()}`,
      consultantId: assignedConsultant?.id || "cons-1",
      consultantName: assignedConsultant?.name || "Dr. Meera Nambiar",
      customerId: `cust-${Date.now()}`,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      serviceTitle: selectedService?.title || "AI Skin Analysis & Consultation",
      date: data.preferredDate,
      time: data.preferredTime,
      status: "pending" as const,
      reference: refNumber,
      notes: "Quick consultation booking via Home page.",
    };

    bookAppointment(appointment);

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#D4AF37", "#B8860B", "#F3E5AB", "#AA771C"],
    });

    setSuccessBooking({
      reference: refNumber,
      serviceName: selectedService?.title || "AI Consultation",
      date: data.preferredDate,
      time: data.preferredTime,
    });

    toast.success(`Consultation requested! Reference: ${refNumber}`);
    reset();
  };

  if (successBooking) {
    return (
      <div className="bg-bg-elevated/90 border border-gold-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
        <div className="w-14 h-14 mx-auto rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-heading uppercase tracking-widest text-gold-400 font-semibold">
          Booking Confirmed (Pending MD Sync)
        </span>
        <h3 className="text-xl font-heading font-bold text-text-primary">
          Reference: <span className="text-gold-300 font-mono">{successBooking.reference}</span>
        </h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          We have reserved your slot for <strong>{successBooking.serviceName}</strong> on{" "}
          <strong>{successBooking.date}</strong> at <strong>{successBooking.time}</strong>. Our clinical coordinator will reach out on WhatsApp/phone to confirm.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuccessBooking(null)}
            className="border-gold-500/40 text-gold-300"
          >
            Book Another Consultation
          </Button>
        </div>
      </div>
    );
  }

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-bg-surface/90 border border-gold-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4 text-text-primary"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register("name")}
              placeholder="e.g. Radhika Singhania"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register("phone")}
              placeholder="+91 98244 24455"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register("email")}
              type="email"
              placeholder="radhika@example.com"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Treatment Service */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Select Treatment *
          </label>
          <select
            {...register("serviceId")}
            className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          >
            {servicesData.map((srv) => (
              <option key={srv.id} value={srv.id} className="bg-bg-surface text-text-primary">
                {srv.title} (₹{srv.price.toLocaleString("en-IN")})
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="text-xs text-rose-400 mt-1">{errors.serviceId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Date */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Preferred Date *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register("preferredDate")}
              type="date"
              min={minDateStr}
              defaultValue={minDateStr}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            />
          </div>
          {errors.preferredDate && (
            <p className="text-xs text-rose-400 mt-1">{errors.preferredDate.message}</p>
          )}
        </div>

        {/* Preferred Time Slot */}
        <div>
          <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
            Preferred Time Slot *
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              {...register("preferredTime")}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            >
              <option value="10:00 AM">10:00 AM – 11:00 AM</option>
              <option value="11:30 AM">11:30 AM – 12:30 PM</option>
              <option value="02:00 PM">02:00 PM – 03:00 PM</option>
              <option value="04:00 PM">04:00 PM – 05:00 PM</option>
              <option value="06:00 PM">06:00 PM – 07:00 PM</option>
            </select>
          </div>
          {errors.preferredTime && (
            <p className="text-xs text-rose-400 mt-1">{errors.preferredTime.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={isSubmitting}
        leftIcon={!isSubmitting ? <Sparkles className="w-4 h-4" /> : undefined}
        className="w-full justify-center text-sm font-semibold uppercase tracking-wider py-3.5 shadow-gold-sm hover:shadow-gold-md mt-2"
      >
        {isSubmitting ? "Securing Slot..." : "Confirm Consultation Reservation"}
      </Button>
      <p className="text-center text-[11px] text-text-muted">
        No upfront payment required for slot reservation. You can modify or cancel at any time.
      </p>
    </form>
  );
}
