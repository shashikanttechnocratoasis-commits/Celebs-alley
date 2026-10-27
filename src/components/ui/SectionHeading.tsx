"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  label?: string;
  title: string;
  scriptAccent?: string;
  accentWord?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  surface?: "dark" | "cream";
}

export function SectionHeading({
  label,
  title,
  scriptAccent,
  accentWord,
  description,
  align = "center",
  className,
  surface = "dark",
}: SectionHeadingProps) {
  const finalAccent = scriptAccent || accentWord;
  return (
    <div
      className={cn(
        "flex flex-col space-y-2.5",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        align === "right" && "items-end text-right",
        className
      )}
    >
      {label && (
        <span
          className={cn(
            "text-[10px] sm:text-xs font-semibold font-sans uppercase tracking-[0.3em]",
            surface === "cream" ? "text-[#B8812F]" : "text-[#E8C77A]"
          )}
        >
          {label}
        </span>
      )}

      <h2
        className={cn(
          "text-2xl sm:text-4xl md:text-5xl font-heading font-normal tracking-tight leading-tight",
          surface === "cream" ? "text-[#1A130B]" : "text-[#F5EDE0]"
        )}
      >
        {title}{" "}
        {finalAccent && (
          <span
            className={cn(
              "font-script text-3xl sm:text-5xl md:text-6xl font-normal block sm:inline ml-1 capitalize",
              surface === "cream"
                ? "text-[#B8812F]"
                : "bg-gradient-to-r from-[#E8C77A] via-[#F5EDE0] to-[#C99A45] bg-clip-text text-transparent"
            )}
          >
            {finalAccent}
          </span>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "text-xs sm:text-sm font-sans max-w-xl leading-relaxed mt-1",
            surface === "cream" ? "text-[#6F6354]" : "text-[#A89A85]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
