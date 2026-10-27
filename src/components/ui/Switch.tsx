"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const switchId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={switchId}
        className="inline-flex items-center justify-between gap-4 cursor-pointer select-none group w-full"
      >
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-[#F5EDE0] group-hover:text-[#E8C77A] transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[#A89A85]">{description}</span>
            )}
          </div>
        )}
        <div className="relative inline-flex items-center flex-shrink-0">
          <input
            id={switchId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-12 h-6.5 bg-[#241A0F] border border-[#C99A45]/30 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#B8812F] peer-checked:to-[#E8C77A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E8C77A] transition-all",
              className
            )}
          />
          <div className="absolute left-1 top-1 w-4.5 h-4.5 bg-[#F5EDE0] rounded-full transition-transform peer-checked:translate-x-5.5 peer-checked:bg-[#0B0907] shadow-md" />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";
