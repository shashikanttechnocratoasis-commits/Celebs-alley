"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium font-sans uppercase tracking-[0.15em] text-[#A89A85]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full min-h-[100px] p-3.5 bg-[#1A130B] text-[#F5EDE0] placeholder:text-[#6F6354] rounded-xl border border-[#C99A45]/20 focus:border-[#E8C77A] focus:outline-none focus:ring-1 focus:ring-[#E8C77A] transition-all text-sm font-sans resize-y",
            error && "border-[#D4604F] focus:border-[#D4604F] focus:ring-[#D4604F]",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
