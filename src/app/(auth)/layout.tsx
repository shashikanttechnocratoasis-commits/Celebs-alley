"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { GoldDust } from "@/components/ui/GoldDust";
import { FaceScanGraphic } from "@/components/shared/FaceScanGraphic";
import { useAppStore } from "@/store";
import { ShieldCheck, Sparkles, ArrowRight, Activity, Lock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const currentRole = useAppStore((s) => s.currentRole);

  // If user is already logged in, redirect them to their panel home
  useEffect(() => {
    if (currentUser) {
      if (currentRole === "Customer") {
        router.push("/app");
      } else if (currentRole.includes("Distributor") || currentRole === "Sales Executive" || currentRole === "Inventory Manager") {
        router.push("/seller");
      } else if (currentRole === "Consultant") {
        router.push("/consultant");
      } else {
        router.push("/admin");
      }
    }
  }, [currentUser, currentRole, router]);

  return (
    <div className="min-h-screen w-full bg-[#0B0907] text-[#F5EDE0] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#C99A45]/30">
      {/* Background Cinematic Gold Dust */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <GoldDust count={35} speed={0.4} />
      </div>

      {/* Ambient Top Glow */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#C99A45]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <Logo variant="full" surface="dark" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-text-muted">Need platform exploration?</span>
          <Link
            href="/demo"
            className="px-3 py-1.5 rounded-full border border-gold-500/30 text-gold-300 hover:text-gold-200 hover:border-gold-400 hover:bg-gold-500/10 font-mono text-[11px] transition-all"
          >
            Demo Hub →
          </Link>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-6 sm:py-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Brand Panel (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/35 text-gold-300 text-xs font-semibold uppercase tracking-widest self-start">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Biometric Dermatology Portal</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-heading font-bold text-text-primary leading-tight">
              Unlock Your Skin’s{" "}
              <span className="italic text-gold-300 font-serif">Algorithmic Precision</span>
            </h1>

            <p className="text-base text-text-secondary leading-relaxed">
              Step into your personalized clinical dashboard. Track 8 sub-surface biomarkers, receive zero-filler formulations, and connect directly with certified aesthetic dermatologists.
            </p>

            {/* Embedded SVG Visual Biometric Scan Mini */}
            <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden border border-gold-500/35 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
              <FaceScanGraphic
                showScanLine={true}
                showMesh={true}
                showLandmarks={true}
                showZones={true}
                animated={true}
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gold-500/20 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Knowledge Face Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Lock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>AES-256 Client-Side Security</span>
              </div>
            </div>
          </div>

          {/* Right Form Card Container */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md sm:max-w-lg bg-bg-surface/95 border border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gold-500/15 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3">
        <p>© 2026 Celebs Alley. Registered under Indian Ayush & Clinical Cosmeceutical Board.</p>
        <div className="flex items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-gold-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="hover:text-gold-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/demo" className="text-gold-400 font-mono text-[11px] hover:underline">
            Skip to Demo Hub
          </Link>
        </div>
      </footer>
    </div>
  );
}
