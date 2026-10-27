"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium font-sans uppercase tracking-[0.15em] text-[#A89A85]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[#A89A85] flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-11 px-4 bg-[#1A130B] text-[#F5EDE0] placeholder:text-[#6F6354] rounded-xl border border-[#C99A45]/20 focus:border-[#E8C77A] focus:outline-none focus:ring-1 focus:ring-[#E8C77A] transition-all text-sm font-sans",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[#D4604F] focus:border-[#D4604F] focus:ring-[#D4604F]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-[#A89A85] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#D4604F] mt-1 font-sans">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-[#6F6354] mt-0.5 font-sans">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
