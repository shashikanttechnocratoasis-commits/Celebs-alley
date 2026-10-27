"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "full" | "icon" | "with-tagline" | "compact";
  shimmer?: boolean;
  surface?: "dark" | "cream";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function Logo({
  variant = "with-tagline",
  shimmer = false,
  surface = "dark",
  className,
  size = "md",
  href,
}: LogoProps) {
  const [imgError, setImgError] = useState(false);

  // Height sizing for the full logo image (1052x282 aspect ratio)
  const fullSizeClasses = {
    sm: "h-7 w-auto",
    md: "h-10 w-auto",
    lg: "h-14 w-auto",
    xl: "h-20 w-auto",
  }[size];

  // Sizing for icon-only variant
  const iconSizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  }[size];

  // Text sizes for fallback / cream wordmark
  const textSizes = {
    sm: { text: "text-lg", tag: "text-[8px] tracking-[0.25em]" },
    md: { text: "text-xl sm:text-2xl", tag: "text-[9px] tracking-[0.3em]" },
    lg: { text: "text-2xl sm:text-3xl", tag: "text-[10px] tracking-[0.35em]" },
    xl: { text: "text-3xl sm:text-4xl", tag: "text-[12px] tracking-[0.4em]" },
  }[size];

  // Icon Emblem (Geometric Gold Crest)
  const renderIconEmblem = () => (
    <div
      className={cn(
        "rounded-full flex items-center justify-center border shadow-[0_0_15px_rgba(201,154,69,0.25)] flex-shrink-0 select-none",
        iconSizeClasses,
        surface === "cream"
          ? "border-[#B8812F]/40 bg-gradient-to-br from-[#F3EAD9] to-[#E8C77A]/20"
          : "border-[#C99A45]/40 bg-gradient-to-br from-[#241A0F] to-[#0B0907]"
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className={cn("w-3/4 h-3/4", surface === "cream" ? "text-[#B8812F]" : "text-[#E8C77A]")}
        fill="currentColor"
      >
        <polygon
          points="50,10 90,50 50,90 10,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="14" fill={surface === "cream" ? "#B8812F" : "#C99A45"} />
        <path
          d="M50 25 L50 75 M25 50 L75 50"
          stroke={surface === "cream" ? "#B8812F" : "#E8C77A"}
          strokeWidth="2"
        />
      </svg>
    </div>
  );

  // Fallback CSS/SVG Wordmark
  const renderCssWordmark = () => (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {renderIconEmblem()}
      <div className="flex flex-col justify-center text-left">
        <span
          className={cn(
            "font-heading font-semibold tracking-wide leading-none",
            textSizes.text,
            surface === "cream"
              ? "bg-gradient-to-r from-[#B8812F] via-[#C99A45] to-[#B8812F] bg-clip-text text-transparent"
              : "bg-gradient-to-r from-[#E8C77A] via-[#F5EDE0] to-[#C99A45] bg-clip-text text-transparent"
          )}
        >
          CELEBS ALLEY
        </span>
        {variant !== "compact" && (
          <span
            className={cn(
              "font-sans font-medium uppercase mt-1",
              textSizes.tag,
              surface === "cream" ? "text-[#6F6354]" : "text-[#C99A45]"
            )}
          >
            BEAUTY <span className="opacity-40">|</span> WELLNESS{" "}
            <span className="opacity-40">|</span> TREATMENT
          </span>
        )}
      </div>
    </div>
  );

  let content: React.ReactNode;

  if (variant === "icon") {
    content = renderIconEmblem();
  } else if (surface === "cream" || imgError) {
    content = renderCssWordmark();
  } else {
    // Dark surface with real logo image (1052x282 intrinsic)
    content = (
      <div
        className={cn(
          "inline-flex items-center select-none transition-transform duration-300",
          shimmer && "animate-pulse",
          className
        )}
      >
        <Image
          src="/brand/logo.png"
          alt="Celebs Alley — BEAUTY | WELLNESS | TREATMENT"
          width={1052}
          height={282}
          className={cn("object-contain", fullSizeClasses)}
          onError={() => setImgError(true)}
          priority
        />
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="inline-block group focus:outline-none flex-shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
