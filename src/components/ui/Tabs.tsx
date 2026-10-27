"use client";

import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Tabs = TabsPrimitive.Root;

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "pills" | "underline";
  }
>(({ className, variant = "pills", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20",
      variant === "underline" && "bg-transparent border-0 border-b border-[#C99A45]/20 rounded-none p-0 gap-6",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-xs font-medium font-sans uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer text-[#A89A85] rounded-xl hover:text-[#F5EDE0] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-[#0B0907] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B8812F] data-[state=active]:via-[#E8C77A] data-[state=active]:to-[#B8812F] data-[state=active]:font-semibold data-[state=active]:shadow-[0_2px_12px_rgba(201,154,69,0.3)]",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none transition-all duration-300",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
