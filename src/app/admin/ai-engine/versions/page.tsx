"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { SensitiveActionModal } from "@/components/admin/SensitiveActionModal";
import {
  History,
  GitBranch,
  RotateCcw,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  Calendar,
  User,
  Sliders,
} from "lucide-react";
import type { ParameterVersion, ModelVersion, SkinParameter } from "@/types";

export default function AIEngineVersionHistoryPage() {
  const {
    parameterVersions,
    modelVersions,
    activeModelVersionId,
    setActiveModelVersion,
    rollbackParameterVersion,
  } = useAppStore();

  const { canEdit, isSuperAdmin } = useAdminPermission("versions");

  // Rollback confirmation modal state
  const [rollbackTarget, setRollbackTarget] = useState<ParameterVersion | null>(null);
  const [isRollbacking, setIsRollbacking] = useState(false);

  // Compare side-by-side state
  const [compareVersionAId, setCompareVersionAId] = useState<string>(
    parameterVersions[0]?.id || ""
  );
  const [compareVersionBId, setCompareVersionBId] = useState<string>(
    parameterVersions[1]?.id || parameterVersions[0]?.id || ""
  );
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Detail Drawer for a single version
  const [inspectVersion, setInspectVersion] = useState<ParameterVersion | null>(null);

  // Success banner
  const [successMsg, setSuccessMsg] = useState("");

  const versionA = useMemo(
    () => parameterVersions.find((v) => v.id === compareVersionAId) || parameterVersions[0],
    [parameterVersions, compareVersionAId]
  );
  const versionB = useMemo(
    () => parameterVersions.find((v) => v.id === compareVersionBId) || parameterVersions[0],
    [parameterVersions, compareVersionBId]
  );

  const handleExecuteRollback = () => {
    if (!rollbackTarget) return;
    setIsRollbacking(true);

    try {
      rollbackParameterVersion(rollbackTarget.id);
      setSuccessMsg(`Successfully rolled back parameter matrix to ${rollbackTarget.version}. Created a new live deployment.`);
      setRollbackTarget(null);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      alert(err.message || "Rollback failed.");
    } finally {
      setIsRollbacking(false);
    }
  };

  const handleSwitchModel = (modelId: string) => {
    if (!canEdit) return;
    setActiveModelVersion(modelId);
    setSuccessMsg(`Active clinical computer vision pipeline switched to ${modelId}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="AI Engine Version Governance"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "AI Engine", href: "/admin/ai-engine/parameters" },
          { label: "Versions" },
        ]}
      />

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Model Registry Cards */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Clinical Vision Model Registry</h2>
              <p className="text-xs text-zinc-400">
                Active simulated computer vision runtime models for skin diagnostic feature extraction.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Active: {activeModelVersionId}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modelVersions.map((model) => {
            const isActive = model.id === activeModelVersionId;
            return (
              <div
                key={model.id}
                className={`relative rounded-xl border p-5 transition ${
                  isActive
                    ? "border-amber-500/50 bg-amber-950/10 shadow-lg shadow-amber-500/5"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{model.name}</h3>
                      <span className="font-mono text-xs text-amber-400">{model.version}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{model.description}</p>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                      LIVE IN PRODUCTION
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      {model.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1 font-mono">
                    <Sparkles className="h-3 w-3 text-zinc-500" />
                    <span>Offset: {model.noiseOffsetMultiplier}x</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <span>{model.scanCount.toLocaleString()} Scans</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  {!isActive && (
                    <button
                      onClick={() => handleSwitchModel(model.id)}
                      disabled={!canEdit}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-50"
                    >
                      Promote to Live
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parameter Release Version History */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Diagnostic Matrix Deployments</h2>
              <p className="text-xs text-zinc-400">
                Immutable record of parameter calibrations, clinical weighting, and production releases.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-500/50 hover:bg-zinc-800 hover:text-white"
          >
            <Layers className="h-4 w-4 text-amber-400" /> Compare Any Two Versions
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {parameterVersions.map((ver, idx) => {
            const isLive = ver.status === "live";
            return (
              <div
                key={ver.id}
                className={`relative rounded-xl border p-5 transition ${
                  isLive
                    ? "border-amber-500/40 bg-zinc-900/70 shadow-lg shadow-amber-500/5"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-amber-400">
                        {ver.version}
                      </span>
                      {isLive ? (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          CURRENT PRODUCTION LIVE
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          ARCHIVED
                        </span>
                      )}
                      <span className="text-xs font-mono text-zinc-500">
                        {ver.scanCount} scans bound
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-zinc-500" /> {ver.authorName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-zinc-500" />{" "}
                        {new Date(ver.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-300">{ver.changeSummary}</p>

                    {/* Auto Diff details if available */}
                    {ver.changes && ver.changes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ver.changes.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-700"
                          >
                            <span className="font-medium text-amber-300">{c.parameterName}:</span>
                            <span className="text-zinc-400">{c.field}</span>
                            <span className="text-red-400 font-mono">{String(c.oldValue)}</span>
                            <ArrowRight className="h-2.5 w-2.5 text-zinc-600" />
                            <span className="text-emerald-400 font-mono">{String(c.newValue)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setInspectVersion(ver)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Matrix ({ver.parametersSnapshot.length})
                    </button>

                    {!isLive && (
                      <button
                        onClick={() => setRollbackTarget(ver)}
                        disabled={!canEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-black disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Rollback to {ver.version}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Compare Deployments Side-by-Side</h3>
                <p className="text-xs text-zinc-400">
                  Benchmark parameter configurations, weights, and active states across releases.
                </p>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-b border-zinc-800 pb-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Left Version (Baseline)</label>
                <select
                  value={compareVersionAId}
                  onChange={(e) => setCompareVersionAId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {parameterVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version} - {v.changeSummary.substring(0, 40)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Right Version (Target)</label>
                <select
                  value={compareVersionBId}
                  onChange={(e) => setCompareVersionBId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {parameterVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version} - {v.changeSummary.substring(0, 40)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-400 px-3 py-1.5 bg-zinc-900/60 rounded-lg">
                <span className="col-span-4">Parameter Name</span>
                <span className="col-span-4 text-center font-mono text-amber-400">
                  {versionA?.version} (Weight / Status)
                </span>
                <span className="col-span-4 text-center font-mono text-amber-400">
                  {versionB?.version} (Weight / Status)
                </span>
              </div>

              {versionA?.parametersSnapshot.map((paramA) => {
                const paramB = versionB?.parametersSnapshot.find((p) => p.slug === paramA.slug);
                const isWeightDiff = paramB && paramA.weight !== paramB.weight;
                const isStatusDiff = paramB && paramA.status !== paramB.status;

                return (
                  <div
                    key={paramA.id}
                    className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-lg text-xs border ${
                      isWeightDiff || isStatusDiff
                        ? "border-amber-500/30 bg-amber-950/10"
                        : "border-zinc-850 bg-zinc-900/30"
                    }`}
                  >
                    <div className="col-span-4 font-medium text-white flex items-center gap-2">
                      <span>{paramA.name}</span>
                      {(isWeightDiff || isStatusDiff) && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                          DIFF
                        </span>
                      )}
                    </div>
                    <div className="col-span-4 text-center font-mono text-zinc-300">
                      {paramA.weight}% ({paramA.status})
                    </div>
                    <div className="col-span-4 text-center font-mono text-zinc-300">
                      {paramB ? `${paramB.weight}% (${paramB.status})` : "Not Present"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Inspect Drawer */}
      {inspectVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Parameters Snapshot for {inspectVersion.version}
                </h3>
                <p className="text-xs text-zinc-400">
                  Immutable calibration configuration active during this release.
                </p>
              </div>
              <button
                onClick={() => setInspectVersion(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-zinc-850">
              {inspectVersion.parametersSnapshot.map((param) => (
                <div key={param.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{param.name}</span>
                    <span className="ml-2 font-mono text-[11px] text-zinc-500">{param.slug}</span>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{param.description}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-amber-400 font-bold">{param.weight}%</span>
                    <div className="text-[10px] text-zinc-500 uppercase">{param.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectVersion(null)}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {rollbackTarget && (
        <SensitiveActionModal
          open={!!rollbackTarget}
          onClose={() => setRollbackTarget(null)}
          onConfirm={handleExecuteRollback}
          title={`Rollback Diagnostic Matrix to ${rollbackTarget.version}`}
          description={`Rolling back will immediately demote the current matrix and deploy the exact parameter snapshot from ${rollbackTarget.version} across all live diagnostic scans and seller mappings. This action will create a new release record.`}
          confirmLabel="Execute Matrix Rollback"
          requireTypeConfirm={isSuperAdmin}
          expectedKeyword="CONFIRM"
          isLoading={isRollbacking}
        />
      )}
    </div>
  );
}
