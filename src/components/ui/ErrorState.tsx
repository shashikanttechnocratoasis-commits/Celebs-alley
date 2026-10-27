"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something Went Wrong",
  message = "An unexpected error occurred while loading this section. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-3xl bg-[#1A130B]/80 border border-[#D4604F]/30 max-w-md mx-auto shadow-[0_4px_24px_rgba(212,96,79,0.15)]",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#D4604F]/15 border border-[#D4604F]/40 flex items-center justify-center text-[#D4604F] mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-[#F5EDE0] mb-2">
        {title}
      </h3>
      <p className="text-xs text-[#A89A85] font-sans mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
