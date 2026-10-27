"use client";

import React from "react";
import { PanelShell } from "@/components/layout/PanelShell";
import { consultantNav } from "@/config/nav";
import { useAppStore } from "@/store";
import { useConsultantPermission } from "@/lib/rbac";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ConsultantPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, currentRole } = useAppStore();
  const perm = useConsultantPermission();

  if (perm.isSuspended) {
    return (
      <div className="min-h-screen bg-[#0B0907] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#1A130B] border border-red-500/30 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-cream-100 font-semibold">
              Clinical Privileges Suspended
            </h2>
            <p className="text-xs text-[#A89A85] leading-relaxed">
              Your consultant practice account (<span className="text-[#E8C77A] font-semibold">{currentUser?.name}</span>) has been placed on administrative hold by Platform Medical Governance.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 text-xs text-[#A89A85] text-left space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Notice to Expert
            </div>
            <p className="text-[11px]">
              During suspension, your profile is hidden from the public Expert directory, new client appointments are paused, and prescription tools are locked.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/demo">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Switch Demo Role
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full text-xs">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <PanelShell config={consultantNav}>{children}</PanelShell>;
}
