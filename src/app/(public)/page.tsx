"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle2,
  Scan,
  Heart,
  ChevronRight,
  ChevronLeft,
  Flame,
  Activity,
  Droplets,
  Layers,
  Clock,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { GoldDust } from "@/components/ui/GoldDust";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { FaceScanGraphic } from "@/components/shared/FaceScanGraphic";
import { QuickBookingForm } from "@/components/public/QuickBookingForm";
import { QuickViewModal } from "@/components/public/QuickViewModal";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import type { Product } from "@/types";

// Data sources
import pageContent from "@/data/pageContent.json";
import siteSettings from "@/data/siteSettings.json";
import servicesData from "@/data/services.json";
import technologyStages from "@/data/technologyStages.json";
import productsData from "@/data/products.json";
import consultantsData from "@/data/consultants.json";
import testimonialsData from "@/data/testimonials.json";
import blogData from "@/data/blog.json";
import parametersData from "@/data/parameters.json";

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [serviceSlideIndex, setServiceSlideIndex] = useState(0);

  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isInWishlist = useAppStore((s) => s.isInWishlist);

  // Auto step cycle for technology section
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % technologyStages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent, productId: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleWishlist(productId);
    if (res.added) {
      toast.success(`${name} added to your wishlist.`);
    } else {
      toast.info(`${name} removed from wishlist.`);
    }
  };

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {/* =========================================================================
          1. CINEMATIC HERO SECTION
         ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg-base via-bg-surface/90 to-bg-base overflow-hidden">
        {/* Dynamic Canvas Gold Dust */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <GoldDust count={55} speed={0.5} />
        </div>

        {/* Radial Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Intro */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-heading font-semibold uppercase tracking-widest shadow-gold-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span>{pageContent.hero.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-[1.15]"
            >
              Where Ancient Alchemy Meets{" "}
              <span className="text-gold-gradient block sm:inline">
                Artificial Intelligence
              </span>
              <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-gold-300 font-normal ml-3 block sm:inline">
                {pageContent.hero.scriptAccent}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              {pageContent.hero.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link href={pageContent.hero.ctaPrimary.href} className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-sm font-semibold uppercase tracking-widest shadow-gold-md hover:shadow-gold-lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {pageContent.hero.ctaPrimary.label}
                </Button>
              </Link>
              <Link href={pageContent.hero.ctaSecondary.href} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7 py-4 text-sm font-semibold tracking-wider border-gold-500/40 text-gold-300 hover:bg-gold-500/15"
                >
                  <Cpu className="w-4 h-4 mr-2 text-gold-400" />
                  {pageContent.hero.ctaSecondary.label}
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-gold-500/15"
            >
              {pageContent.hero.trustBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className="text-xs font-semibold text-gold-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    {badge.title}
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5">{badge.subtitle}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Floating Phone Mockup with SVG Biometric Face Scan */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-transparent rounded-[40px] blur-2xl opacity-60 pointer-events-none" />

            {/* Phone Device Frame */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[36px] p-3 bg-gradient-to-b from-[#382B1B] via-[#1A130B] to-[#0B0907] border-2 border-gold-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(201,154,69,0.25)]"
            >
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-4 inset-x-0 mx-auto w-24 h-4 rounded-full bg-[#0B0907] border border-gold-500/30 flex items-center justify-center gap-2 z-20">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
                <div className="w-8 h-1 rounded-full bg-gold-500/20" />
              </div>

              {/* Phone Screen Container */}
              <div className="w-full rounded-[26px] overflow-hidden border border-gold-500/30 bg-[#0B0907] pt-7 pb-2 relative flex flex-col">
                {/* SVG Face Scan Graphic */}
                <div className="w-full aspect-[3/4] relative">
                  <FaceScanGraphic
                    animated={true}
                    showScanLine={true}
                    showMesh={true}
                    showLandmarks={true}
                    showZones={true}
                  />
                </div>

                {/* Bottom Biometric Status Bar */}
                <div className="p-3 bg-bg-surface/90 border-t border-gold-500/30 flex items-center justify-between text-[11px]">
                  <span className="font-heading font-semibold text-gold-300 uppercase tracking-wider">
                    8 Biomarkers
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    99.4% MATCH
                  </span>
                </div>
              </div>

              {/* Floating Parameter Chip 1 - Top Left */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -left-4 sm:-left-8 bg-bg-base/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gold-500/50 shadow-gold-sm flex items-center gap-2 text-xs text-gold-300 z-30"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-mono">Hydration</span>
                  <strong className="text-xs text-text-primary">88/100 • Deep</strong>
                </div>
              </motion.div>

              {/* Floating Parameter Chip 2 - Right Mid */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-28 -right-4 sm:-right-8 bg-bg-base/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gold-500/50 shadow-gold-sm flex items-center gap-2 text-xs text-gold-300 z-30"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-mono">Pigmentation</span>
                  <strong className="text-xs text-text-primary">94/100 • Clear</strong>
                </div>
              </motion.div>

              {/* Floating Parameter Chip 3 - Bottom Left */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-4 -left-4 sm:-left-6 bg-bg-base/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gold-500/50 shadow-gold-sm flex items-center gap-2 text-xs text-gold-300 z-30"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-mono">Barrier Health</span>
                  <strong className="text-xs text-emerald-400">Optimal (92)</strong>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ANIMATED STATS STRIP (Demo figures from siteSettings.json)
         ========================================================================= */}
      {/* Demo statistics note: Figures reflect platform performance metrics */}
      <section className="bg-bg-elevated border-y border-gold-500/25 py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300 flex items-center justify-center">
              <AnimatedCounter value={siteSettings.stats.clients || 48200} />
              <span className="text-gold-400 text-2xl ml-0.5">+</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Consulted Patrons
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300 flex items-center justify-center">
              <span>99.4</span>
              <span className="text-gold-400 text-2xl ml-0.5">%</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Diagnostic Precision
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300 flex items-center justify-center">
              <AnimatedCounter value={siteSettings.stats.treatments || 14850} />
              <span className="text-gold-400 text-2xl ml-0.5">+</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Treatments Delivered
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300 flex items-center justify-center">
              <span>4.96</span>
              <span className="text-gold-400 text-xl ml-1 flex items-center">
                <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Average MD Rating
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300 flex items-center justify-center">
              <AnimatedCounter value={siteSettings.stats.cities || 24} />
              <span className="text-gold-400 text-2xl ml-0.5">+</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Cities Served in India
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CREAM SECTION: "BOOK YOUR CONSULTATION" & BENEFIT ROWS
         ========================================================================= */}
      <section className="bg-[#F5EFE6] text-[#1A130B] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#C99A45_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Value Proposition & Benefit Rows */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C99A45]/15 border border-[#C99A45]/35 text-[#8A5A18] text-xs font-semibold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#8A5A18]" />
              <span>Royal Clinical Protocols</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1A130B] leading-tight">
              Begin Your Bespoke Transformation with a{" "}
              <span className="italic text-[#8A5A18] font-serif">Certified Dermatologist</span>
            </h2>

            <p className="text-base text-[#4A3E31] leading-relaxed">
              Step into an elevated consultation where state-of-the-art computer vision meets decades of clinical dermatological expertise.
            </p>

            <div className="space-y-4 pt-2">
              {pageContent.benefits.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFDF9]/95 border border-[#C99A45]/30 shadow-[0_4px_20px_rgba(184,129,47,0.08)] hover:shadow-[0_8px_30px_rgba(184,129,47,0.15)] hover:border-[#C99A45]/50 transition-all duration-300"
                >
                  <span className="text-lg font-heading font-bold text-[#8A5A18] bg-[#C99A45]/15 border border-[#C99A45]/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    {b.number}
                  </span>
                  <div>
                    <h4 className="text-base font-heading font-bold text-[#1A130B]">
                      {b.title}
                    </h4>
                    <p className="text-xs text-[#5C4E3D] mt-1 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Working Quick Booking Form */}
          <div className="lg:col-span-6">
            <QuickBookingForm />
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SERVICES CAROUSEL & SHOWCASE
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SectionHeading
              label="Signature Clinical Treatments"
              title="Formulated for Unrivaled Efficacy"
              accentWord="Rejuvenation"
              align="left"
            />
            <Link href="/services">
              <Button variant="outline" size="sm" className="border-gold-500/40 text-gold-300">
                Explore All 10 Services <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Responsive Services Grid / Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.slice(0, 6).map((service) => (
              <ScrollReveal key={service.id}>
                <div className="group rounded-2xl bg-bg-surface border border-gold-500/25 overflow-hidden hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] flex flex-col h-full">
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300">
                      {service.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30 text-xs font-bold text-gold-400">
                      ₹{service.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span>{service.durationMinutes} Minutes Session</span>
                      </div>
                      <h3 className="text-base font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gold-500/15 flex items-center justify-between">
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center gap-1"
                      >
                        Learn More <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link href={`/book?service=${service.id}`}>
                        <Button variant="gold" size="sm" className="text-xs py-1.5 px-3">
                          Book This
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. TECHNOLOGY IN ACTION: 5-STEP INTERACTIVE TIMELINE
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface border-y border-gold-500/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Proprietary AI Pipeline"
            title="Technology in Action: From Scan to Cellular Radiance"
            accentWord="Precision"
            description="Our end-to-end 5-stage intelligence workflow decodes multi-spectral biometric signals into actionable clinical interventions."
          />

          {/* Desktop & Tablet Step Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {technologyStages.map((stage, idx) => {
              const isSelected = idx === activeStep;
              return (
                <button
                  key={stage.key}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-bg-elevated border-gold-400 shadow-gold-sm"
                      : "bg-bg-base/60 border-gold-500/20 hover:border-gold-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-gold-400">
                      0{stage.step}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_#D4AF37]" />
                    )}
                  </div>
                  <h4 className="text-sm font-heading font-bold text-text-primary line-clamp-1">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-1">
                    {stage.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card */}
          <div className="bg-bg-elevated/90 border border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
                Stage 0{technologyStages[activeStep].step} — {technologyStages[activeStep].subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                {technologyStages[activeStep].title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {technologyStages[activeStep].description}
              </p>

              <div className="pt-3 border-t border-gold-500/20">
                <span className="text-xs font-semibold text-gold-300 block mb-2 uppercase tracking-wider">
                  Diagnostic Deliverables:
                </span>
                <div className="flex flex-wrap gap-2">
                  {technologyStages[activeStep].metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-3 py-1 rounded-lg bg-gold-500/15 border border-gold-500/30 text-xs text-gold-300 font-medium"
                    >
                      ✓ {metric}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link href="/technology">
                  <Button variant="gold" size="md" className="uppercase tracking-wider text-xs font-semibold">
                    <Cpu className="w-4 h-4 mr-2" />
                    Explore 8 Spectral Parameters
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full aspect-[4/3] rounded-2xl bg-bg-base border border-gold-500/40 overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.8)] group">
                <ImageWithFallback
                  src={technologyStages[activeStep].image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                  alt={technologyStages[activeStep].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Vignette and Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(11,9,7,0.7)_100%)]" />

                {/* Laser Scan Line Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-[0_0_15px_#D4AF37] animate-[scan_3s_ease-in-out_infinite]" />

                {/* Top Status Strip */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] bg-bg-base/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gold-500/30">
                  <span className="font-mono text-gold-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    STAGE 0{technologyStages[activeStep].step} PIPELINE
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    99.4% ACCURACY
                  </span>
                </div>

                {/* Bottom Overlay Info & Stage Bar */}
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-bg-base/90 backdrop-blur-xl rounded-xl border border-gold-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-heading font-bold text-text-primary">
                      {technologyStages[activeStep].title}
                    </h4>
                    <span className="text-[10px] text-gold-400 font-mono">
                      STEP {activeStep + 1} OF 5
                    </span>
                  </div>
                  <div className="w-full bg-bg-elevated h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-all duration-500 shadow-gold-sm"
                      style={{ width: `${((activeStep + 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. AI PREVIEW & 8 PARAMETERS CHIPS
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading
              label="Biometric Diagnostic Engine"
              title="8 Skin Parameters Analyzed with Clinical Precision"
              accentWord="Objectivity"
              align="left"
            />
            <p className="text-sm text-text-secondary leading-relaxed">
              Our computer vision architecture decomposes high-resolution facial scans across 8 foundational physiological parameters. Every score is benchmarked against South Asian skin phototypes to eliminate formulation bias.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {parametersData.map((param) => (
                <div
                  key={param.id}
                  className="p-3 rounded-xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all"
                >
                  <span className="text-xs font-semibold text-gold-300 block">
                    {param.name}
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5 block line-clamp-1">
                    {param.interpretation.medium}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="/technology">
                <Button variant="gold" size="lg" className="uppercase tracking-wider text-xs font-semibold">
                  <Cpu className="w-4 h-4 mr-2" />
                  Try The Live Diagnostic Simulator
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual AI Scanner preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gold-500/30 bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80"
                alt="AI Parameter Scan"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-heading font-semibold text-gold-300 uppercase tracking-widest block mb-1">
                  Continuous Neural Calibrations
                </span>
                <p className="text-xs text-text-secondary">
                  Prescription concentrations dynamically adapt every 30 days as your skin barrier regenerates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FEATURED FORMULATIONS & 3D TILT CARDS
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface border-t border-gold-500/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SectionHeading
              label="Curated Cosmeceuticals"
              title="Clinically Formulated Active Regimens"
              accentWord="Alchemy"
              align="left"
            />
            <Link href="/shop">
              <Button variant="outline" size="sm" className="border-gold-500/40 text-gold-300">
                View All Formulations <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Product Grid with TiltCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(productsData as unknown as Product[]).slice(0, 4).map((product) => {
              const wishlisted = isInWishlist(product.id);
              const discountedPrice = Math.round(product.mrp * 0.92);

              return (
                <TiltCard key={product.id} className="h-full">
                  <div className="h-full rounded-2xl bg-bg-elevated border border-gold-500/25 overflow-hidden flex flex-col justify-between group hover:border-gold-400/60 transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-bg-surface">
                      <ImageWithFallback
                        src={product.images[0] || ""}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => handleWishlist(e, product.id, product.name)}
                        aria-label="Wishlist product"
                        className="absolute top-3 right-3 p-2 rounded-full bg-bg-base/80 backdrop-blur-md border border-gold-500/30 text-gold-400 hover:text-rose-400 transition-colors z-10"
                      >
                        <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-gold-500/30 text-[10px] font-semibold text-emerald-400">
                        AI Match: 96%
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                          <span className="uppercase tracking-wider font-semibold text-gold-400 text-[10px]">
                            {product.concernTags[0] || "Targeted"}
                          </span>
                          <div className="flex items-center gap-1 text-gold-300">
                            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <h4 className="text-sm font-heading font-bold text-text-primary line-clamp-1 group-hover:text-gold-300 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gold-500/15 flex items-baseline justify-between">
                        <div>
                          <span className="text-base font-bold font-heading text-gold-300">
                            ₹{discountedPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-text-muted line-through ml-1.5">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <button
                          onClick={() => handleQuickView(product)}
                          className="text-xs text-gold-400 hover:text-gold-200 font-medium underline"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. EXPERTS STRIP
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Clinical Board of Advisors"
            title="Guided by India's Foremost Aesthetic Dermatologists"
            accentWord="Expertise"
            description="Our consultations and custom prescriptions are formulated under direct clinical oversight of board-certified MD practitioners."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultantsData.map((expert) => (
              <div
                key={expert.id}
                className="rounded-2xl bg-bg-surface border border-gold-500/25 p-5 flex flex-col justify-between hover:border-gold-400/60 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-elevated border border-gold-500/20">
                    <ImageWithFallback
                      src={expert.avatar}
                      alt={expert.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-bg-base/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                      <span>{expert.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors">
                      {expert.name}
                    </h3>
                    <p className="text-xs text-gold-400 font-medium mt-0.5">
                      {expert.title}
                    </p>
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">
                      {expert.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gold-500/15 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">
                    ₹{expert.consultationFee.toLocaleString("en-IN")} / session
                  </span>
                  <Link href={`/book?expert=${expert.id}`}>
                    <Button variant="gold" size="sm" className="text-xs py-1 px-3">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. TESTIMONIALS STRIP
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface border-y border-gold-500/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Verified Patron Experiences"
            title="Transformational Results Celebrated Across India"
            accentWord="Radiance"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-bg-elevated border border-gold-500/25 p-6 space-y-4 flex flex-col justify-between shadow-gold-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-gold-500/15 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-xs font-bold text-gold-300">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-text-primary">
                      {item.author}
                    </h4>
                    <span className="text-[11px] text-text-muted">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. SCIENTIFIC JOURNAL / BLOG HIGHLIGHTS
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SectionHeading
              label="The Royal Gazette"
              title="Dermatological Insights & Botanical Science"
              accentWord="Discovery"
              align="left"
            />
            <Link href="/blog">
              <Button variant="outline" size="sm" className="border-gold-500/40 text-gold-300">
                Read All Articles <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogData.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl bg-bg-surface border border-gold-500/20 overflow-hidden hover:border-gold-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                  <ImageWithFallback
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300">
                    {post.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-text-muted">
                      {post.publishedAt} • {post.readTimeMinutes} min read
                    </span>
                    <h3 className="text-sm font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors mt-1 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <span className="text-xs text-gold-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. FINAL CTA BANNER WITH GOLD DUST
         ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg-surface via-bg-elevated to-bg-base border-t border-gold-500/25 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <GoldDust count={40} speed={0.4} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-heading font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>The Gold Standard of Aesthetic Care</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
            Ready to Unlock Your Skin&apos;s True{" "}
            <span className="text-gold-gradient font-script text-4xl sm:text-5xl lg:text-6xl block sm:inline">
              Cellular Radiance?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
            Take the first step with our AI biomarker analysis or schedule a video session with a senior MD dermatologist today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/book">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-sm font-semibold uppercase tracking-widest shadow-gold-md hover:shadow-gold-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Your Consultation
              </Button>
            </Link>
            <Link href="/technology">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-sm font-semibold tracking-wider border-gold-500/40 text-gold-300 hover:bg-gold-500/15"
              >
                <Cpu className="w-4 h-4 mr-2 text-gold-400" />
                Explore AI Technology
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
}
