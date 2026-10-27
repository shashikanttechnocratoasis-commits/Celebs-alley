"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Droplets,
  Flame,
  CircleDot,
  Activity,
  ShieldAlert,
  Gauge,
  Eye,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  X,
  History,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { SensitiveActionModal } from "@/components/admin/SensitiveActionModal";
import { showToast } from "@/components/ui/Toast";
import { recomputeScanWithParameters } from "@/lib/scanEngine";
import { generateRecommendations } from "@/lib/recommendEngine";
import type { SkinParameter, Scan } from "@/types";

const AVAILABLE_ICONS = [
  "Droplets",
  "Flame",
  "Layers",
  "CircleDot",
  "Sparkles",
  "Activity",
  "ShieldAlert",
  "Gauge",
];

export default function ParameterManagerPage() {
  const {
    parameters,
    parameterDraft,
    parameterVersions,
    products,
    sellers,
    inventory,
    rules,
    platformSettings,
    scans,
    initParameterDraft,
    updateDraftParameter,
    addDraftParameter,
    removeDraftParameter,
    reorderDraftParameters,
    discardParameterDraft,
    publishParameterDraft,
  } = useAppStore();

  const isDraftActive = parameterDraft !== null;
  const currentParamList = isDraftActive ? parameterDraft : parameters;

  // The admin benchmark scans are the real customer scan records from store
  const benchmarkScans = useMemo(() => {
    return scans && scans.length > 0 ? scans : [];
  }, [scans]);

  // Selected sample for impact preview
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const activeScan = benchmarkScans[selectedSampleIndex] || benchmarkScans[0];

  // Modals state
  const [editParamModalOpen, setEditParamModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<SkinParameter | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishSummary, setPublishSummary] = useState("");
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  // Normalized weights calculation for live visual distribution bar
  const activeParams = currentParamList.filter((p) => p.status === "active");
  const totalWeight = activeParams.reduce((acc, p) => acc + (p.weight || 0.1), 0) || 1;

  const weightsBreakdown = activeParams.map((p) => ({
    id: p.id,
    name: p.name,
    weight: p.weight || 0.1,
    sharePercent: Math.round(((p.weight || 0.1) / totalWeight) * 100),
  }));

  // Impact Preview: compute LIVE scan score vs DRAFT scan score using shared pure function
  const impactAnalysis = useMemo(() => {
    if (!activeScan) {
      return {
        oldScore: 80,
        newScore: 80,
        scoreDiff: 0,
        oldConcerns: [],
        newConcerns: [],
        topPickOld: "N/A",
        topPickNew: "N/A",
        topPickChanged: false,
      };
    }

    const oldResult = recomputeScanWithParameters(activeScan, parameters);
    const newResult = recomputeScanWithParameters(activeScan, currentParamList);

    // Compute recommendations impact on top picks
    const oldRecs = generateRecommendations({
      scan: { ...activeScan, overallScore: oldResult.overallScore },
      parameters,
      products,
      sellers,
      inventory,
      rules,
      platformSettings,
    });

    const newRecs = generateRecommendations({
      scan: { ...activeScan, overallScore: newResult.overallScore },
      parameters: currentParamList,
      products,
      sellers,
      inventory,
      rules,
      platformSettings,
    });

    const topPickOld = oldRecs.topPicks[0]?.product?.name || "N/A";
    const topPickNew = newRecs.topPicks[0]?.product?.name || "N/A";

    return {
      oldScore: oldResult.overallScore,
      newScore: newResult.overallScore,
      scoreDiff: newResult.overallScore - oldResult.overallScore,
      oldConcerns: oldResult.topConcerns,
      newConcerns: newResult.topConcerns,
      topPickOld,
      topPickNew,
      topPickChanged: topPickOld !== topPickNew,
    };
  }, [activeScan, parameters, currentParamList, products, sellers, inventory, rules, platformSettings]);

  // Form State for Parameter Editor
  const [formData, setFormData] = useState<Partial<SkinParameter>>({
    name: "",
    slug: "",
    aiKey: "",
    description: "",
    unit: "%",
    minScore: 0,
    maxScore: 100,
    weight: 0.12,
    status: "active",
    icon: "Sparkles",
    interpretation: {
      low: "",
      medium: "",
      high: "",
    },
  });

  const handleOpenEdit = (p: SkinParameter) => {
    if (!isDraftActive) {
      initParameterDraft();
    }
    setEditingParam(p);
    setFormData({
      ...p,
      interpretation: { ...(p.interpretation || { low: "", medium: "", high: "" }) },
    });
    setIsCreating(false);
    setEditParamModalOpen(true);
  };

  const handleOpenCreate = () => {
    if (!isDraftActive) {
      initParameterDraft();
    }
    setEditingParam(null);
    setFormData({
      name: "",
      slug: "",
      aiKey: "",
      description: "",
      unit: "%",
      minScore: 0,
      maxScore: 100,
      weight: 0.12,
      status: "active",
      icon: "Sparkles",
      interpretation: {
        low: "Marked deficit detected. Requires active intervention.",
        medium: "Moderate biological balance within standard bounds.",
        high: "Optimal barrier cellular luminosity.",
      },
    });
    setIsCreating(true);
    setEditParamModalOpen(true);
  };

  const handleSaveParamForm = () => {
    if (!formData.name?.trim()) {
      showToast.error("Parameter name is required.");
      return;
    }

    const slug = formData.slug?.trim() || formData.name.toLowerCase().replace(/\s+/g, "_");
    const aiKey = formData.aiKey?.trim() || `skin_${slug}_index`;

    if (isCreating) {
      addDraftParameter({
        name: formData.name.trim(),
        slug,
        aiKey,
        description: formData.description || "Clinical parameter diagnostic evaluation.",
        unit: formData.unit || "%",
        minScore: formData.minScore ?? 0,
        maxScore: formData.maxScore ?? 100,
        weight: Number(formData.weight) || 0.12,
        status: formData.status || "active",
        displayOrder: currentParamList.length + 1,
        icon: formData.icon || "Sparkles",
        interpretation: formData.interpretation as any,
      });
      showToast.success(`Added ${formData.name} to draft parameters.`);
    } else if (editingParam) {
      updateDraftParameter(editingParam.id, {
        ...formData,
        slug,
        aiKey,
        weight: Number(formData.weight) || 0.12,
      });
      showToast.success(`Updated ${formData.name} in draft.`);
    }

    setEditParamModalOpen(false);
  };

  const handleToggleStatus = (p: SkinParameter) => {
    if (!isDraftActive) {
      initParameterDraft();
    }
    const newStatus = p.status === "active" ? "inactive" : "active";
    updateDraftParameter(p.id, { status: newStatus });
    showToast.info(`Parameter ${p.name} marked as ${newStatus} in draft.`);
  };

  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    if (!isDraftActive) initParameterDraft();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentParamList.length) return;

    const copy = [...currentParamList];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    reorderDraftParameters(copy.map((p) => p.id));
  };

  const handlePublishConfirm = () => {
    const summary = publishSummary.trim() || `Calibrated parameter weights & engine settings.`;
    const res = publishParameterDraft(summary);
    if (res.success) {
      setPublishModalOpen(false);
      setPublishSummary("");
      showToast.success(
        `Successfully published version ${res.version.version}! Changes are now live on results and recommendations.`
      );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C99A45]/20 pb-5">
        <div>
          <PageHeader
            title="AI Parameter Engine Calibration"
            breadcrumbs={[
              { label: "Admin", href: "/admin" },
              { label: "AI Engine" },
              { label: "Parameters" },
            ]}
          />
          <p className="text-xs text-[#A89A85] mt-1 max-w-2xl leading-relaxed">
            Configure the 8 biological skin diagnostic parameters. Edits are staged in a live draft
            with real-time impact simulation against real consumer scans before publishing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isDraftActive ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDiscardModalOpen(true)}
                className="text-[#D4604F] hover:bg-red-500/10"
              >
                Discard Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => setPublishModalOpen(true)}
              >
                Publish Live Changes
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
              onClick={() => {
                initParameterDraft();
                showToast.info("Parameter draft mode initiated. Edits will stay local until published.");
              }}
            >
              Start Draft Mode
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
          >
            Add Parameter
          </Button>

          <Link href="/admin/ai-engine/versions">
            <Button variant="ghost" size="sm" leftIcon={<History className="w-3.5 h-3.5" />}>
              Versions ({parameterVersions.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {isDraftActive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <span className="font-semibold text-amber-200">
                You are currently in Draft Staging Mode.
              </span>
              <p className="text-[#A89A85] text-[11px] mt-0.5">
                The live customer boutique, facial scan engine, and seller AI mappings are running{" "}
                <span className="font-mono text-[#E8C77A] font-medium">
                  {parameterVersions[0]?.version?.startsWith("v")
                    ? parameterVersions[0]?.version
                    : `v${parameterVersions[0]?.version || "1.0"}`}
                </span>
                . Review the Impact Preview before publishing.
              </p>
            </div>
          </div>
          <Badge variant="gold" size="sm">
            Unpublished Edits
          </Badge>
        </div>
      )}

      {/* Normalized Weights Visual Bar */}
      <Card className="p-5 bg-[#1A130B] border-[#C99A45]/25 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F5EDE0] uppercase tracking-wider">
              Normalized Algorithmic Weight Distribution
            </span>
            <span className="text-[#A89A85]">• Effective Share of 100%</span>
          </div>
          <span className="font-mono text-xs text-[#E8C77A]">
            Total Raw Weight: {totalWeight.toFixed(2)}
          </span>
        </div>

        {/* Progress Bar Segmented */}
        <div className="h-4 w-full rounded-full bg-[#0B0907] border border-[#C99A45]/30 flex overflow-hidden p-0.5">
          {weightsBreakdown.map((item, idx) => {
            const colors = [
              "bg-[#C99A45]",
              "bg-[#E8C77A]",
              "bg-[#B8812F]",
              "bg-[#5FAF7A]",
              "bg-[#6FA3C7]",
              "bg-[#D4604F]",
              "bg-[#A89A85]",
              "bg-[#E0A93B]",
            ];
            const color = colors[idx % colors.length];

            return (
              <div
                key={item.id}
                style={{ width: `${item.sharePercent}%` }}
                className={`${color} h-full transition-all duration-300 relative group cursor-pointer first:rounded-l-full last:rounded-r-full`}
                title={`${item.name}: ${item.sharePercent}%`}
              />
            );
          })}
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
          {weightsBreakdown.map((item, idx) => {
            const rawColors = [
              "#C99A45",
              "#E8C77A",
              "#B8812F",
              "#5FAF7A",
              "#6FA3C7",
              "#D4604F",
              "#A89A85",
              "#E0A93B",
            ];
            const hex = rawColors[idx % rawColors.length];
            return (
              <div
                key={item.id}
                style={{ borderColor: `${hex}80` }}
                className="px-2.5 py-1 rounded-full bg-[#0B0907] border flex items-center gap-1.5 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: hex }} />
                <span className="text-[#F5EDE0] font-medium tracking-wide">{item.name}:</span>
                <span className="font-bold text-[#E8C77A] font-mono">{item.sharePercent}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Parameters Table & Impact Preview Pane */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Parameter Cards / Table (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
              Biological Parameter Registry ({currentParamList.length})
            </h3>
            <span className="text-xs text-[#A89A85]">
              {activeParams.length} Active • {currentParamList.length - activeParams.length} Disabled
            </span>
          </div>

          <div className="space-y-3">
            {currentParamList.map((param, index) => {
              const isActive = param.status === "active";
              const share = weightsBreakdown.find((w) => w.id === param.id)?.sharePercent || 0;

              return (
                <Card
                  key={param.id}
                  className={`p-4 bg-[#1A130B] border transition-all ${
                    isActive ? "border-[#C99A45]/30 hover:border-[#E8C77A]" : "border-[#C99A45]/10 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#0B0907] border border-[#C99A45]/30 flex items-center justify-center text-[#E8C77A] shrink-0 mt-0.5">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="font-heading text-base font-semibold text-[#F5EDE0]"
                            style={{ color: "#F5EDE0" }}
                          >
                            {param.name}
                          </h4>
                          <Badge variant={isActive ? "gold" : "outline"} size="sm">
                            {isActive ? "Active" : "Disabled"}
                          </Badge>
                          <span
                            className="text-[11px] font-mono text-[#6F6354]"
                            style={{ color: "#6F6354" }}
                          >
                            #{param.displayOrder}
                          </span>
                        </div>
                        <p
                          className="text-xs text-[#A89A85] line-clamp-1 mt-0.5"
                          style={{ color: "#A89A85" }}
                        >
                          {param.description}
                        </p>
                        <div
                          className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#A89A85]"
                          style={{ color: "#A89A85" }}
                        >
                          <span>Key: {param.slug}</span>
                          <span>•</span>
                          <span>Weight: {param.weight?.toFixed(2)} ({share}%)</span>
                          <span>•</span>
                          <span>Unit: {param.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {/* Order Controls */}
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-[#0B0907] border border-[#C99A45]/20 text-[#A89A85] hover:text-[#E8C77A] disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === currentParamList.length - 1}
                        className="p-1.5 rounded-lg bg-[#0B0907] border border-[#C99A45]/20 text-[#A89A85] hover:text-[#E8C77A] disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Toggle */}
                      <Button
                        size="sm"
                        variant={isActive ? "outline" : "secondary"}
                        className="h-7 text-xs px-2.5"
                        onClick={() => handleToggleStatus(param)}
                      >
                        {isActive ? "Disable" : "Enable"}
                      </Button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpenEdit(param)}
                        title="Edit Parameter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Delete / Archive */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                        onClick={() => {
                          if (!isDraftActive) initParameterDraft();
                          const res = removeDraftParameter(param.id);
                          if (res.success) showToast.info(res.message);
                        }}
                        title="Archive / Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Side-by-Side Impact Preview Pane (5 cols) */}
        <div className="xl:col-span-5 sticky top-24 space-y-6">
          <Card className="p-6 bg-[#1A130B] border-gold-400/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#C99A45]/20 pb-4">
              <div>
                <Badge variant="gold" size="sm">
                  Clinical Impact Engine
                </Badge>
                <h3 className="font-heading text-lg font-semibold text-[#F5EDE0] mt-1">
                  Side-by-Side Diagnostic Preview
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Live evaluation of draft parameter weights against customer facial scans
                </p>
              </div>
            </div>

            {/* Persona Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#A89A85] uppercase tracking-wider font-semibold block">
                Select Benchmark Consumer Scan:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {benchmarkScans.slice(0, 3).map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedSampleIndex === idx
                        ? "bg-[#241A0F] border-[#E8C77A] text-[#F5EDE0] shadow-gold-glow"
                        : "bg-[#0B0907] border-[#C99A45]/20 text-[#A89A85] hover:text-[#F5EDE0]"
                    }`}
                  >
                    <span
                      className="font-semibold block truncate"
                      style={{ color: selectedSampleIndex === idx ? "#F5EDE0" : "#A89A85" }}
                    >
                      {sample.customerName || "Customer Scan"}
                    </span>
                    <span
                      className="text-[10px] block font-mono"
                      style={{ color: "#C99A45" }}
                    >
                      {sample.id === "scan-sample-1" ? "Baseline Scan" : sample.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score Delta Box */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0B0907] border border-[#C99A45]/30 text-center">
              <div>
                <span className="text-[11px] text-[#A89A85] uppercase tracking-wider block">
                  Live Production Score
                </span>
                <span className="font-heading text-3xl font-bold text-[#A89A85] mt-1 block">
                  {impactAnalysis.oldScore}
                </span>
                <span className="text-[10px] text-[#6F6354] font-mono">v1.0 Standard</span>
              </div>

              <div>
                <span className="text-[11px] text-[#C99A45] uppercase tracking-wider block">
                  Draft Projected Score
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-heading text-3xl font-bold text-[#E8C77A]">
                    {impactAnalysis.newScore}
                  </span>
                  {impactAnalysis.scoreDiff !== 0 && (
                    <span
                      className={`text-xs font-mono font-bold flex items-center ${
                        impactAnalysis.scoreDiff > 0 ? "text-[#5FAF7A]" : "text-[#D4604F]"
                      }`}
                    >
                      {impactAnalysis.scoreDiff > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {impactAnalysis.scoreDiff > 0 ? `+${impactAnalysis.scoreDiff}` : impactAnalysis.scoreDiff}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#C99A45] font-mono">Simulated Recalibration</span>
              </div>
            </div>

            {/* Top Concerns Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#F5EDE0] uppercase tracking-wider">
                Top Priority Clinical Concerns
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Old concerns */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#0B0907] border border-[#C99A45]/15">
                  <span className="text-[10px] font-mono text-[#A89A85] uppercase block">Current Live:</span>
                  {impactAnalysis.oldConcerns.map((c) => (
                    <div key={c.parameterId} className="flex items-center justify-between text-[#F5EDE0]">
                      <span className="truncate">{c.name}</span>
                      <span className="font-mono text-[#A89A85]">{c.score}</span>
                    </div>
                  ))}
                </div>

                {/* New concerns */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#241A0F] border border-[#E8C77A]/30">
                  <span className="text-[10px] font-mono text-[#E8C77A] uppercase block">Draft Result:</span>
                  {impactAnalysis.newConcerns.map((c) => (
                    <div key={c.parameterId} className="flex items-center justify-between text-[#F5EDE0]">
                      <span className="truncate">{c.name}</span>
                      <span className="font-mono text-[#E8C77A]">{c.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Commerce Recommendations Impact */}
            <div className="p-3.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 text-xs space-y-1.5">
              <span className="text-[10px] font-mono text-[#C99A45] uppercase tracking-wider block">
                Boutique Algorithm Impact
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A89A85]">Top Pick Formulation:</span>
                <span className="font-semibold text-[#F5EDE0] text-right truncate max-w-[200px]">
                  {impactAnalysis.topPickNew}
                </span>
              </div>
              {impactAnalysis.topPickChanged && (
                <span className="text-[11px] text-[#5FAF7A] flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5" /> Top recommendation adjusted based on new parameter weights.
                </span>
              )}
            </div>

            {/* Publish Action Button */}
            {isDraftActive && (
              <Button
                variant="primary"
                className="w-full py-3"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => setPublishModalOpen(true)}
              >
                Publish Calibrated Engine (Live)
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Parameter Edit / Add Modal */}
      <ResponsiveDialog
        open={editParamModalOpen}
        onOpenChange={setEditParamModalOpen}
        title={isCreating ? "Add AI Diagnostic Parameter" : `Edit ${editingParam?.name}`}
        description="Configure scoring bounds, clinical interpretation copy, and algorithmic weighting."
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#A89A85] font-semibold block mb-1">Parameter Name *</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Elasticity"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#A89A85] font-semibold block mb-1">Unique Slug</label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. elasticity"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[#A89A85] font-semibold block mb-1">Clinical Description</label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Biological measurement of dermal recoil..."
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#A89A85] font-semibold block mb-1">Weight (0.01 - 0.50)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.50"
                value={formData.weight || 0.12}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[#A89A85] font-semibold block mb-1">Display Unit</label>
              <input
                type="text"
                value={formData.unit || "%"}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#A89A85] font-semibold block mb-1">Status</label>
              <select
                value={formData.status || "active"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Disabled / Archived</option>
              </select>
            </div>
          </div>

          {/* 3-Tier Diagnostic Interpretation Texts */}
          <div className="space-y-2 pt-2 border-t border-[#C99A45]/15">
            <label className="text-[#E8C77A] font-semibold uppercase tracking-wider block text-[11px]">
              3-Tier Interpretation Copy:
            </label>

            <div>
              <span className="text-[11px] text-red-300 font-mono">Low Score Tier (&lt;60):</span>
              <input
                type="text"
                value={formData.interpretation?.low || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interpretation: { ...(formData.interpretation as any), low: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] mt-0.5"
              />
            </div>

            <div>
              <span className="text-[11px] text-amber-300 font-mono">Medium Score Tier (60 - 79):</span>
              <input
                type="text"
                value={formData.interpretation?.medium || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interpretation: { ...(formData.interpretation as any), medium: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] mt-0.5"
              />
            </div>

            <div>
              <span className="text-[11px] text-emerald-300 font-mono">Optimal / High Score Tier (80+):</span>
              <input
                type="text"
                value={formData.interpretation?.high || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interpretation: { ...(formData.interpretation as any), high: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] mt-0.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C99A45]/15">
            <Button variant="ghost" size="sm" onClick={() => setEditParamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveParamForm}>
              {isCreating ? "Add to Draft" : "Update Draft Parameter"}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Sensitive Action Modal for Live Publication with Type CONFIRM */}
      <SensitiveActionModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        title="Publish Live AI Parameter Version"
        description="This will promote your staged draft to production. All subsequent customer scans, 8-parameter diagnostics, boutique recommendations, and seller AI mapping interfaces will immediately use this configuration."
        confirmLabel="Authorize & Publish Live"
        isDestructive={false}
        requireTypeConfirm={true}
        expectedKeyword="CONFIRM"
      />

      {/* Discard Draft Modal */}
      <ResponsiveDialog
        open={discardModalOpen}
        onOpenChange={setDiscardModalOpen}
        title="Discard Parameter Draft?"
        description="All staged parameter edits, weights, and reordering will be permanently erased."
      >
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setDiscardModalOpen(false)}>
            Keep Editing
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-red-400 hover:bg-red-500/10"
            onClick={() => {
              discardParameterDraft();
              setDiscardModalOpen(false);
              showToast.info("Parameter draft discarded. Staged changes cleared.");
            }}
          >
            Discard Draft
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
