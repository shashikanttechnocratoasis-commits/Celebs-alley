"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "cream" | "glass" | "elevated" | "outline";
  hoverLift?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "dark",
      hoverLift = true,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      dark: "bg-[#1A130B] border border-[#C99A45]/20 text-[#F5EDE0] shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
      cream:
        "bg-[#F3EAD9] border border-[#C99A45]/30 text-[#1A130B] shadow-[0_8px_30px_rgba(26,19,11,0.08)]",
      glass:
        "bg-[#1A130B]/75 backdrop-blur-xl border border-[#C99A45]/25 text-[#F5EDE0] shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
      elevated:
        "bg-[#241A0F] border border-[#C99A45]/30 text-[#F5EDE0] shadow-[0_8px_32px_rgba(0,0,0,0.7)]",
      outline:
        "bg-transparent border border-[#C99A45]/30 text-[#F5EDE0] hover:bg-[#1A130B]/40",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
          variantStyles,
          hoverLift &&
            "md:hover:-translate-y-1 md:hover:shadow-[0_12px_36px_rgba(0,0,0,0.8)] md:hover:border-[#C99A45]/60",
          glow && "gold-border-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
