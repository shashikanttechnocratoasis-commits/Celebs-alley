"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, ...props }, ref) => {
    const checkboxId =
      id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col space-y-1">
        <label
          htmlFor={checkboxId}
          className="inline-flex items-start gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded-md border border-[#C99A45]/40 bg-[#1A130B] peer-checked:bg-[#C99A45] peer-checked:border-[#E8C77A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E8C77A] transition-all flex items-center justify-center group-hover:border-[#E8C77A]",
                error && "border-[#D4604F]"
              )}
            >
              <Check className="w-3.5 h-3.5 text-[#0B0907] opacity-0 peer-checked:opacity-100 font-bold transition-opacity" />
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-[#F5EDE0] group-hover:text-[#E8C77A] transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-[#A89A85] mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-[#D4604F] pl-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
