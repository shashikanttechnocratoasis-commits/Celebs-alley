"use client";

import React from "react";
import { Sparkles, Check, AlertTriangle, Minus, HelpCircle } from "lucide-react";
import type { RecommendationParameterFit, RecommendationMatchReason } from "@/types";

interface RecommendationBreakdownProps {
  matchScore: number;
  reasons: RecommendationMatchReason[];
  parameterBreakdown: RecommendationParameterFit[];
}

export function RecommendationBreakdown({
  matchScore,
  reasons,
  parameterBreakdown,
}: RecommendationBreakdownProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-gold-400/25 space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gold-400/15">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-gold-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Explainable AI Formulation Fit
          </div>
          <h3 className="font-serif text-lg sm:text-xl text-cream-100 font-normal mt-0.5">
            Why This Is Recommended For You
          </h3>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base/80 border border-gold-400/30 w-fit">
          <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
          <span className="font-mono text-sm font-bold text-gold-300">
            {matchScore}% Compatibility
          </span>
        </div>
      </div>

      {/* Real Data Highlight Chips */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-cream-400">
          Key Biomarker Rationale
        </h4>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                r.type === "positive"
                  ? "bg-gold-400/10 border-gold-400/30 text-gold-300"
                  : r.type === "caution"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-surface/80 border-gold-400/15 text-cream-300"
              }`}
            >
              {r.type === "positive" ? (
                <Check className="w-3 h-3 text-gold-400" />
              ) : r.type === "caution" ? (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-cream-400" />
              )}
              {r.label}
            </span>
          ))}
        </div>
      </div>

      {/* Parameter by Parameter Grid (+ / ++ / +++ / -) */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-cream-400">
          8-Parameter Clinical Correlation
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {parameterBreakdown.map((param) => {
            const isPositive = param.productBenefit > 0;
            const isNegative = param.productBenefit < 0;

            const badgeText =
              param.productBenefit === 3
                ? "+++"
                : param.productBenefit === 2
                ? "++"
                : param.productBenefit === 1
                ? "+"
                : param.productBenefit === -1
                ? "-"
                : "0";

            return (
              <div
                key={param.parameterId}
                className="p-3 rounded-xl bg-base/60 border border-gold-400/15 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-cream-200 font-medium truncate">
                    {param.parameterName}
                  </div>
                  <div className="text-[11px] text-cream-400">
                    Your Score: <span className="text-gold-300 font-mono font-medium">{param.userScore}/100</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-cream-400 hidden sm:inline">
                    {param.impactLevel === "strong_fit"
                      ? "High Target"
                      : param.impactLevel === "moderate_fit"
                      ? "Supports"
                      : param.impactLevel === "caution"
                      ? "Caution"
                      : "Neutral"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      isPositive
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                        : isNegative
                        ? "bg-red-500/15 border border-red-500/30 text-red-300"
                        : "bg-surface border border-gold-400/15 text-cream-400"
                    }`}
                  >
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
