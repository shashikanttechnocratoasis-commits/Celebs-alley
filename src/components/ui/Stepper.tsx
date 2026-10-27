"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <div className={cn("w-full flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex flex-col items-center cursor-pointer select-none group",
                !onStepClick && "pointer-events-none"
              )}
              onClick={() => onStepClick?.(index)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs font-sans transition-all duration-300 border",
                  isCompleted &&
                    "bg-[#C99A45] border-[#E8C77A] text-[#0B0907] shadow-[0_0_12px_rgba(201,154,69,0.3)]",
                  isCurrent &&
                    "bg-[#241A0F] border-[#E8C77A] text-[#E8C77A] shadow-[0_0_16px_rgba(201,154,69,0.5)] ring-2 ring-[#E8C77A]/40",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-[#1A130B] border-[#C99A45]/20 text-[#6F6354]"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 font-bold" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium mt-2 text-center max-w-[80px] sm:max-w-[100px] transition-colors",
                  isCurrent ? "text-[#E8C77A] font-semibold" : isCompleted ? "text-[#F5EDE0]" : "text-[#6F6354]"
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Line connector between steps */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-500",
                  index < currentStep ? "bg-[#C99A45]" : "bg-[#C99A45]/20"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
