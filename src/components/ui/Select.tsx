"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], error, hint, id, children, ...props }, ref) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium font-sans uppercase tracking-[0.15em] text-[#A89A85]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full h-11 px-4 pr-10 bg-[#1A130B] text-[#F5EDE0] rounded-xl border border-[#C99A45]/20 focus:border-[#E8C77A] focus:outline-none focus:ring-1 focus:ring-[#E8C77A] transition-all text-sm font-sans appearance-none cursor-pointer",
              error && "border-[#D4604F] focus:border-[#D4604F]",
              className
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#1A130B] text-[#F5EDE0]"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-4 h-4 text-[#A89A85] absolute right-3.5 pointer-events-none" />
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

Select.displayName = "Select";
