"use client";

import React, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium font-sans rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0907] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#B8812F] via-[#E8C77A] to-[#B8812F] text-[#0B0907] font-semibold shadow-[0_4px_20px_rgba(201,154,69,0.35)] hover:shadow-[0_6px_28px_rgba(201,154,69,0.55)] border border-[#E8C77A]/50 animate-shimmer hover:brightness-105",
        gold:
          "bg-gradient-to-r from-[#B8812F] via-[#E8C77A] to-[#B8812F] text-[#0B0907] font-semibold shadow-[0_4px_20px_rgba(201,154,69,0.35)] hover:shadow-[0_6px_28px_rgba(201,154,69,0.55)] border border-[#E8C77A]/50 animate-shimmer hover:brightness-105",
        secondary:
          "bg-[#1A130B]/80 text-[#E8C77A] border border-[#C99A45]/40 hover:border-[#E8C77A] hover:bg-[#241A0F] shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(201,154,69,0.2)]",
        outline:
          "bg-[#1A130B]/80 text-[#E8C77A] border border-[#C99A45]/40 hover:border-[#E8C77A] hover:bg-[#241A0F] shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(201,154,69,0.2)]",
        ghost:
          "bg-transparent text-[#F5EDE0] hover:text-[#E8C77A] hover:bg-[#1A130B]/60",
        darkOnCream:
          "bg-[#1A130B] text-[#E8C77A] border border-[#C99A45]/30 hover:bg-[#0B0907] hover:border-[#E8C77A] shadow-[0_4px_16px_rgba(26,19,11,0.25)]",
        danger:
          "bg-[#D4604F]/20 text-[#F5EDE0] border border-[#D4604F]/50 hover:bg-[#D4604F] hover:text-white shadow-[0_2px_10px_rgba(212,96,79,0.3)]",
        subtle:
          "bg-[#241A0F] text-[#F5EDE0] border border-white/5 hover:border-[#C99A45]/30 hover:bg-[#1A130B]",
      },
      size: {
        sm: "h-9 px-4 text-xs tracking-wider uppercase",
        md: "h-11 px-6 text-sm tracking-wide",
        lg: "h-13 px-8 text-base tracking-wide font-medium",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), "whitespace-nowrap", className)}
        disabled={disabled || isLoading || loading}
        {...props}
      >
        {(isLoading || loading) && (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-current shrink-0" />
        )}
        {!(isLoading || loading) && leftIcon && (
          <span className="inline-flex items-center shrink-0">{leftIcon}</span>
        )}
        <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
          {children}
        </span>
        {!(isLoading || loading) && rightIcon && (
          <span className="inline-flex items-center shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
