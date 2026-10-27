"use client";

import React, { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  trigger?: React.ReactNode;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  trigger,
}: ResponsiveDialogProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in-0" />

        {/* Content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-[#1A130B] border border-[#C99A45]/30 text-[#F5EDE0] shadow-[0_20px_60px_rgba(0,0,0,0.9)] transition-all duration-300 focus:outline-none",
            isMobile
              ? "bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300"
              : "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-full max-w-lg rounded-3xl p-7 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in-0 duration-200",
            className
          )}
        >
          {/* Mobile Handle */}
          {isMobile && (
            <div className="w-12 h-1.5 bg-[#C99A45]/30 rounded-full mx-auto mb-4" />
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              {title && (
                <DialogPrimitive.Title className="text-xl font-heading font-semibold text-[#E8C77A]">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-xs text-[#A89A85] mt-1 font-sans">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="p-1.5 rounded-full text-[#A89A85] hover:text-[#F5EDE0] hover:bg-[#241A0F] transition-colors focus:outline-none">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>

          <div>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
