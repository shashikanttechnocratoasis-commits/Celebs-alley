"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export interface SensitiveActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  requireTypeConfirm?: boolean;
  expectedKeyword?: string;
  isLoading?: boolean;
}

export function SensitiveActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Action",
  isDestructive = true,
  requireTypeConfirm = false,
  expectedKeyword = "CONFIRM",
  isLoading = false,
}: SensitiveActionModalProps) {
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (!open) {
      setTypedValue("");
    }
  }, [open]);

  const isConfirmed = !requireTypeConfirm || typedValue.trim().toUpperCase() === expectedKeyword;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(val) => !val && onClose()}
      title={title}
      description=""
    >
      <div className="space-y-5 p-1 text-sm">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#F5EDE0]">{title}</p>
            <p className="text-xs text-[#A89A85] leading-relaxed">{description}</p>
          </div>
        </div>

        {requireTypeConfirm && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-[#A89A85] uppercase tracking-wider block">
              Type <span className="text-[#E8C77A] font-mono font-bold">{expectedKeyword}</span> to authorize:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Type ${expectedKeyword}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 focus:border-[#E8C77A] focus:outline-none text-sm font-mono text-[#F5EDE0] tracking-widest placeholder:text-[#6F6354]"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C99A45]/15">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "secondary" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={!isConfirmed || isLoading}
            className={
              isDestructive
                ? "bg-red-500/15 border-red-500/30 text-red-300 hover:bg-red-500/25 hover:border-red-500/50"
                : ""
            }
          >
            {isLoading ? "Executing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
