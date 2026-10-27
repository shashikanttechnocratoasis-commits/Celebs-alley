"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  className,
  label,
  error,
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && (
        <span className="text-xs font-medium font-sans uppercase tracking-[0.15em] text-[#A89A85]">
          {label}
        </span>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? "bg-[#241A0F] border-[#E8C77A] shadow-[0_0_12px_rgba(201,154,69,0.15)]"
                  : "bg-[#1A130B] border-[#C99A45]/20 hover:border-[#C99A45]/50",
                option.disabled && "opacity-40 pointer-events-none"
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value)}
                  disabled={option.disabled}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-[#E8C77A] bg-[#C99A45]/20"
                      : "border-[#A89A85]/50 bg-transparent"
                  )}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E8C77A]" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-[#E8C77A]" : "text-[#F5EDE0]"
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-[#A89A85] mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-[#D4604F]">{error}</p>}
    </div>
  );
}
