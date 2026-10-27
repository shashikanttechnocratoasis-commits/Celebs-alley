"use client";

import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { useAppStore } from "@/store";
import { toast } from "sonner";

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const subscribeNewsletter = useAppStore((s) => s.subscribeNewsletter);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const res = subscribeNewsletter(email);
      setSubmitting(false);
      if (res.success) {
        setSubscribed(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.85 },
          colors: ["#D4AF37", "#F3E5AB", "#AA771C", "#FFFFFF"],
        });
        toast.success(res.message);
        setEmail("");
      } else {
        toast.info(res.message);
      }
    }, 400);
  };

  return (
    <footer className="relative bg-bg-surface border-t border-gold-500/20 text-text-secondary pt-16 pb-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Logo variant="full" surface="dark" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed pr-4">
              India&apos;s premier AI-powered luxury beauty and clinical wellness ecosystem. Harmonizing 24K gold Ayurvedic alchemy with deep multi-spectral dermatological diagnostics.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-200"
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
                className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-200"
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
                className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-gold-200 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gold-300 transition-colors">
                  Clinical Services
                </Link>
              </li>
              <li>
                <Link href="/technology" className="hover:text-gold-300 transition-colors">
                  AI Technology
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold-300 transition-colors">
                  Formulations & Shop
                </Link>
              </li>
              <li>
                <Link href="/experts" className="hover:text-gold-300 transition-colors">
                  MD Dermatologists
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-300 transition-colors">
                  Scientific Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
              Assistance & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/book" className="hover:text-gold-300 transition-colors">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold-300 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-gold-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-gold-300 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/consent" className="hover:text-gold-300 transition-colors">
                  AI Biometric Consent
                </Link>
              </li>
              <li className="pt-2 border-t border-gold-500/15">
                <Link href="/seller/register" className="text-gold-400 font-semibold hover:text-gold-200 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/login" className="hover:text-gold-300 transition-colors">
                  Distributor Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Kota Headquarters (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
              The Royal Gazette
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Subscribe for proprietary dermatological insights, early access to limited gold formulations, and seasonal skin calibration tips.
            </p>

            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full h-11 pl-3.5 pr-24 rounded-xl bg-bg-elevated/80 border border-gold-500/30 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
              <button
                type="submit"
                disabled={submitting}
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  "Sending..."
                ) : subscribed ? (
                  <CheckCircle2 className="w-4 h-4 text-bg-base" />
                ) : (
                  <>
                    <span>Join</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 space-y-2 border-t border-gold-500/15 text-xs text-text-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Heritage Square, Civil Lines, Kota, Rajasthan 324001, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <a href="tel:+919824424455" className="hover:text-gold-300">
                  +91 98244 24455
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <a href="mailto:connect@celebsalley.com" className="hover:text-gold-300">
                  connect@celebsalley.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <GoldDivider className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3">
          <p>© 2026 Celebs Alley. All rights reserved. Registered under Rajasthan Cosmeceutical Council.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gold-400/80">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Biometric Encrypted
            </span>
            <Link href="/demo" className="text-gold-400 hover:text-gold-200 transition-colors font-mono text-[11px] underline underline-offset-4">
              Demo Hub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
