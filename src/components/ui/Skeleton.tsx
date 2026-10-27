"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card" | "table" | "avatar";
  lines?: number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  lines = 3,
  ...props
}: SkeletonProps) {
  const baseClasses =
    "relative overflow-hidden bg-[#241A0F]/80 rounded-xl animate-pulse before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer-sweep_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#C99A45]/10 before:to-transparent";

  if (variant === "text") {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4 rounded-md",
              i === lines - 1 ? "w-3/5" : "w-full",
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular" || variant === "avatar") {
    return (
      <div
        className={cn(baseClasses, "w-10 h-10 rounded-full", className)}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-6 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4",
          className
        )}
      >
        <div className={cn(baseClasses, "h-40 w-full rounded-xl")} />
        <div className={cn(baseClasses, "h-6 w-3/4 rounded-md")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-4 w-full rounded-md")} />
          <div className={cn(baseClasses, "h-4 w-2/3 rounded-md")} />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className={cn(baseClasses, "h-6 w-20 rounded-md")} />
          <div className={cn(baseClasses, "h-9 w-24 rounded-full")} />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="w-full space-y-3 p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20">
        <div className="flex gap-4 pb-2 border-b border-[#C99A45]/10">
          <div className={cn(baseClasses, "h-5 w-1/4 rounded-md")} />
          <div className={cn(baseClasses, "h-5 w-1/4 rounded-md")} />
          <div className={cn(baseClasses, "h-5 w-1/4 rounded-md")} />
          <div className={cn(baseClasses, "h-5 w-1/4 rounded-md")} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <div className={cn(baseClasses, "h-4 w-1/4 rounded-md")} />
            <div className={cn(baseClasses, "h-4 w-1/4 rounded-md")} />
            <div className={cn(baseClasses, "h-4 w-1/4 rounded-md")} />
            <div className={cn(baseClasses, "h-4 w-1/4 rounded-md")} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, "h-24 w-full", className)}
      {...props}
    />
  );
}
