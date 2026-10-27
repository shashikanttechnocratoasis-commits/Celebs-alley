"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-[#1A130B]/60 border border-[#C99A45]/20 max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#241A0F] border border-[#C99A45]/40 flex items-center justify-center text-[#E8C77A] mb-4 shadow-[0_0_20px_rgba(201,154,69,0.2)]">
        {icon || <Sparkles className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-heading font-semibold text-[#F5EDE0] mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#A89A85] font-sans max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
