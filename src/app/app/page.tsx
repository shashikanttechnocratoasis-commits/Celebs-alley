"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Camera, 
  ShoppingBag, 
  Calendar, 
  Package, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FaceScanGraphic } from "@/components/shared/FaceScanGraphic";
import { ProductCard } from "@/components/shop/ProductCard";
import { generateRecommendations } from "@/lib/recommendEngine";
import { computeOverallScore } from "@/lib/scanEngine";
import skinTipsData from "@/data/skinTips.json";
import productsData from "@/data/products.json";
import type { Product } from "@/types";

const initialProducts = productsData as unknown as Product[];

export default function CustomerDashboardPage() {
  const { customerProfile, scans, currentUser, orders, cart, sellers, parameters, inventory } = useAppStore();

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Rotate skin tip every 8 seconds
  useEffect(() => {
    if (!skinTipsData || skinTipsData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % skinTipsData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const latestScan = scans && scans.length > 0 ? scans[0] : null;

  const latestScanScore = useMemo(() => {
    if (!latestScan) return 80;
    return computeOverallScore(latestScan, parameters);
  }, [latestScan, parameters]);

  const displayName = customerProfile?.name || currentUser?.name || "Skin Connoisseur";

  // Check setup completion checklist
  const hasConsent = Boolean(customerProfile?.consent);
  const hasQuestionnaire = Boolean(customerProfile?.questionnaire);
  const hasFirstScan = Boolean(scans && scans.length > 0);
  const isOnboardingComplete = Boolean(customerProfile?.onboardingCompleted);

  const completedStepsCount = [hasConsent, hasQuestionnaire, hasFirstScan].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 3) * 100);

  const currentTip = skinTipsData[currentTipIndex] || skinTipsData[0];

  // Active Orders (placed, processing, dispatched)
  const activeOrder = orders?.find(
    (o) => o.status !== "cancelled" && o.status !== "refunded"
  );

  // Top Recommendations from engine
  const recommendations = useMemo(() => {
    return generateRecommendations({
      scan: latestScan,
      questionnaire: customerProfile?.questionnaire,
      parameters,
      products: initialProducts,
      sellers,
      inventory,
    });
  }, [latestScan, customerProfile?.questionnaire, parameters, sellers, inventory]);

  const topFourPicks = recommendations.topPicks.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E8C77A]">
            <Sparkles className="w-3.5 h-3.5" /> LUXURY CELLULAR WELLNESS
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5EDE0] font-normal tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A89A85]">
            Your personalized skin diagnostic portal and circadian regimen manager.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#1A130B]/90 border border-[#C99A45]/30 text-xs text-[#F5EDE0] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Biometric Sync: <strong className="text-[#E8C77A]">Active</strong></span>
          </div>
        </div>
      </div>

      {/* Setup Incomplete Banner */}
      {!isOnboardingComplete && (
        <Card className="p-5 bg-gradient-to-r from-amber-500/15 via-[#1A130B] to-[#0B0907] border border-amber-500/35 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-base text-[#F5EDE0] font-normal">
                  Complete Your Diagnostic Profile ({progressPercent}%)
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Finish your consent and lifestyle questionnaire to unlock full 8-parameter diagnostic precision.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 shadow-gold-glow">
              <Link href="/app/onboarding">
                Finish Setup <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Active Order Card */}
      {activeOrder && (
        <Card className="p-5 bg-gradient-to-r from-[#1A130B] via-[#241A0F] to-[#1A130B] border border-[#C99A45]/35 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] shrink-0 shadow-gold-glow">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base text-[#F5EDE0] font-normal">
                  Active Shipment: Order #{activeOrder.id}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-500/30">
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-[#A89A85] mt-0.5">
                {(activeOrder.shipments?.length || 1)} package(s) via BlueDart Express • Delivery to {activeOrder.shippingAddress.city}
              </p>
            </div>
          </div>

          <Button asChild size="sm" variant="outline" className="border-[#C99A45]/40 text-[#E8C77A] hover:bg-[#241A0F] hover:border-[#E8C77A] shadow-sm shrink-0">
            <Link href={`/app/orders/${activeOrder.id}`}>
              Track Order Live <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </Card>
      )}

      {/* Cart Reminder Banner */}
      {cart.length > 0 && (
        <Card className="p-4 bg-[#C99A45]/10 border border-[#C99A45]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#E8C77A] shrink-0" />
            <span className="text-xs sm:text-sm text-[#F5EDE0]">
              You have <strong className="text-[#E8C77A]">{cart.length} item(s)</strong> awaiting in your dermal bag.
            </span>
          </div>
          <Button asChild size="sm" className="shadow-gold-glow shrink-0">
            <Link href="/app/cart">
              Checkout Bag
            </Link>
          </Button>
        </Card>
      )}

      {/* Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hero Card: Start Scan */}
        <div className="lg:col-span-7">
          <Card className="h-full p-6 sm:p-8 bg-gradient-to-br from-[#1A130B] via-[#1A130B]/95 to-[#0B0907] border border-[#C99A45]/25 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C99A45]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-md relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C99A45]/15 border border-[#C99A45]/30 text-[#E8C77A] text-xs font-semibold uppercase font-mono">
                <Camera className="w-3.5 h-3.5" /> Multi-Spectral Vision
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F5EDE0] font-normal leading-tight">
                Evaluate Your Skin&apos;s Cellular Radiance
              </h2>
              <p className="text-xs sm:text-sm text-[#A89A85] leading-relaxed">
                Capture 3 high-resolution angles to measure moisture barrier, pore clarity, vascular erythema, and sub-dermal melanin balance.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex flex-wrap items-center gap-3">
              <Button asChild className="py-3 px-6 shadow-gold-glow">
                <Link href="/app/scan">
                  <Camera className="w-4 h-4 mr-2" /> {latestScan ? "Start New Scan" : "Start First Scan"}
                </Link>
              </Button>
              {latestScan && (
                <Button asChild variant="outline" className="border-[#C99A45]/40 text-[#E8C77A] hover:bg-[#241A0F] hover:border-[#E8C77A]">
                  <Link href={`/app/results/${latestScan.id}`}>
                    View Latest Results ({latestScanScore}/100)
                  </Link>
                </Button>
              )}
            </div>

            <div className="hidden sm:block absolute right-4 -bottom-6 w-52 h-64 opacity-25 pointer-events-none">
              <FaceScanGraphic className="w-full h-full" />
            </div>
          </Card>
        </div>

        {/* Right Hero Card: Vitality Score */}
        <div className="lg:col-span-5">
          <Card className="h-full p-6 sm:p-8 bg-[#1A130B]/90 border border-[#C99A45]/25 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E8C77A]">
                Skin Vitality Score
              </span>
              <span className="text-xs text-[#A89A85]">
                {latestScan ? new Date(latestScan.createdAt).toLocaleDateString("en-IN") : "No scans yet"}
              </span>
            </div>

            {latestScan ? (
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-serif text-5xl font-bold text-[#F5EDE0] tracking-tight">
                    {latestScanScore} <span className="text-sm font-mono text-[#E8C77A]">/ 100</span>
                  </div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> High Cellular Stability
                  </p>
                </div>

                <div className="w-20 h-20 rounded-full border-4 border-[#C99A45]/35 flex items-center justify-center bg-[#0B0907] shadow-gold-glow">
                  <span className="font-serif text-xl font-bold text-[#E8C77A]">
                    {latestScanScore}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#C99A45]/60 mx-auto" />
                <p className="text-xs text-[#A89A85]">Take a face scan to reveal your skin score</p>
              </div>
            )}

            {latestScan && latestScan.topConcerns.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[#C99A45]/15">
                <div className="text-[11px] font-mono text-[#E8C77A] uppercase">Top Biomarker Focus:</div>
                <div className="flex flex-wrap gap-2">
                  {latestScan.topConcerns.slice(0, 3).map((c) => (
                    <span
                      key={c.parameterId}
                      className="px-2.5 py-1 rounded-full bg-[#0B0907]/90 border border-[#C99A45]/25 text-[11px] text-[#F5EDE0]"
                    >
                      {c.name} ({c.score}/100)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#E8C77A]">
          Quick Access Portal
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/app/scan"
            className="p-4 rounded-2xl bg-[#1A130B]/90 hover:bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A]/50 transition-all text-center space-y-2 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] mx-auto group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F5EDE0]">Face Scan</div>
            <div className="text-[10px] text-[#A89A85]">3-Angle Capture</div>
          </Link>

          <Link
            href="/app/shop"
            className="p-4 rounded-2xl bg-[#1A130B]/90 hover:bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A]/50 transition-all text-center space-y-2 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] mx-auto group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F5EDE0]">Curated Shop</div>
            <div className="text-[10px] text-[#A89A85]">Targeted Formulas</div>
          </Link>

          <Link
            href="/app/consultations"
            className="p-4 rounded-2xl bg-[#1A130B]/90 hover:bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A]/50 transition-all text-center space-y-2 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] mx-auto group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F5EDE0]">Consultations</div>
            <div className="text-[10px] text-[#A89A85]">Dermal Specialists</div>
          </Link>

          <Link
            href="/app/orders"
            className="p-4 rounded-2xl bg-[#1A130B]/90 hover:bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A]/50 transition-all text-center space-y-2 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] mx-auto group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F5EDE0]">My Orders</div>
            <div className="text-[10px] text-[#A89A85]">Shipment Status</div>
          </Link>
        </div>
      </div>

      {/* Recommended for You Strip */}
      {topFourPicks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#E8C77A]">
                <Sparkles className="w-3.5 h-3.5" /> ALGORITHMIC DERMAL MATCH
              </div>
              <h3 className="font-serif text-2xl text-[#F5EDE0] font-normal tracking-tight">
                Recommended For You
              </h3>
            </div>
            <Button asChild variant="outline" size="sm" className="border-[#C99A45]/40 text-[#E8C77A] hover:bg-[#241A0F] hover:border-[#E8C77A]">
              <Link href="/app/shop?tab=for-you">
                View All Top Picks <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFourPicks.map((rec) => (
              <ProductCard
                key={rec.product.id}
                recommendation={rec}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tip of Day & Profile Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7">
          <Card className="h-full p-6 bg-[#1A130B]/90 border border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#E8C77A] font-semibold text-xs font-mono uppercase">
                <Lightbulb className="w-4 h-4" /> Dermal Tip of the Day
              </div>
              <button
                onClick={() => setCurrentTipIndex((prev) => (prev + 1) % skinTipsData.length)}
                className="text-[11px] text-[#E8C77A]/80 hover:text-[#E8C77A] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Next Tip
              </button>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-serif text-lg text-[#F5EDE0] font-normal">
                {currentTip.title}
              </h4>
              <p className="text-xs text-[#A89A85] leading-relaxed">
                {currentTip.tip}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#A89A85] border-t border-[#C99A45]/15">
              <span className="px-2 py-0.5 rounded bg-[#0B0907] border border-[#C99A45]/20 text-[#E8C77A]">
                Focus: {currentTip.category}
              </span>
              <span>Tip {currentTipIndex + 1} of {skinTipsData.length}</span>
            </div>
          </Card>
        </div>

        <div className="md:col-span-5">
          <Card className="h-full p-6 bg-[#1A130B]/90 border border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#E8C77A]">
                Profile Readiness ({progressPercent}%)
              </h4>
              <span className="text-xs text-[#A89A85]">{completedStepsCount}/3 Completed</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                hasConsent ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#0B0907]/80 border-[#C99A45]/20 text-[#A89A85]"
              }`}>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Biometric Consent
                </span>
                {hasConsent ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-amber-400 text-[10px] uppercase">Pending</span>}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                hasQuestionnaire ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#0B0907]/80 border-[#C99A45]/20 text-[#A89A85]"
              }`}>
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Skin & Lifestyle Quiz
                </span>
                {hasQuestionnaire ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-amber-400 text-[10px] uppercase">Pending</span>}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                hasFirstScan ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#0B0907]/80 border-[#C99A45]/20 text-[#A89A85]"
              }`}>
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> First 3-Angle Face Scan
                </span>
                {hasFirstScan ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-amber-400 text-[10px] uppercase">Pending</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
