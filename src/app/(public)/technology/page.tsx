"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  Lock,
  Eye,
  Activity,
  Droplets,
  Layers,
  Flame,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  HelpCircle,
  Database,
  Trash2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { RadarChartSimulation } from "@/components/public/RadarChartSimulation";
import { useAppStore } from "@/store";
import type { Product } from "@/types";
import sampleScansData from "@/data/sampleScans.json";
import productsData from "@/data/products.json";

export default function TechnologyPage() {
  const parameters = useAppStore((s) => s.parameters);
  const activeParameters = useMemo(() => {
    return parameters.filter((p) => p.status === "active");
  }, [parameters]);

  const [selectedParamId, setSelectedParamId] = useState<string>(activeParameters[0]?.id || "param-1");
  const [selectedScanIndex, setSelectedScanIndex] = useState(0);

  const activeParameter = useMemo(() => {
    return activeParameters.find((p) => p.id === selectedParamId) || activeParameters[0];
  }, [activeParameters, selectedParamId]);

  const activeScan = sampleScansData[selectedScanIndex] || sampleScansData[0];

  // Matched products for active parameter
  const matchedProducts = useMemo(() => {
    if (!activeParameter) return [];
    const paramKey = activeParameter.slug.replace("-", "_");
    return (productsData as unknown as Product[]).filter((p) => {
      const score = (p.targetParameters as Record<string, number>)[paramKey];
      return score && score >= 2;
    }).slice(0, 2);
  }, [activeParameter]);

  const howItWorksSteps = [
    {
      number: "01",
      title: "Biometric Consent & Optical Calibration",
      description: "You give explicit optical processing permission. We calibrate your camera sensor for ambient lux, white balance, and distance.",
    },
    {
      number: "02",
      title: "Lifestyle & Climate Questionnaire",
      description: "Brief assessment of sleep patterns, stress, water intake, and localized UV/pollution indices.",
    },
    {
      number: "03",
      title: "3-Angle Multi-Spectral Capture",
      description: "High-resolution frontal, left, and right oblique snapshots captured within 15 seconds.",
    },
    {
      number: "04",
      title: "Edge Quality & Clarity Audit",
      description: "On-device neural filter ensures image sharpness and illumination homogeneity before cloud processing.",
    },
    {
      number: "05",
      title: "Deep Dermal Neural Inference",
      description: "Convolutional transformers segment skin layers and compute indices across 8 distinct physiological parameters.",
    },
    {
      number: "06",
      title: "Personalized Formulation Synthesis",
      description: "Cross-matching with 40+ medical-grade actives to generate your 30-day morning and evening regimen.",
    },
  ];

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* =========================================================================
            1. HERO SECTION WITH ANIMATED SCAN MESH
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-heading font-semibold uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5 text-gold-400" />
              <span>Multi-Spectral Computer Vision</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
              Clinical Dermatology Powered by{" "}
              <span className="text-gold-gradient">Sub-Surface Neural AI</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Experience the future of objective skin diagnostics. Our proprietary computer vision models analyze 8 fundamental skin parameters beneath the epidermis with 99.4% clinical correlation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/demo">
                <Button variant="gold" size="lg" className="uppercase tracking-wider text-xs font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch Live Demo Scan
                </Button>
              </Link>
              <Link href="/book">
                <Button variant="outline" size="lg" className="border-gold-500/40 text-gold-300">
                  Book Dermatologist Review
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gold-500/40 bg-bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                alt="AI Neural Face Scan Simulation"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_15px_#D4AF37] animate-[scan_3s_ease-in-out_infinite]" />

              <div className="absolute bottom-4 left-4 right-4 p-3 bg-bg-base/90 backdrop-blur-md rounded-2xl border border-gold-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gold-300 font-semibold block">Spectral Model v3.2</span>
                  <span className="text-[11px] text-text-muted">Fitzpatrick Types I–VI Calibrated</span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                  99.4% ACCURACY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. INTERACTIVE 8 PARAMETERS EXPLORER (Reads from store)
           ========================================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-bg-surface border border-gold-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8">
          <div>
            <SectionHeading
              label="Biomarker Architecture"
              title="Interactive 8-Parameter Deep Dive"
              accentWord="Deconstructed"
              description="Select any biomarker to inspect its biological mechanism, severity scales, and synergistic active ingredients."
              align="left"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Parameter List (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              {activeParameters.map((param) => {
                const isSelected = param.id === selectedParamId;
                const displayWeight = param.weight > 1 ? param.weight : Math.round(param.weight * 100);
                return (
                  <button
                    key={param.id}
                    onClick={() => setSelectedParamId(param.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-bg-elevated border-gold-400 shadow-gold-sm"
                        : "bg-bg-base/60 border-gold-500/15 hover:border-gold-500/35 hover:bg-bg-elevated/40"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-heading font-bold text-text-primary block">
                        {param.name}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Weight: {displayWeight}% • Unit: {param.unit}
                      </span>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-gold-400 shadow-[0_0_8px_#D4AF37]" : "bg-gold-500/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Parameter Detail Card (8 cols) */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-bg-elevated border border-gold-500/30 space-y-6">
              {activeParameter && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gold-500/20">
                    <div>
                      <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">
                        BIOMARKER AI KEY: {activeParameter.aiKey}
                      </span>
                      <h3 className="text-2xl font-heading font-bold text-text-primary mt-0.5">
                        {activeParameter.name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold self-start sm:self-center">
                      Optimal Scale: {activeParameter.minScore} – {activeParameter.maxScore} {activeParameter.unit}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeParameter.description}
                  </p>

                  {/* Interpretation Matrix */}
                  <div className="space-y-3">
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400 block">
                      Diagnostic Interpretation Matrix:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-bg-surface border border-gold-500/15 space-y-1">
                        <span className="text-xs font-bold text-emerald-400 block">Low Score</span>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {activeParameter.interpretation.low}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-bg-surface border border-gold-500/15 space-y-1">
                        <span className="text-xs font-bold text-gold-300 block">Moderate Score</span>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {activeParameter.interpretation.medium}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-bg-surface border border-gold-500/15 space-y-1">
                        <span className="text-xs font-bold text-rose-400 block">Elevated / High</span>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {activeParameter.interpretation.high}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Matched Cosmeceuticals */}
                  {matchedProducts.length > 0 && (
                    <div className="pt-4 border-t border-gold-500/15 space-y-3">
                      <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400 block">
                        Formulations Calibrated for this Biomarker:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {matchedProducts.map((p) => (
                          <Link
                            key={p.id}
                            href={`/shop/${p.id}`}
                            className="p-3 rounded-xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all flex items-center gap-3 group"
                          >
                            <div className="relative w-12 h-12 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                              <ImageWithFallback
                                src={p.images[0] || ""}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors line-clamp-1">
                                {p.name}
                              </h4>
                              <span className="text-[11px] text-gold-400">
                                ₹{p.mrp.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. INTERACTIVE SIMULATION DEMO (Radar Chart + Face Switcher)
           ========================================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-bg-surface border border-gold-500/30 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider mb-2">
                <span>Demo Simulation Environment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                Multi-Spectral Biometric Radar Simulation
              </h2>
            </div>

            {/* Sample Face Switcher */}
            <div className="flex items-center gap-2">
              {sampleScansData.map((scan, idx) => (
                <button
                  key={scan.id}
                  onClick={() => setSelectedScanIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    idx === selectedScanIndex
                      ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base font-semibold shadow-gold-sm"
                      : "bg-bg-elevated text-text-muted hover:text-gold-300"
                  }`}
                >
                  {scan.customerName.split(" ")[0]} ({scan.skinType})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Radar Chart (6 cols) */}
            <div className="lg:col-span-6 bg-bg-base/80 rounded-2xl border border-gold-500/20 p-4">
              <RadarChartSimulation
                scores={activeScan.parameterScores as Record<string, number>}
                parameters={activeParameters}
              />
            </div>

            {/* Right: Scan Summary & Scores Breakdown (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-2xl bg-bg-elevated border border-gold-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-gold-300">
                    {activeScan.customerName} ({activeScan.age} yrs)
                  </span>
                  <span className="text-emerald-400 font-mono">
                    Overall Health: {activeScan.overallScore}/100
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeScan.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(activeScan.parameterScores).map(([key, score]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-bg-elevated border border-gold-500/15 flex items-center justify-between"
                  >
                    <span className="text-text-muted capitalize">
                      {key.replace("_", " ")}
                    </span>
                    <span className="font-mono font-bold text-gold-300">
                      {score}/100
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/demo">
                  <Button variant="gold" size="md" className="w-full justify-center uppercase tracking-wider text-xs font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Test Live Scan on Demo Panel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. HOW IT WORKS SCROLL STORY
           ========================================================================= */}
        <div className="space-y-12">
          <SectionHeading
            label="Step-by-Step Diagnostic"
            title="How the AI Scan Works from Start to Finish"
            accentWord="Frictionless"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksSteps.map((step) => (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-3 relative overflow-hidden"
              >
                <span className="text-2xl font-mono font-bold text-gold-500/40 block">
                  {step.number}
                </span>
                <h4 className="text-base font-heading font-bold text-text-primary">
                  {step.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            5. PRIVACY & BIOMETRIC CONSENT EXPLAINER
           ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-elevated border border-gold-500/30 space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Data Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
              Your Face Is Analyzed, Never Identified or Sold
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              We uphold the highest global standards for biomedical data governance. Here is our solemn pledge regarding your biometric privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
              <Eye className="w-5 h-5 text-gold-400" />
              <h4 className="text-sm font-heading font-bold text-text-primary">
                Detection, Not Recognition
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Our neural models evaluate optical pixel refraction. We do not store biometric facial landmarks or cross-reference government identity databases.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
              <Lock className="w-5 h-5 text-gold-400" />
              <h4 className="text-sm font-heading font-bold text-text-primary">
                End-to-End Encryption
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Images are encrypted in transit via TLS 1.3 and at rest with AES-256. Only your assigned MD dermatologist can review visual records.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
              <Trash2 className="w-5 h-5 text-gold-400" />
              <h4 className="text-sm font-heading font-bold text-text-primary">
                Instant Deletion on Demand
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                You retain complete sovereignty over your diagnostics. Click delete at any time in your customer portal to purge all images permanently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
