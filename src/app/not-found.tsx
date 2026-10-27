"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoldDust } from "@/components/ui/GoldDust";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
      {/* Background Gold Dust */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <GoldDust count={35} speed={0.4} />
      </div>

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-heading font-semibold uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5 text-gold-400" />
          <span>404 — Page Not Found</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-heading font-bold text-gold-gradient">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          This Royal Chamber Is Uncharted
        </h2>

        <p className="text-sm text-text-secondary leading-relaxed">
          The page you are looking for has been moved, renamed, or exists beyond our current diagnostic coordinates.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button variant="gold" size="md" className="uppercase tracking-wider text-xs font-semibold shadow-gold-sm">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="md" className="border-gold-500/40 text-gold-300">
              Browse Treatments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
