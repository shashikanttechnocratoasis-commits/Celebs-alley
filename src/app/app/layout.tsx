"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PanelShell } from "@/components/layout/PanelShell";
import { customerNav } from "@/config/nav";

export default function CustomerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Full-screen focused layout for onboarding (no sidebar)
  if (pathname.startsWith("/app/onboarding")) {
    return <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0]">{children}</div>;
  }

  return <PanelShell config={customerNav}>{children}</PanelShell>;
}

