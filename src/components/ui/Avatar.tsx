"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  status?: "online" | "offline" | "busy";
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  className,
  status,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  }[size];

  const getInitials = (n: string) => {
    if (!n) return "CA";
    return n
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if valid external/real image URL (not mock /avatars/ placeholder)
  const hasRealImage = Boolean(src && !src.startsWith("/avatars/"));

  return (
    <div className="relative inline-block flex-shrink-0 select-none">
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-heading font-semibold border border-[#C99A45]/40 bg-gradient-to-br from-[#241A0F] via-[#1A130B] to-[#0B0907] text-[#E8C77A] shadow-[0_2px_10px_rgba(0,0,0,0.5)]",
          sizeClasses,
          className
        )}
      >
        {hasRealImage ? (
          <Image
            src={src!}
            alt={name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="tracking-wider">{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-[#0B0907]",
            size === "sm" && "w-2 h-2",
            size === "md" && "w-2.5 h-2.5",
            size === "lg" && "w-3.5 h-3.5",
            size === "xl" && "w-4.5 h-4.5",
            status === "online" && "bg-[#5FAF7A]",
            status === "busy" && "bg-[#D4604F]",
            status === "offline" && "bg-[#A89A85]"
          )}
        />
      )}
    </div>
  );
}
