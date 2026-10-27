"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function OTPInput({
  length = 6,
  value = "",
  onChange,
  error,
  className,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || "")
  );

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      onChange(newDigits.join(""));
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal[cleanVal.length - 1]; // take last entered digit
    setDigits(newDigits);
    onChange(newDigits.join(""));

    // Auto-advance
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    onChange(newDigits.join(""));

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="flex gap-2.5 sm:gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              "w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold bg-[#1A130B] text-[#E8C77A] border border-[#C99A45]/30 rounded-xl focus:border-[#E8C77A] focus:ring-2 focus:ring-[#E8C77A]/30 focus:outline-none transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]",
              digits[i] && "border-[#E8C77A] bg-[#241A0F]",
              error && "border-[#D4604F] text-[#D4604F]"
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-[#D4604F] text-center">{error}</p>}
    </div>
  );
}
