"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ResultsIndexPage() {
  const router = useRouter();
  const { scans } = useAppStore();

  useEffect(() => {
    if (scans && scans.length > 0) {
      // Redirect to the most recent scan
      const latestScan = scans[0];
      router.replace(`/app/results/${latestScan.id}`);
    }
  }, [scans, router]);

  if (scans && scans.length > 0) {
    return (
      <div className="flex items-center justify-center py-20 text-cream-300">
        <Sparkles className="w-5 h-5 text-gold-400 animate-spin mr-2" />
        Loading your latest skin diagnostic breakdown...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <Card className="p-8 space-y-5 bg-surface/60 border-gold-400/20 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/30 mx-auto flex items-center justify-center text-gold-400">
          <Camera className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl text-cream-100 font-normal">
            No Face Scans Found
          </h2>
          <p className="text-xs text-cream-300/80 leading-relaxed">
            You have not completed a skin biometric diagnostic yet. Capture 3 poses with our camera to reveal your 8-parameter score.
          </p>
        </div>
        <Button asChild className="w-full shadow-gold-glow">
          <Link href="/app/scan">
            <Camera className="w-4 h-4 mr-2" /> Start Your First Scan
          </Link>
        </Button>
      </Card>
    </div>
  );
}
