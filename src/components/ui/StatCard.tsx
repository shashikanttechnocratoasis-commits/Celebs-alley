"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string | number;
  trend?: "up" | "down" | "neutral" | { value: number | string; isPositive: boolean };
  changeLabel?: string;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  trend = "up",
  changeLabel = "vs last month",
  subtext,
  icon,
  className,
}: StatCardProps) {
  const trendDirection: "up" | "down" | "neutral" =
    typeof trend === "object" && trend !== null
      ? trend.isPositive ? "up" : "down"
      : (trend as "up" | "down" | "neutral");
  const displayChange =
    typeof trend === "object" && trend !== null
      ? `+${trend.value}%`
      : change;

  return (
    <Card className={cn("flex flex-col justify-between p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] sm:text-xs font-medium font-sans uppercase tracking-[0.2em] text-[#A89A85]">
          {label}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#241A0F] border border-[#C99A45]/30 flex items-center justify-center text-[#E8C77A] shadow-[0_0_12px_rgba(201,154,69,0.15)]">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5EDE0] tracking-tight">
          {value}
        </h3>

        {(displayChange !== undefined || subtext) && (
          <div className="flex items-center justify-between text-xs pt-1">
            {displayChange !== undefined ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center font-medium px-1.5 py-0.5 rounded-md",
                    trendDirection === "up" && "text-[#5FAF7A] bg-[#5FAF7A]/15",
                    trendDirection === "down" && "text-[#D4604F] bg-[#D4604F]/15",
                    trendDirection === "neutral" && "text-[#A89A85] bg-[#A89A85]/15"
                  )}
                >
                  {trendDirection === "up" && <TrendingUp className="w-3 h-3 mr-1 inline" />}
                  {trendDirection === "down" && <TrendingDown className="w-3 h-3 mr-1 inline" />}
                  {displayChange}
                </span>
                <span className="text-[#6F6354] font-sans">{changeLabel}</span>
              </div>
            ) : null}
            {subtext && (
              <span className="text-[11px] text-[#A89A85]/70 italic truncate">
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
