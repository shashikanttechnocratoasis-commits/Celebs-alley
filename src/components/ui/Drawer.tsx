"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 top-0 bottom-0 bg-[#1A130B] border-[#C99A45]/30 text-[#F5EDE0] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 overflow-y-auto transition-transform duration-300 focus:outline-none w-full max-w-md",
            side === "right"
              ? "right-0 border-l animate-in slide-in-from-right"
              : "left-0 border-r animate-in slide-in-from-left",
            className
          )}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#C99A45]/20 mb-6">
            <DialogPrimitive.Title className="text-lg font-heading font-semibold text-[#E8C77A]">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1 rounded-full text-[#A89A85] hover:text-[#F5EDE0] hover:bg-[#241A0F] transition-colors focus:outline-none">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>
          <div>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
