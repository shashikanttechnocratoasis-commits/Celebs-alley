"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { OTPInput } from "@/components/ui/OTPInput";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Drawer } from "@/components/ui/Drawer";
import { showToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Stepper } from "@/components/ui/Stepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GoldDust } from "@/components/ui/GoldDust";
import { ScanLine } from "@/components/ui/ScanLine";
import { TiltCard } from "@/components/ui/TiltCard";

import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Sliders,
  Bell,
  Heart,
  ShoppingCart,
  Layers,
  Activity,
  CheckCircle,
  Eye,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatINR } from "@/lib/utils";

interface SampleProductRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  mrp: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const sampleTableData: SampleProductRow[] = [
  { id: "P-01", name: "Golden Elixir Cellular Infusion Serum", brand: "LuxeDerm Paris", category: "Serums", mrp: 4850, stock: 45, status: "In Stock" },
  { id: "P-02", name: "Cica Barrier Soothing Calming Gel-Cream", brand: "Aura Botanicals", category: "Moisturizers", mrp: 2950, stock: 12, status: "In Stock" },
  { id: "P-03", name: "Saffron & 24K Gold Royal Luster Oil", brand: "AyurVeda Radiance", category: "Oils", mrp: 5400, stock: 4, status: "Low Stock" },
  { id: "P-04", name: "Overnight Chrono-Retinal 0.1% Intensive Fluid", brand: "Celestia Skincare", category: "Treatments", mrp: 6200, stock: 0, status: "Out of Stock" },
  { id: "P-05", name: "Liposomal Vitamin C 20% + Ferulic Super Serum", brand: "Celestia Skincare", category: "Serums", mrp: 3800, stock: 28, status: "In Stock" },
];

const sampleColumns: ColumnDef<SampleProductRow>[] = [
  {
    accessorKey: "id",
    header: "SKU ID",
    cell: (info) => <span className="font-mono text-xs text-[#A89A85]">{info.getValue() as string}</span>,
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: (info) => <span className="font-medium text-[#F5EDE0]">{info.getValue() as string}</span>,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: (info) => <span className="text-[#A89A85]">{info.getValue() as string}</span>,
  },
  {
    accessorKey: "mrp",
    header: "MRP",
    cell: (info) => <span className="font-semibold text-[#E8C77A]">{formatINR(info.getValue() as number)}</span>,
  },
  {
    accessorKey: "status",
    header: "Inventory Status",
    cell: (info) => {
      const val = info.getValue() as string;
      return (
        <Badge
          variant={val === "In Stock" ? "success" : val === "Low Stock" ? "warning" : "danger"}
          size="sm"
        >
          {val}
        </Badge>
      );
    },
  },
];

export default function StyleguidePage() {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [otpVal, setOtpVal] = useState("123456");
  const [radioVal, setRadioVal] = useState("standard");
  const [switchVal, setSwitchVal] = useState(true);
  const [checkVal, setCheckVal] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [scanActive, setScanActive] = useState(true);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDeviceLabel = (w: number) => {
    if (w < 768) return { text: "MOBILE (<768px)", color: "bg-[#D4604F]" };
    if (w < 1280) return { text: "TABLET (768-1279px)", color: "bg-[#E0A93B]" };
    return { text: "DESKTOP (1280px+)", color: "bg-[#5FAF7A]" };
  };

  const device = getDeviceLabel(viewportWidth);

  const colorSwatches = [
    { name: "bg-base", hex: "#0B0907", bg: "bg-[#0B0907]", border: "border-[#C99A45]/30", desc: "Page Foundation" },
    { name: "bg-surface", hex: "#1A130B", bg: "bg-[#1A130B]", border: "border-[#C99A45]/30", desc: "Cards & Panels" },
    { name: "bg-elevated", hex: "#241A0F", bg: "bg-[#241A0F]", border: "border-[#C99A45]/30", desc: "Modals & Hover" },
    { name: "gold-300", hex: "#E8C77A", bg: "bg-[#E8C77A]", border: "border-transparent", desc: "Light Gold Highlights", darkText: true },
    { name: "gold-500", hex: "#C99A45", bg: "bg-[#C99A45]", border: "border-transparent", desc: "Signature Royal Gold", darkText: true },
    { name: "gold-700", hex: "#B8812F", bg: "bg-[#B8812F]", border: "border-transparent", desc: "Deep Gold Gradient Anchor" },
    { name: "cream", hex: "#F3EAD9", bg: "bg-[#F3EAD9]", border: "border-transparent", desc: "Light Section Base", darkText: true },
    { name: "cream-ink", hex: "#1A130B", bg: "bg-[#1A130B]", border: "border-[#C99A45]/30", desc: "Text on Cream Surface" },
    { name: "text-primary", hex: "#F5EDE0", bg: "bg-[#F5EDE0]", border: "border-transparent", desc: "Primary Body Text", darkText: true },
    { name: "text-muted", hex: "#A89A85", bg: "bg-[#A89A85]", border: "border-transparent", desc: "Secondary Labels", darkText: true },
    { name: "success", hex: "#5FAF7A", bg: "bg-[#5FAF7A]", border: "border-transparent", desc: "Stock & Verification", darkText: true },
    { name: "warning", hex: "#E0A93B", bg: "bg-[#E0A93B]", border: "border-transparent", desc: "Low Stock / Warnings", darkText: true },
    { name: "danger", hex: "#D4604F", bg: "bg-[#D4604F]", border: "border-transparent", desc: "Out of Stock / Errors" },
    { name: "info", hex: "#6FA3C7", bg: "bg-[#6FA3C7]", border: "border-transparent", desc: "AI Insights", darkText: true },
  ];

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] font-sans relative pb-24 selection:bg-[#C99A45]/30">
      {/* Floating Viewport Indicator */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1A130B]/95 border border-[#C99A45]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs font-mono">
        <span className={`w-2.5 h-2.5 rounded-full ${device.color} animate-pulse`} />
        <span className="font-semibold text-[#E8C77A]">{viewportWidth}px</span>
        <span className="text-[#A89A85] hidden sm:inline">({device.text})</span>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0907]/90 backdrop-blur-md border-b border-[#C99A45]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <Logo size="md" href="/" />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/demo">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Open Demo Hub
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
        {/* Title */}
        <SectionHeading
          label="Design Tokens & Component Library"
          title="Gold on Black"
          scriptAccent="Design System"
          description="Interactive showcase of all luxury typography, color tokens, form elements, dialogs, motion signature effects, and responsive layout patterns."
        />

        {/* 1. COLOR SWATCHES */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              1. Color Palette Tokens
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {colorSwatches.map((c) => (
              <div
                key={c.name}
                className="p-3.5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-2.5 shadow-sm"
              >
                <div
                  className={`w-full h-14 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      c.darkText ? "text-[#1A130B]" : "text-[#F5EDE0]"
                    }`}
                  >
                    {c.hex}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F5EDE0]">{c.name}</h4>
                  <p className="text-[10px] text-[#A89A85] mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TYPOGRAPHY SCALE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              2. Luxury Typography System
            </h2>
          </div>

          <Card variant="glass" className="space-y-6 p-6 sm:p-8">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C99A45]">
                Heading 1 — Playfair Display (4xl - 6xl)
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading text-[#F5EDE0]">
                High-Frequency Regenerative Cosmeceuticals
              </h1>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C99A45]">
                Script Accent — Allura (5xl - 7xl)
              </span>
              <p className="font-script text-5xl sm:text-6xl gold-gradient-text capitalize">
                Luminous Radiance Revealed
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C99A45]">
                Body Copy — Montserrat (Regular & Medium)
              </span>
              <p className="text-sm text-[#A89A85] leading-relaxed max-w-3xl">
                Every skin cell possesses an innate restorative frequency. Our proprietary 8-parameter visual
                diagnostic engine decodes micro-relief anomalies, epidermal lipid thinning, and melanin clusters
                to formulate hyper-targeted clinical routines.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C99A45]">
                Small Luxury Label — Spaced Uppercase Montserrat (0.3em tracking)
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E8C77A]">
                BEAUTY • WELLNESS • TREATMENT
              </p>
            </div>
          </Card>
        </section>

        {/* 3. BUTTONS & ACTIONS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              3. Button Variants & States
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Gold Shimmer</Button>
              <Button variant="secondary">Secondary Outline</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Action</Button>
              <Button variant="subtle">Subtle Dark</Button>
              <Button variant="primary" isLoading>
                Loading State
              </Button>
              <IconButton aria-label="Favorite">
                <Heart className="w-4 h-4 text-[#E8C77A]" />
              </IconButton>
            </div>

            {/* Light Surface Demo (Cream) */}
            <div className="p-8 rounded-3xl bg-[#F3EAD9] text-[#1A130B] space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#B8812F] font-bold">
                Light Surface Showcase (#F3EAD9 Cream Background)
              </span>
              <h3 className="text-2xl font-heading font-semibold text-[#1A130B]">
                Cream Mode High-Contrast Controls
              </h3>
              <p className="text-xs text-[#6F6354] max-w-xl">
                Ensuring crystal-clear readability and branding hierarchy on light editorial sections.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button variant="darkOnCream">Dark Button on Cream</Button>
                <Logo surface="cream" size="md" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. FORM CONTROLS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              4. Form Controls & Inputs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="space-y-4">
              <h4 className="text-sm font-heading font-semibold text-[#E8C77A]">
                Text Inputs & Search
              </h4>
              <Input
                label="Full Legal Name"
                placeholder="e.g. Princess Gayatri"
                defaultValue="Princess Gayatri"
              />
              <Input
                label="Email Address (Error State)"
                placeholder="you@domain.com"
                defaultValue="invalid-email"
                error="Please enter a valid luxury corporate email"
              />
              <SearchInput placeholder="Search 32 luxury formulations..." />
            </Card>

            <Card className="space-y-4">
              <h4 className="text-sm font-heading font-semibold text-[#E8C77A]">
                Select & Textarea
              </h4>
              <Select
                label="Primary Skin Concern"
                options={[
                  { label: "Transepidermal Dehydration", value: "hydration" },
                  { label: "Vascular Erythema (Rosacea)", value: "redness" },
                  { label: "Solar Lentigines (Melasma)", value: "pigmentation" },
                ]}
              />
              <Textarea
                label="Prescription Clinical Notes"
                placeholder="Enter custom dermatologist notes..."
                defaultValue="Patient exhibits elevated periorbital dehydration fine lines."
              />
            </Card>

            <Card className="space-y-4">
              <h4 className="text-sm font-heading font-semibold text-[#E8C77A]">
                Toggles, Checks & OTP
              </h4>
              <Switch
                label="AI Auto-Replenishment"
                description="Trigger dispatch when stock reaches 15%"
                checked={switchVal}
                onChange={(e) => setSwitchVal(e.currentTarget.checked)}
              />
              <Checkbox
                label="Exclude Harsh Essential Oils"
                description="Safe for hyper-reactive barriers"
                checked={checkVal}
                onChange={(e) => setCheckVal(e.currentTarget.checked)}
              />
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider text-[#A89A85] block mb-2 font-medium">
                  6-Digit OTP Verification
                </span>
                <OTPInput value={otpVal} onChange={setOtpVal} />
              </div>
            </Card>
          </div>
        </section>

        {/* 5. MOTION & BRAND SIGNATURE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              5. Signature Motion Demos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3D Tilt Card Demo */}
            <TiltCard>
              <Card className="p-6 h-64 flex flex-col justify-between border-[#C99A45]/40 bg-gradient-to-br from-[#1A130B] to-[#241A0F]">
                <div>
                  <Badge variant="gold" size="sm">
                    Interactive 3D Parallax
                  </Badge>
                  <h3 className="text-lg font-heading font-semibold text-[#F5EDE0] mt-3">
                    Hover Tilt Card
                  </h3>
                  <p className="text-xs text-[#A89A85] mt-1">
                    Move your cursor across this card to experience 3D perspective depth and dynamic gold light reflection.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#E8C77A]">
                  Desktop Parallax Enabled ✨
                </div>
              </Card>
            </TiltCard>

            {/* Scan Line Animation */}
            <Card className="p-6 h-64 flex flex-col justify-between relative overflow-hidden">
              <ScanLine active={scanActive} />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <Badge variant="gold" size="sm">
                    AI Visual FX
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScanActive(!scanActive)}
                    className="h-7 text-[10px]"
                  >
                    {scanActive ? "Pause" : "Play"}
                  </Button>
                </div>
                <h3 className="text-lg font-heading font-semibold text-[#F5EDE0] mt-3">
                  Simulated Scan Line
                </h3>
                <p className="text-xs text-[#A89A85] mt-1">
                  High-tech laser sweep utilized during computer vision facial scan simulations.
                </p>
              </div>
              <div className="text-xs text-[#C99A45] font-mono relative z-10">
                8-Parameter Matrix Active...
              </div>
            </Card>

            {/* Animated Counters */}
            <Card className="p-6 h-64 flex flex-col justify-between">
              <div>
                <Badge variant="gold" size="sm">
                  Live Viewport Counters
                </Badge>
                <h3 className="text-lg font-heading font-semibold text-[#F5EDE0] mt-3">
                  Animated Numerical Counters
                </h3>
                <p className="text-xs text-[#A89A85] mt-1">
                  Smooth count-up easing when elements enter the visible viewport.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-heading font-semibold text-[#E8C77A]">
                  <AnimatedCounter to={48200} prefix="₹" />
                </div>
                <span className="text-[10px] text-[#A89A85] uppercase tracking-wider">
                  Total Monthly Revenue
                </span>
              </div>
            </Card>
          </div>
        </section>

        {/* 6. TOASTS & MODALS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              6. Interactive Dialogs & Sonner Toasts
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              onClick={() =>
                showToast.success(
                  "Order Placed Successfully",
                  "Dispatch initiated from Mumbai warehouse."
                )
              }
            >
              Trigger Success Toast
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                showToast.error(
                  "Low Stock Threshold Reached",
                  "Only 2 units of Retinal 0.1% remaining."
                )
              }
            >
              Trigger Error Toast
            </Button>

            <Button
              variant="ghost"
              onClick={() =>
                showToast.gold("AI Scan Diagnostic Ready", "Overall score: 84/100.")
              }
            >
              Trigger Gold Toast ✨
            </Button>

            <Button variant="subtle" onClick={() => setDialogOpen(true)}>
              Open Responsive Dialog (Modal / Bottom Sheet)
            </Button>

            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open Slide-Over Drawer
            </Button>
          </div>

          {/* Dialog Instance */}
          <ResponsiveDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Luxury Regimen Customizer"
            description="Adaptable Modal on desktop (>768px) and Bottom Sheet on mobile (<768px)."
          >
            <div className="space-y-4 py-2">
              <p className="text-xs text-[#A89A85] leading-relaxed">
                This responsive dialog seamlessly morphs into a touch-friendly bottom sheet on mobile viewports
                with smooth drag gestures and zero layout distortion.
              </p>
              <Input label="Regimen Name" defaultValue="Winter Hydration Fortress" />
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setDialogOpen(false)}>
                  Save Regimen
                </Button>
              </div>
            </div>
          </ResponsiveDialog>

          {/* Drawer Instance */}
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title="Cart Quick View"
            side="right"
          >
            <div className="space-y-4">
              <p className="text-xs text-[#A89A85]">
                Slide-over drawer component for shopping bag reviews and filter panels.
              </p>
              <Skeleton variant="card" />
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setDrawerOpen(false)}
              >
                Proceed to Checkout
              </Button>
            </div>
          </Drawer>
        </section>

        {/* 7. STEPPERS, PROGRESS & STATS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              7. Steppers, Progress & Stat Cards
            </h2>
          </div>

          <div className="space-y-8">
            {/* Stepper */}
            <Card className="p-6">
              <Stepper
                steps={[
                  { id: 1, title: "Questionnaire" },
                  { id: 2, title: "AI Scan" },
                  { id: 3, title: "Diagnostics" },
                  { id: 4, title: "Checkout" },
                ]}
                currentStep={stepperStep}
                onStepClick={(step) => setStepperStep(step)}
              />
            </Card>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Skin Parameter Progress Gauges
                </h4>
                <ProgressBar value={82} label="Hydration Index" color="gold" />
                <ProgressBar value={94} label="Barrier Resilience" color="success" />
                <ProgressBar value={45} label="Sebum Regulation" color="warning" />
                <ProgressBar value={28} label="Melanin Discoloration" color="danger" />
              </Card>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Monthly Revenue"
                  value={formatINR(124500)}
                  change="+18.4%"
                  trend="up"
                  icon={<Activity className="w-4 h-4 text-[#E8C77A]" />}
                />
                <StatCard
                  label="AI Accuracy"
                  value="99.4%"
                  change="+0.8%"
                  trend="up"
                  icon={<Sparkles className="w-4 h-4 text-[#E8C77A]" />}
                />
                <StatCard
                  label="Active Orders"
                  value="48"
                  change="-2.1%"
                  trend="down"
                  icon={<ShoppingCart className="w-4 h-4 text-[#E8C77A]" />}
                />
                <StatCard
                  label="Client Rating"
                  value="4.96"
                  change="520 reviews"
                  trend="neutral"
                  icon={<Heart className="w-4 h-4 text-[#E8C77A]" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 8. DATA TABLE DEMO */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              8. TanStack Responsive Data Table
            </h2>
          </div>

          <DataTable columns={sampleColumns} data={sampleTableData} pageSize={5} />
        </section>

        {/* 9. SKELETON LOADERS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#C99A45]/20">
            <h2 className="text-xl font-heading font-semibold text-[#E8C77A]">
              9. Skeleton Loading States
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton variant="card" />
            <Skeleton variant="table" />
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <Skeleton variant="text" lines={2} className="flex-1" />
              </div>
              <Skeleton variant="rectangular" className="h-28 rounded-xl" />
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}