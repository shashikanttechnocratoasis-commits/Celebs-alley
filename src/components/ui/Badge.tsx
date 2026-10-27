"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans uppercase tracking-[0.15em] border transition-colors select-none",
  {
    variants: {
      variant: {
        gold: "bg-[#C99A45]/15 text-[#E8C77A] border-[#C99A45]/40 shadow-[0_0_10px_rgba(201,154,69,0.15)]",
        cream: "bg-[#F3EAD9] text-[#1A130B] border-[#F3EAD9]",
        success: "bg-[#5FAF7A]/15 text-[#5FAF7A] border-[#5FAF7A]/40",
        warning: "bg-[#E0A93B]/15 text-[#E0A93B] border-[#E0A93B]/40",
        danger: "bg-[#D4604F]/15 text-[#D4604F] border-[#D4604F]/40",
        info: "bg-[#6FA3C7]/15 text-[#6FA3C7] border-[#6FA3C7]/40",
        outline: "bg-transparent text-[#A89A85] border-[#A89A85]/40",
        dark: "bg-[#0B0907] text-[#F5EDE0] border-[#C99A45]/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-0.5 text-[10px]",
        lg: "px-3.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      )}
      {children}
    </span>
  );
}
