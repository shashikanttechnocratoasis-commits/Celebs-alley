"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { generateRecommendations } from "@/lib/recommendEngine";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import sampleScansData from "@/data/sampleScans.json";
import type { RecommendationRule, Scan } from "@/types";

export default function AIDiagnosticMatchingRulesPage() {
  const {
    recommendationRules,
    platformSettings,
    parameters,
    products,
    sellers,
    inventory,
    addRecommendationRule,
    updateRecommendationRule,
    deleteRecommendationRule,
    updatePlatformSettings,
  } = useAppStore();

  const { canEdit, canDelete } = useAdminPermission("rules");

  // Local settings state
  const [localSettings, setLocalSettings] = useState(platformSettings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Filter / Category Tab
  const [activeTab, setActiveTab] = useState<"all" | "safety" | "clinical">("all");

  // Rule Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formConditionType, setFormConditionType] = useState<RecommendationRule["conditionType"]>("parameter_score_below");
  const [formTargetParameterId, setFormTargetParameterId] = useState("");
  const [formThreshold, setFormThreshold] = useState(60);
  const [formActionType, setFormActionType] = useState<RecommendationRule["actionType"]>("boost_mapped_products");
  const [formBoostPercent, setFormBoostPercent] = useState(15);
  const [formPriority, setFormPriority] = useState(10);
  const [formError, setFormError] = useState("");

  // Testing Sandbox State
  const [testSampleScanId, setTestSampleScanId] = useState<string>("scan-1");

  // Rules filtered
  const filteredRules = useMemo(() => {
    return recommendationRules
      .filter((r) => {
        if (activeTab === "safety") return r.isLocked;
        if (activeTab === "clinical") return !r.isLocked;
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }, [recommendationRules, activeTab]);

  // Handle Opening Modal for Add or Edit
  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormName("");
    setFormDescription("");
    setFormConditionType("parameter_score_below");
    setFormTargetParameterId(parameters[0]?.id || "");
    setFormThreshold(60);
    setFormActionType("boost_mapped_products");
    setFormBoostPercent(15);
    setFormPriority(recommendationRules.length + 1);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: RecommendationRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDescription(rule.description);
    setFormConditionType(rule.conditionType);
    setFormTargetParameterId(rule.targetParameterId || parameters[0]?.id || "");
    setFormThreshold(rule.threshold || 60);
    setFormActionType(rule.actionType);
    setFormBoostPercent(rule.boostPercent || 15);
    setFormPriority(rule.priority);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Rule name is required.");
      return;
    }

    if (editingRule) {
      updateRecommendationRule(editingRule.id, {
        name: formName,
        description: formDescription,
        conditionType: formConditionType,
        targetParameterId: formTargetParameterId,
        threshold: formThreshold,
        actionType: formActionType,
        boostPercent: formBoostPercent,
        priority: formPriority,
      });
    } else {
      const newRule: RecommendationRule = {
        id: `rule-${Date.now()}`,
        name: formName,
        description: formDescription,
        conditionType: formConditionType,
        targetParameterId: formTargetParameterId,
        threshold: formThreshold,
        actionType: formActionType,
        boostPercent: formBoostPercent,
        priority: formPriority,
        status: "active",
        isLocked: false,
      };
      addRecommendationRule(newRule);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (rule: RecommendationRule) => {
    if (rule.isLocked) return;
    updateRecommendationRule(rule.id, {
      status: rule.status === "active" ? "disabled" : "active",
    });
  };

  const handleDelete = (ruleId: string, isLocked?: boolean) => {
    if (isLocked) return;
    if (confirm("Are you sure you want to delete this recommendation rule?")) {
      deleteRecommendationRule(ruleId);
    }
  };

  // Save Global Settings
  const handleSaveSettings = () => {
    updatePlatformSettings(localSettings);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Test Sandbox Execution
  const sampleScan = useMemo(() => {
    const raw = sampleScansData.find((s) => s.id === testSampleScanId) || sampleScansData[0];
    return {
      ...raw,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "completed" as const,
      recommendations: [],
      notes: "",
      flaggedConcerns: [],
    } as unknown as Scan;
  }, [testSampleScanId]);

  // Recommendation Before vs After (With vs Without active clinical rules)
  const simulationResults = useMemo(() => {
    const withRules = generateRecommendations({
      scan: sampleScan,
      parameters,
      products,
      sellers,
      inventory,
      rules: recommendationRules,
      platformSettings: localSettings,
    });

    // Baseline with locked safety rules ONLY
    const baselineRules = recommendationRules.filter((r) => r.isLocked);
    const withoutClinicalRules = generateRecommendations({
      scan: sampleScan,
      parameters,
      products,
      sellers,
      inventory,
      rules: baselineRules,
      platformSettings: localSettings,
    });

    return {
      withRules: (withRules.topPicks || []).slice(0, 5),
      baseline: (withoutClinicalRules.topPicks || []).slice(0, 5),
    };
  }, [sampleScan, parameters, products, sellers, inventory, recommendationRules, localSettings]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Recommendation Rules & Guardrails"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "AI Engine", href: "/admin/ai-engine/parameters" },
          { label: "Rules" },
        ]}
      />

      {/* Global Safety & Clinical Threshold Controls */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Global Clinical Guardrails & Thresholds</h2>
              <p className="text-xs text-zinc-400">
                Core governance constraints that apply globally across all prescription formulations.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={!canEdit}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isSettingsSaved ? <CheckCircle2 className="h-4 w-4" /> : null}
            {isSettingsSaved ? "Settings Applied" : "Save Thresholds"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Max Cap */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">Max Score Cap</span>
              <span className="font-mono text-amber-400">{localSettings.maxRecommendationScoreCap}%</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Honest scoring cap to prevent misleading 100% guarantees.
            </p>
            <input
              type="range"
              min={85}
              max={99}
              value={localSettings.maxRecommendationScoreCap}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maxRecommendationScoreCap: Number(e.target.value),
                })
              }
              className="mt-3 w-full accent-amber-500"
            />
          </div>

          {/* Severe Allergy Guard */}
          <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-red-400 flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-red-400" /> Allergy Hard Filter
              </span>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                LOCKED ACTIVE
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Zero-tolerance auto-exclusion for declared patient contraindications.
            </p>
          </div>

          {/* Maternal Safety */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-400" /> Maternal Safety
              </span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                LOCKED ACTIVE
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Filters teratogens (retinoids &gt;2%, high hydroquinone) for nursing profiles.
            </p>
          </div>

          {/* Minimum Stock */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">Min Stock for Rec</span>
              <span className="font-mono text-amber-400">
                {localSettings.minimumStockForRecommendation || 1} units
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Only recommend formulations with verifiable available inventory.
            </p>
            <input
              type="number"
              min={1}
              max={10}
              value={localSettings.minimumStockForRecommendation || 1}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  minimumStockForRecommendation: Math.max(1, Number(e.target.value)),
                })
              }
              className="mt-2.5 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Match Tier Thresholds */}
        <div className="mt-5 pt-4 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 px-3.5 py-2 border border-zinc-800">
            <span className="text-xs text-emerald-400 font-medium">Tier 1: Excellent Match</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={localSettings.matchScoreThresholds.excellent}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    matchScoreThresholds: {
                      ...localSettings.matchScoreThresholds,
                      excellent: Number(e.target.value),
                    },
                  })
                }
                className="w-12 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-center font-mono text-xs text-white"
              />
              <span className="text-xs text-zinc-500">%+</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 px-3.5 py-2 border border-zinc-800">
            <span className="text-xs text-amber-400 font-medium">Tier 2: Good Fit</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={localSettings.matchScoreThresholds.good}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    matchScoreThresholds: {
                      ...localSettings.matchScoreThresholds,
                      good: Number(e.target.value),
                    },
                  })
                }
                className="w-12 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-center font-mono text-xs text-white"
              />
              <span className="text-xs text-zinc-500">%+</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 px-3.5 py-2 border border-zinc-850">
            <span className="text-xs text-zinc-400 font-medium">Tier 3: Fair Target</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={localSettings.matchScoreThresholds.fair}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    matchScoreThresholds: {
                      ...localSettings.matchScoreThresholds,
                      fair: Number(e.target.value),
                    },
                  })
                }
                className="w-12 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-center font-mono text-xs text-white"
              />
              <span className="text-xs text-zinc-500">%+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Manager and Real-Time Testing Sandbox */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Rules Table / Cards (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "all"
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                All Rules ({recommendationRules.length})
              </button>
              <button
                onClick={() => setActiveTab("safety")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "safety"
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Locked Safety Guards (2)
              </button>
              <button
                onClick={() => setActiveTab("clinical")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "clinical"
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Clinical Heuristics ({recommendationRules.filter((r) => !r.isLocked).length})
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              disabled={!canEdit}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-black disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Matching Rule
            </button>
          </div>

          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const targetParam = parameters.find((p) => p.id === rule.targetParameterId);
              return (
                <div
                  key={rule.id}
                  className={`relative rounded-xl border p-4.5 transition ${
                    rule.isLocked
                      ? "border-red-900/40 bg-zinc-950/60"
                      : rule.status === "active"
                      ? "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      : "border-zinc-900 bg-zinc-950/40 opacity-60"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300">
                          #{rule.priority}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                        {rule.isLocked ? (
                          <span className="flex items-center gap-1 rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                            <Lock className="h-2.5 w-2.5" /> CLINICAL LOCK
                          </span>
                        ) : (
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              rule.status === "active"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {rule.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{rule.description}</p>

                      {/* Rule Logic Representation */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded bg-zinc-800/80 px-2.5 py-1 font-mono text-zinc-300">
                          {rule.conditionType === "parameter_score_below" &&
                            `IF [${targetParam?.name || "Score"}] < ${rule.threshold}`}
                          {rule.conditionType === "parameter_score_above" &&
                            `IF [${targetParam?.name || "Score"}] > ${rule.threshold}`}
                          {rule.conditionType === "allergy_exclude" && "IF [Allergy Conflict Detected]"}
                          {rule.conditionType === "pregnancy_safe" && "IF [Maternal / Nursing Profile]"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="rounded bg-amber-500/10 px-2.5 py-1 font-mono font-medium text-amber-300 border border-amber-500/20">
                          {rule.actionType === "boost_mapped_products" &&
                            `THEN BOOST FORMULATION MATCH +${rule.boostPercent}%`}
                          {rule.actionType === "exclude_ingredients" && "THEN EXCLUDE FROM PRESCRIPTION"}
                          {rule.actionType === "exclude_category" && "THEN EXCLUDE CATEGORY"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!rule.isLocked && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(rule)}
                            disabled={!canEdit}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                              rule.status === "active"
                                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            }`}
                          >
                            {rule.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            disabled={!canEdit}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id, rule.isLocked)}
                            disabled={!canDelete}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Testing Sandbox (4 Cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Rule Sandbox Benchmark</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Sparkles className="h-3 w-3 text-amber-400" /> Live Engine
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              Run real diagnostic profiles through active rules to preview recommendation shifts before committing.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400">Select Test Persona</label>
                <select
                  value={testSampleScanId}
                  onChange={(e) => setTestSampleScanId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {sampleScansData.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.customerName} ({s.skinType} - Score {s.overallScore})
                    </option>
                  ))}
                </select>
              </div>

              {/* Benchmark Comparison */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-white">Top Recommendations</span>
                  <span className="text-[10px] text-amber-400 font-mono">Real-time Ranking</span>
                </div>

                <div className="space-y-2">
                  {simulationResults.withRules.map((rec: any, idx: number) => {
                    const baselineRec = simulationResults.baseline[idx];
                    const isRankChanged = baselineRec?.productId !== rec.productId;
                    return (
                      <div
                        key={rec.productId}
                        className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition hover:border-zinc-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white truncate max-w-[180px]">
                            #{idx + 1} {rec.productName}
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {rec.matchScore}%
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="truncate max-w-[200px] text-zinc-500">
                            {rec.matchReasons[0]?.label || "Biocompatible formula"}
                          </span>
                          {isRankChanged && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              BOOSTED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-white">
                {editingRule ? "Edit Recommendation Rule" : "Create New Recommendation Rule"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300">Rule Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Dehydrated Epidermis Boost"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Clinical Explanation</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the clinical rationale for this matching heuristic..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Condition Builder */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <span className="text-xs font-semibold text-amber-400">Condition Definition</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Trigger Condition</label>
                    <select
                      value={formConditionType}
                      onChange={(e) => setFormConditionType(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="parameter_score_below">Parameter Score Below (&lt;)</option>
                      <option value="parameter_score_above">Parameter Score Above (&gt;)</option>
                      <option value="skin_type_match">Skin Type Matches</option>
                      <option value="concern_match">Concern Present</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Target Parameter</label>
                    <select
                      value={formTargetParameterId}
                      onChange={(e) => setFormTargetParameterId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {parameters.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400">
                    Threshold Score (0 - 100): <span className="text-amber-400 font-mono">{formThreshold}</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(Number(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Action Builder */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <span className="text-xs font-semibold text-amber-400">Prescription Action</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Action Type</label>
                    <select
                      value={formActionType}
                      onChange={(e) => setFormActionType(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="boost_mapped_products">Boost Formulation Priority</option>
                      <option value="demote">Demote Formulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Boost Value (% Points)</label>
                    <input
                      type="number"
                      min={5}
                      max={40}
                      value={formBoostPercent}
                      onChange={(e) => setFormBoostPercent(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                >
                  {editingRule ? "Update Rule" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
