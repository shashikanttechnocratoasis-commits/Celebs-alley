"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Sparkles } from "lucide-react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  containerClassName?: string;
}

const LUXURY_FALLBACK_POOL = [
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1608248597359-2b0c43632938?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
];

function resolveSafeImage(src?: string | any, fallback?: string): string | null {
  if (typeof src === "string" && src.trim().length > 0) {
    const s = src.trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/brand/")) {
      return s;
    }
    if (s.includes("serum") || s.includes("oil")) return LUXURY_FALLBACK_POOL[0];
    if (s.includes("cream") || s.includes("moisturizer")) return LUXURY_FALLBACK_POOL[2];
    if (s.includes("clean") || s.includes("wash")) return LUXURY_FALLBACK_POOL[3];
    if (s.includes("treatment") || s.includes("peel")) return LUXURY_FALLBACK_POOL[4];
    if (s.includes("mask")) return LUXURY_FALLBACK_POOL[5];
  }
  return fallback || LUXURY_FALLBACK_POOL[0];
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  containerClassName = "",
  className = "",
  ...props
}: ImageWithFallbackProps) {
  const safeSrc = resolveSafeImage(src, fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState<string | null>(safeSrc);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc || LUXURY_FALLBACK_POOL[1]);
    }
  };

  // Gold gradient art tile fallback for broken or missing images
  if (hasError || !currentSrc) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#241A0F] via-[#1A130B] to-[#0B0907] border border-[#C99A45]/25 flex flex-col items-center justify-center text-center p-4 select-none ${
          props.fill ? "absolute inset-0 w-full h-full" : "w-full h-full min-h-[160px]"
        } ${containerClassName}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C99A45]/15 via-transparent to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-[#C99A45]/15 border border-[#C99A45]/35 flex items-center justify-center text-[#E8C77A] mb-2 shadow-gold-glow">
          <Sparkles className="w-5 h-5 text-[#E8C77A]" />
        </div>
        <span className="font-serif text-xs text-[#F5EDE0] tracking-wide max-w-[90%] truncate">
          {alt || "Celebs Alley Formulation"}
        </span>
        <span className="text-[10px] font-mono text-[#A89A85] uppercase tracking-widest mt-1">
          Cellular Radiance
        </span>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${
        props.fill ? "absolute inset-0 w-full h-full" : "relative"
      } ${containerClassName}`}
    >
      <Image
        src={currentSrc}
        alt={alt || "Celebs Alley Luxury"}
        className={`transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        unoptimized={typeof currentSrc === "string" && currentSrc.startsWith("https://images.unsplash.com")}
        {...props}
      />
      {!loaded && (
        <div
          className={`absolute inset-0 bg-[#1A130B]/90 animate-pulse flex items-center justify-center ${
            props.fill ? "w-full h-full" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#C99A45]/30 border-t-[#C99A45] animate-spin" />
        </div>
      )}
    </div>
  );
}
