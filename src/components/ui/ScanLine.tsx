"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ScanLineProps {
  active?: boolean;
  className?: string;
}

export function ScanLine({ active = true, className }: ScanLineProps) {
  if (!active) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="scan-line" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#C99A45]/5 via-transparent to-[#C99A45]/5 pointer-events-none" />
    </div>
  );
}
