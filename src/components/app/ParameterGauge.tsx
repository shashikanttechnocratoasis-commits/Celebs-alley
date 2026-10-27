"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface ParameterGaugeProps {
  name: string;
  score?: number;
  weight: number;
  category: string;
  interpretation?: string;
  onClick: () => void;
}

export function ParameterGauge({
  name,
  score,
  weight,
  category,
  interpretation,
  onClick,
}: ParameterGaugeProps) {
  const isAnalysed = typeof score === "number" && !isNaN(score);
  const targetScore = isAnalysed ? score : 0;
  const [displayScore, setDisplayScore] = useState(0);

  // Animated count up only if analysed
  useEffect(() => {
    if (!isAnalysed) return;
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetScore / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore, isAnalysed]);

  // Band calculations
  let band: "optimal" | "moderate" | "attention" | "not_analysed" = "optimal";
  let strokeColor = "#10B981"; // Emerald
  let bgFill = "rgba(16, 185, 129, 0.1)";
  let badgeText = "Optimal";

  if (!isAnalysed) {
    band = "not_analysed";
    strokeColor = "#A89A85"; // Faint neutral
    bgFill = "rgba(168, 154, 133, 0.1)";
    badgeText = "Not Analysed";
  } else if (targetScore < 60) {
    band = "attention";
    strokeColor = "#EF4444"; // Danger / Red
    bgFill = "rgba(239, 68, 68, 0.1)";
    badgeText = "Needs Focus";
  } else if (targetScore < 75) {
    band = "moderate";
    strokeColor = "#F59E0B"; // Amber / Warning
    bgFill = "rgba(245, 158, 11, 0.1)";
    badgeText = "Moderate";
  }

  // Circular gauge math
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl bg-surface/80 hover:bg-surface border border-gold-400/15 hover:border-gold-400/40 transition-all shadow-md group relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Circular Mini Gauge */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#241A0F"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={strokeColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-serif text-base font-bold text-cream-100 leading-none">
              {isAnalysed ? displayScore : "N/A"}
            </span>
            {isAnalysed ? (
              <span className="text-[8px] text-cream-400 font-mono">/100</span>
            ) : (
              <span className="text-[7px] text-cream-400 font-mono tracking-tight">SKIP</span>
            )}
          </div>
        </div>

        {/* Parameter Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-cream-100 truncate group-hover:text-gold-300 transition-colors">
              {name}
            </h4>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{
                backgroundColor: bgFill,
                borderColor: strokeColor,
                color: strokeColor,
              }}
            >
              {badgeText}
            </span>
          </div>

          <p className="text-xs text-cream-300/70 line-clamp-1">
            {isAnalysed
              ? interpretation || `Target weight: ${Math.round(weight * 100)}%`
              : "Not analysed in this scan"}
          </p>

          <div className="flex items-center gap-1 text-[10px] text-gold-400/80 font-medium group-hover:text-gold-300">
            <span>{isAnalysed ? "Tap to view deep clinical insights" : "Excluded from weighted score"}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
