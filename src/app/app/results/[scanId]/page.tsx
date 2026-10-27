"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Printer,
  Trash2,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Activity,
  Award,
  Layers,
  Sparkle
} from "lucide-react";
import { useAppStore } from "@/store";
import { ParameterGauge } from "@/components/app/ParameterGauge";
import { ResultsRadarChart } from "@/components/app/ResultsRadarChart";
import { computeOverallScore, recomputeScanWithParameters, getParameterScore } from "@/lib/scanEngine";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { toast } from "@/components/ui/Toast";
import ingredientsData from "@/data/ingredients.json";

export default function ScanResultsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params?.scanId as string;

  const { scans, parameters, deleteScan } = useAppStore();

  const [selectedParamId, setSelectedParamId] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activePhotoPose, setActivePhotoPose] = useState<"front" | "left" | "right">("front");
  const [showComparison, setShowComparison] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Find the requested scan
  const currentScan = useMemo(() => {
    return scans.find((s) => s.id === scanId) || scans[0];
  }, [scans, scanId]);

  // Find previous scan for trend comparisons
  const previousScan = useMemo(() => {
    if (!currentScan) return undefined;
    const currentIndex = scans.findIndex((s) => s.id === currentScan.id);
    return currentIndex !== -1 && currentIndex + 1 < scans.length
      ? scans[currentIndex + 1]
      : undefined;
  }, [scans, currentScan]);

  // Read active parameters dynamically from store
  const activeParams = useMemo(() => {
    return parameters.filter((p) => p.status === "active");
  }, [parameters]);

  // Recomputed scan with live parameters (single source of truth for overallScore and topConcerns)
  const dynamicScan = useMemo(() => {
    if (!currentScan) return null;
    return recomputeScanWithParameters(currentScan, parameters);
  }, [currentScan, parameters]);

  // Compute dynamic overall score from published weights using shared pure function
  const overallScore = useMemo(() => {
    if (dynamicScan) return dynamicScan.overallScore;
    if (!currentScan) return 80;
    return computeOverallScore(currentScan, parameters);
  }, [dynamicScan, currentScan, parameters]);

  const prevOverallScore = useMemo(() => {
    if (!previousScan) return undefined;
    return computeOverallScore(previousScan, parameters);
  }, [previousScan, parameters]);

  // Radar chart data mapping
  const radarData = useMemo(() => {
    if (!currentScan) return [];
    return activeParams.map((param) => {
      const scoreVal = getParameterScore(currentScan, param);
      const prevScoreVal = previousScan ? getParameterScore(previousScan, param) : undefined;
      return {
        parameterName: param.name.replace(" and ", " & "),
        currentScore: typeof scoreVal === "number" ? scoreVal : 0,
        previousScore: typeof prevScoreVal === "number" ? prevScoreVal : undefined,
        fullMark: 100,
      };
    });
  }, [activeParams, currentScan, previousScan]);

  // Selected parameter details for modal
  const activeDetailParam = useMemo(() => {
    if (!selectedParamId) return null;
    const paramMeta = parameters.find((p) => p.id === selectedParamId);
    if (!paramMeta) return null;
    const scoreVal = getParameterScore(currentScan, paramMeta);

    let band: "optimal" | "moderate" | "attention" = "optimal";
    let interpretation = paramMeta.interpretation?.high || "Optimal balance";
    if (typeof scoreVal !== "number") {
      interpretation = "Not analysed in this scan.";
    } else if (scoreVal < 60) {
      band = "attention";
      interpretation = paramMeta.interpretation?.low || "Needs clinical focus";
    } else if (scoreVal < 75) {
      band = "moderate";
      interpretation = paramMeta.interpretation?.medium || "Moderate stability";
    }

    // Find matched ingredients
    const matchedIngredients = (ingredientsData as Array<{
      id: string;
      name: string;
      inciName: string;
      benefits: string[];
      concernTags: string[];
    }>).filter((ing) => {
      const tags = (ing.concernTags || []).map((t) => t.toLowerCase());
      const paramName = paramMeta.name.toLowerCase();
      return tags.some((t) => paramName.includes(t) || t.includes(paramName.split(" ")[0]));
    }).slice(0, 4);

    return {
      ...paramMeta,
      score: scoreVal,
      band,
      interpretation,
      matchedIngredients,
    };
  }, [selectedParamId, parameters, currentScan]);

  if (!currentScan) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-cream-100">Scan record not found</h2>
        <Button onClick={() => router.push("/app/scan")}>Capture New Scan</Button>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDeleteScan = () => {
    deleteScan(currentScan.id);
    toast.success("Scan record deleted successfully.");
    setDeleteConfirmOpen(false);
    router.replace("/app/results");
  };

  const getOverallVerdict = (score: number) => {
    if (score >= 85) return "Exceptional Cellular Equilibrium & High Barrier Integrity";
    if (score >= 70) return "Healthy Stratum Corneum with Targeted Moisture Needs";
    if (score >= 55) return "Mild Lipid Disruption & Early Photo-Stress Observed";
    return "Vascular Sensitivity & Transepidermal Moisture Loss Detected";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 print:p-0 print:bg-white print:text-black">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/15 pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {new Date(currentScan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Quality: {currentScan.qualityScore}% (Biometric Confirmed)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-cream-100 font-normal">
            8-Parameter Cellular Scorecard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Download Summary
          </Button>
          <Button asChild size="sm" className="text-xs shadow-gold-glow">
            <Link href="/app/scan">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Scan Again
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 3-Zone Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Zone 1: Photo & Overall Score */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center space-y-6 bg-gradient-to-b from-surface to-base border-gold-400/25 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400">
                Skin Vitality Index
              </span>
              <h2 className="font-serif text-xl text-cream-100 font-normal">
                Overall Health Score
              </h2>
            </div>

            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="#241A0F"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="url(#goldGradient)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 - (overallScore / 100) * (2 * Math.PI * 68)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5EBDC" />
                    <stop offset="50%" stopColor="#E5A93C" />
                    <stop offset="100%" stopColor="#996515" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-5xl font-bold text-cream-100 tracking-tight">
                  {overallScore}
                </span>
                <span className="text-xs font-mono text-gold-400 font-medium">/ 100</span>
              </div>
            </div>

            <p className="text-xs text-cream-200/90 leading-relaxed italic bg-base/50 p-3 rounded-xl border border-gold-400/10">
              &ldquo;{getOverallVerdict(overallScore)}&rdquo;
            </p>
          </Card>

          {/* 3-Pose Viewer */}
          <Card className="p-5 space-y-4 bg-surface/70 border-gold-400/15">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 3-Angle Captures
              </h3>
              <button
                onClick={() => setPhotoModalOpen(true)}
                className="text-xs text-gold-400 hover:text-gold-300 underline font-medium cursor-pointer"
              >
                Expand View
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(["front", "left", "right"] as const).map((pose) => (
                <button
                  key={pose}
                  onClick={() => {
                    setActivePhotoPose(pose);
                    setPhotoModalOpen(true);
                  }}
                  className="group aspect-[3/4] rounded-xl overflow-hidden border border-gold-400/20 relative bg-base hover:border-gold-400 transition-all cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentScan.thumbnails[pose] || "/brand/logo.png"}
                    alt={`${pose} capture`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-gold-400 uppercase text-center backdrop-blur-sm">
                    {pose}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Consultation Bridge */}
          <Card className="p-5 space-y-3 bg-gradient-to-br from-gold-500/10 via-surface to-base border-gold-400/30">
            <div className="flex items-center gap-2 text-gold-400 font-semibold text-xs">
              <UserCheck className="w-4 h-4" /> Need Expert Guidance?
            </div>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              Book a 1-on-1 virtual consultation with a certified dermal specialist to review your biomarker report.
            </p>
            <Button asChild size="sm" variant="secondary" className="w-full text-xs">
              <Link href={`/book?concern=${encodeURIComponent(currentScan.topConcerns[0]?.name || "Skin Analysis")}`}>
                Book Consultation with Top Concern
              </Link>
            </Button>
          </Card>
        </div>

        {/* Zone 2: Gauges & Radar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 space-y-4 bg-surface/70 border-gold-400/15">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Biometric Radar Map
              </h3>
              {previousScan && (
                <label className="flex items-center gap-1.5 text-xs text-cream-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showComparison}
                    onChange={(e) => setShowComparison(e.target.checked)}
                    className="rounded border-gold-400/30 text-gold-400 focus:ring-gold-400"
                  />
                  <span>Compare with Previous</span>
                </label>
              )}
            </div>

            <ResultsRadarChart data={radarData} showComparison={showComparison} />
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold-400">
                Diagnostic Parameters ({activeParams.length} Active)
              </h3>
              <span className="text-[11px] text-cream-400">Tap parameter for clinical tips</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {activeParams.map((param) => {
                const scoreVal = getParameterScore(currentScan, param);
                let interpVal = param.interpretation?.high || "Optimal balance";
                if (typeof scoreVal !== "number") {
                  interpVal = "Not analysed in this scan";
                } else if (scoreVal < 60) {
                  interpVal = param.interpretation?.low || "Needs focus";
                } else if (scoreVal < 75) {
                  interpVal = param.interpretation?.medium || "Moderate";
                }

                return (
                  <ParameterGauge
                    key={param.id}
                    name={param.name}
                    score={scoreVal}
                    weight={param.weight}
                    category="Skin Parameter"
                    interpretation={interpVal}
                    onClick={() => setSelectedParamId(param.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone 3: Top Concerns & Trends */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 space-y-4 bg-surface/70 border-gold-400/15">
            <div className="flex items-center gap-1.5 text-gold-400">
              <Award className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase tracking-wider font-semibold">
                Top Priority Concerns
              </h3>
            </div>

            <div className="space-y-3">
              {(dynamicScan?.topConcerns || currentScan.topConcerns).slice(0, 3).map((concern, idx) => (
                <div
                  key={concern.parameterId}
                  className="p-3.5 rounded-xl bg-base/60 border border-gold-400/15 space-y-1.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      Rank #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-cream-200">
                      Score: {concern.score}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-cream-100">{concern.name}</h4>
                  <p className="text-xs text-cream-300/80 leading-relaxed">
                    {concern.interpretation}
                  </p>
                  <div className="text-[11px] text-gold-400/90 pt-1 font-medium border-t border-gold-400/10">
                    Focus: {concern.focusTip}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {previousScan && (
            <Card className="p-5 space-y-3 bg-surface/70 border-gold-400/15">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Historical Progression
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-base/60">
                  <span className="text-cream-300">Overall Vitality:</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span>{prevOverallScore ?? 80} → {overallScore}</span>
                    {overallScore >= (prevOverallScore ?? 80) ? (
                      <span className="text-emerald-400 flex items-center">
                        <TrendingUp className="w-3 h-3 ml-1" /> +{overallScore - (prevOverallScore ?? 80)}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center">
                        <TrendingDown className="w-3 h-3 ml-1" /> {overallScore - (prevOverallScore ?? 80)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-cream-400 italic">
                  Comparing current scan with previous session on {new Date(previousScan.createdAt).toLocaleDateString("en-IN")}.
                </p>
              </div>
            </Card>
          )}

          <Card className="p-5 space-y-3 bg-surface/70 border-gold-400/15 text-center">
            <ShoppingBag className="w-6 h-6 text-gold-400 mx-auto" />
            <h4 className="text-sm font-semibold text-cream-100">
              Tailored Product Regimen
            </h4>
            <p className="text-xs text-cream-300/80">
              Formulas selected to address your top concerns: {currentScan.topConcerns[0]?.name}.
            </p>
            <Button asChild size="sm" className="w-full text-xs shadow-gold-glow">
              <Link href="/app/shop?tab=for-you">
                See Recommended Products
              </Link>
            </Button>
          </Card>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface/40 border border-gold-400/10 text-center text-xs text-cream-400/70 max-w-3xl mx-auto space-y-1">
        <p className="font-semibold text-cream-300">Cosmetic Wellness Diagnostic Disclaimer</p>
        <p>
          Celebs Alley computer vision metrics are designed for aesthetic wellness, regimen planning, and beauty customization. This is a simulated software analysis and does not constitute a medical diagnosis or prescription.
        </p>
      </div>

      {/* Parameter Deep Insight Dialog */}
      <ResponsiveDialog
        open={Boolean(selectedParamId)}
        onOpenChange={(open) => !open && setSelectedParamId(null)}
        title={activeDetailParam?.name || "Parameter Detail"}
        description={activeDetailParam?.name ? `Diagnostic Category: ${activeDetailParam.name}` : undefined}
      >
        {activeDetailParam && (
          <div className="space-y-5 text-cream-200">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-gold-400/20">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase">Diagnostic Score</span>
                <div className="font-serif text-3xl font-bold text-cream-100">
                  {typeof activeDetailParam.score === "number" ? (
                    <>
                      {activeDetailParam.score} <span className="text-xs font-mono text-cream-400">/ 100</span>
                    </>
                  ) : (
                    <span className="text-sm font-sans text-cream-400 italic">Not analysed in this scan</span>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                typeof activeDetailParam.score === "number" && activeDetailParam.score >= 75
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : typeof activeDetailParam.score === "number" && activeDetailParam.score >= 60
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-rose-500/20 border-rose-500/40 text-rose-400"
              }`}>
                {activeDetailParam.band.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-semibold text-gold-400">Biometric Clinical Meaning</h4>
              <p className="text-cream-300/90">{activeDetailParam.description}</p>
              <div className="p-3 rounded-lg bg-base/80 border border-gold-400/10 italic text-cream-200">
                &ldquo;{activeDetailParam.interpretation}&rdquo;
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-semibold text-gold-400">Suggested Lifestyle Actions</h4>
              <ul className="list-disc list-inside space-y-1 text-cream-300">
                <li>Maintain 2.5L daily hydration to support intercellular matrix volume.</li>
                <li>Apply broad-spectrum non-comedogenic SPF 50+ every 3 hours outdoors.</li>
                <li>Avoid physical abrasive scrubs; opt for gentle enzymatic micro-exfoliation.</li>
              </ul>
            </div>

            {activeDetailParam.matchedIngredients.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gold-400/10">
                <h4 className="font-semibold text-xs text-gold-400 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5" /> Target Active Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeDetailParam.matchedIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="p-2.5 rounded-lg bg-surface/80 border border-gold-400/15 text-xs space-y-1"
                    >
                      <div className="font-semibold text-cream-100">{ing.name}</div>
                      <div className="text-[10px] text-gold-400/80 italic">{ing.inciName}</div>
                      <div className="text-[11px] text-cream-300 line-clamp-1">
                        {(ing.benefits || []).join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedParamId(null)}>
                Close Insights
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      {/* 3-Pose Modal */}
      <ResponsiveDialog
        open={photoModalOpen}
        onOpenChange={setPhotoModalOpen}
        title="Biometric Pose Gallery"
        description="High-definition 3-angle facial captures"
      >
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-gold-400/30 flex items-center justify-center relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentScan.thumbnails[activePhotoPose] || "/brand/logo.png"}
              alt={`${activePhotoPose} full pose`}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded-full text-xs font-mono text-gold-400 uppercase">
              {activePhotoPose} Pose
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["front", "left", "right"] as const).map((pose) => (
              <Button
                key={pose}
                variant={activePhotoPose === pose ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActivePhotoPose(pose)}
                className="capitalize text-xs"
              >
                {pose} Pose
              </Button>
            ))}
          </div>
        </div>
      </ResponsiveDialog>

      {/* Delete Confirmation Modal */}
      <ResponsiveDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Scan Record?"
        description="This will permanently delete this scan from your device history."
      >
        <div className="space-y-4 text-xs text-cream-200">
          <p>
            Are you sure you want to delete this scan session from {new Date(currentScan.createdAt).toLocaleDateString("en-IN")}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteScan}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
