"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PanelShell } from "@/components/layout/PanelShell";
import { sellerNav } from "@/config/nav";
import { useAppStore } from "@/store";
import { KycStatusScreen } from "@/components/seller/KycStatusScreen";

export default function SellerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser, sellers } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public seller auth & registration routes
  if (
    pathname === "/seller/login" ||
    pathname === "/seller/register" ||
    pathname.startsWith("/seller/register")
  ) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0907] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C99A45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if current seller is unverified (pending, under_review, or rejected)
  if (currentUser?.sellerId) {
    const currentSeller = sellers.find((s) => s.id === currentUser.sellerId);
    if (
      currentSeller &&
      (currentSeller.status === "pending" ||
        currentSeller.status === "under_review" ||
        currentSeller.status === "rejected")
    ) {
      return <KycStatusScreen seller={currentSeller} />;
    }
  }

  return <PanelShell config={sellerNav}>{children}</PanelShell>;
}
