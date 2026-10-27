"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GoldDividerProps {
  className?: string;
  withDiamond?: boolean;
}

export function GoldDivider({ className, withDiamond = true }: GoldDividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center my-6 w-full", className)}>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#C99A45]/40 to-transparent" />
      {withDiamond && (
        <div className="mx-4 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rotate-45 border border-[#E8C77A] bg-[#241A0F] shadow-[0_0_8px_rgba(201,154,69,0.4)]" />
        </div>
      )}
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#C99A45]/40 to-transparent" />
    </div>
  );
}
