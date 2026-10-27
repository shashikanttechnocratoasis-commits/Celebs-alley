"use client";

import React, { useState } from "react";
import { MapPin, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { PincodeSchema } from "@/lib/schemas";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";

interface PincodeCheckerProps {
  deliveryDays?: number;
}

export function PincodeChecker({ deliveryDays = 3 }: PincodeCheckerProps) {
  const { pincode, setPincode } = useAppStore();
  const [inputVal, setInputVal] = useState(pincode || "400026");
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(Boolean(pincode));

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const result = PincodeSchema.safeParse(inputVal.trim());

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please enter a valid 6-digit PIN code");
      setChecked(false);
      return;
    }

    setError(null);
    setPincode(result.data);
    setChecked(true);
  };

  // Estimate delivery date
  const now = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(now.getDate() + deliveryDays);
  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-base/50 border border-gold-400/20 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cream-300">
        <MapPin className="w-3.5 h-3.5 text-gold-400" />
        <span>Delivery & Serviceability Check</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value.replace(/\D/g, ""));
              setError(null);
              setChecked(false);
            }}
            placeholder="Enter 6-digit PIN code"
            className="w-full h-9 px-3 text-xs bg-surface border border-gold-400/25 rounded-lg text-cream-100 placeholder:text-cream-500 font-mono focus:outline-none focus:border-gold-400"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-9 px-3.5 border-gold-400/30 text-xs">
          Check
        </Button>
      </form>

      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}

      {checked && !error && (
        <div className="space-y-1 pt-0.5 text-xs">
          <div className="text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Serviceable for Cold-Chain Delivery to {inputVal}</span>
          </div>
          <div className="text-cream-300 text-[11px] flex items-center gap-1.5 pl-5">
            <Clock className="w-3 h-3 text-gold-400 shrink-0" />
            <span>
              Estimated Delivery: <strong>{formattedDate}</strong> ({deliveryDays} business days)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
