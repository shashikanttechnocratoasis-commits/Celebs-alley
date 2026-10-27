"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-heading font-bold text-text-primary">
          A System Anomaly Occurred
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Our diagnostic systems encountered an unexpected exception while rendering this page.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="gold"
          size="md"
          onClick={() => reset()}
          className="uppercase tracking-wider text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Attempt Recovery
        </Button>
        <Link href="/">
          <Button variant="outline" size="md" className="border-gold-500/30 text-gold-300">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
