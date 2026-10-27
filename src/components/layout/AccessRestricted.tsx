"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store";
import { getHomeRouteForRole } from "@/config/permissions";

export function AccessRestricted({ pathname }: { pathname?: string }) {
  const currentRole = useAppStore((state) => state.currentRole);
  const homeRoute = getHomeRouteForRole(currentRole);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card
        variant="elevated"
        className="max-w-md w-full text-center p-8 border-[#D4604F]/40 shadow-[0_10px_40px_rgba(212,96,79,0.2)]"
      >
        <div className="w-16 h-16 rounded-full bg-[#D4604F]/15 border border-[#D4604F]/40 flex items-center justify-center text-[#D4604F] mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-heading font-semibold text-[#F5EDE0] mb-2">
          Access Restricted
        </h2>

        <p className="text-xs sm:text-sm text-[#A89A85] font-sans mb-6 leading-relaxed">
          Your current session role (<span className="text-[#E8C77A] font-semibold">{currentRole}</span>)
          does not have permission to view this section.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={homeRoute}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Role Home
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="secondary" size="sm">
              Switch Role in /demo
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
