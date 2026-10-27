"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: "gold" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  color = "gold",
  size = "md",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }[size];

  const colorStyles = {
    gold: "bg-gradient-to-r from-[#B8812F] via-[#E8C77A] to-[#B8812F]",
    success: "bg-gradient-to-r from-[#5FAF7A]/80 to-[#5FAF7A]",
    warning: "bg-gradient-to-r from-[#E0A93B]/80 to-[#E0A93B]",
    danger: "bg-gradient-to-r from-[#D4604F]/80 to-[#D4604F]",
  }[color];

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-sans">
          {label && <span className="text-[#A89A85] uppercase tracking-wider">{label}</span>}
          {showValue && (
            <span className="font-semibold text-[#E8C77A]">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[#241A0F] rounded-full overflow-hidden border border-[#C99A45]/20",
          heightClasses
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorStyles
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
