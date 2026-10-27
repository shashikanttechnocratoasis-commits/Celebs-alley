"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface PlaceholderCardProps {
  featureName: string;
  description: string;
  phase: number;
}

export function PlaceholderCard({
  featureName,
  description,
  phase,
}: PlaceholderCardProps) {
  return (
    <div className="space-y-6">
      {/* Polished Coming in Phase X Highlight Banner */}
      <Card
        variant="glass"
        className="border-[#C99A45]/30 relative overflow-hidden p-8 sm:p-10"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C99A45]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5">
              <Badge variant="gold" size="lg">
                Phase {phase} Scope
              </Badge>
              <span className="text-xs text-[#A89A85] font-sans">
                Scheduled Roadmap Module
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5EDE0]">
              {featureName}
            </h3>

            <p className="text-xs sm:text-sm text-[#A89A85] font-sans leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/demo">
              <Button variant="secondary" size="sm">
                Switch Role in /demo
              </Button>
            </Link>
            <Link href="/styleguide">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Design System
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Decorative Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}
