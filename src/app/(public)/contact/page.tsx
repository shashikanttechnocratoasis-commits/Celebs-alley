"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import siteSettings from "@/data/siteSettings.json";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Please specify a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const addInquiry = useAppStore((s) => s.addInquiry);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    addInquiry({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#D4AF37", "#F3E5AB", "#AA771C", "#FFFFFF"],
    });

    setSubmitted(true);
    toast.success("Inquiry received! Our clinical concierge will respond within 24 hours.");
    reset();
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SectionHeading
            label="Kota Headquarters & Concierge"
            title="Connect with Our Clinical Team"
            accentWord="Hospitality"
          />
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Whether you seek bespoke treatment consultation, partnership opportunities, or technical assistance with your AI analysis, we welcome your inquiry.
          </p>
        </div>

        {/* Main Grid: Form & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Validated Contact Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-bg-surface border border-gold-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-text-primary">
                  Inquiry Dispatched to Concierge
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  Thank you for reaching out. An assigned clinical advisor in Kota will review your message and connect via email or phone within one business day.
                </p>
                <div className="pt-2">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="uppercase tracking-wider text-xs font-semibold"
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      {...register("name")}
                      placeholder="e.g. Maharani Gayatri"
                      className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="gayatri@example.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="+91 98244 24455"
                      className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                      Inquiry Subject *
                    </label>
                    <input
                      {...register("subject")}
                      placeholder="e.g. Melasma Treatment Consultation"
                      className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    />
                    {errors.subject && (
                      <p className="text-xs text-rose-400 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    placeholder="Describe your skin goals or inquiry in detail..."
                    className="w-full p-3.5 rounded-xl bg-bg-elevated border border-gold-500/25 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full justify-center uppercase tracking-widest text-xs font-semibold py-3.5 shadow-gold-sm hover:shadow-gold-md"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Transmitting..." : "Send Message to Concierge"}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Cards & Stylized Map (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Details Card */}
            <div className="p-6 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
              <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-gold-400">
                Direct Communication Lines
              </h3>

              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-gold-500/15">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block">Kota Headquarters</span>
                    <span>{siteSettings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-gold-500/15">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block">Concierge Desk</span>
                    <a href="tel:+919824424455" className="hover:text-gold-300">
                      {siteSettings.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-gold-500/15">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block">Clinical Inquiries</span>
                    <a href="mailto:connect@celebsalley.com" className="hover:text-gold-300">
                      {siteSettings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-gold-500/15">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block">Operating Hours</span>
                    <span>{siteSettings.businessHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:bg-gold-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:bg-gold-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:bg-gold-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Stylized Illustrated SVG Map Block (No external map embed) */}
            <div className="p-6 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-gold-400 block">
                Flagship Location Map
              </span>
              <div className="relative aspect-[16/9] rounded-2xl bg-bg-elevated border border-gold-500/20 overflow-hidden flex items-center justify-center">
                {/* Stylized SVG Map Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Pin in center */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-gold-500 text-bg-base flex items-center justify-center shadow-gold-md animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-heading font-bold text-gold-300 bg-bg-base/90 px-3 py-0.5 rounded-full border border-gold-500/40">
                    Kota, Rajasthan 324001
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
