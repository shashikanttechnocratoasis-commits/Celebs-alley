"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Cookie, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const cookieConsent = useAppStore((s) => s.cookieConsent);
  const setCookieConsent = useAppStore((s) => s.setCookieConsent);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || cookieConsent !== null) {
    return null;
  }

  const handleAcceptAll = () => {
    setCookieConsent({
      accepted: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleSaveCustom = () => {
    setCookieConsent({
      accepted: true,
      analytics,
      marketing,
    });
  };

  const handleDeclineOptional = () => {
    setCookieConsent({
      accepted: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.35 }}
        className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 p-5 rounded-2xl bg-bg-surface/95 border border-gold-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-text-primary"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold font-heading text-gold-300">
              Cookie & Privacy Preferences
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              We use essential cookies to deliver seamless AI skin diagnostics and personalized luxury recommendations. Read our{" "}
              <Link href="/legal/cookies" className="text-gold-400 hover:underline">
                Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        {showCustomize && (
          <div className="my-3 p-3 rounded-xl bg-bg-elevated/70 border border-gold-500/15 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text-primary">Essential Cookies</span>
                <p className="text-[11px] text-text-muted">Required for AI scan processing & security.</p>
              </div>
              <span className="text-[10px] text-gold-400 font-semibold uppercase">Always On</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gold-500/10">
              <div>
                <span className="font-medium text-text-primary">Analytics</span>
                <p className="text-[11px] text-text-muted">Help us optimize diagnostic performance.</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gold-500/10">
              <div>
                <span className="font-medium text-text-primary">Marketing & Ads</span>
                <p className="text-[11px] text-text-muted">Personalized product match announcements.</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {!showCustomize ? (
            <>
              <button
                onClick={() => setShowCustomize(true)}
                className="text-xs text-text-muted hover:text-gold-300 flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Customize
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeclineOptional}
                  className="text-xs py-1.5 px-3 border-gold-500/30 text-text-secondary"
                >
                  Essential Only
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs py-1.5 px-3 font-semibold"
                >
                  Accept All
                </Button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowCustomize(false)}
                className="text-xs text-text-muted hover:text-gold-300 transition-colors"
              >
                Back
              </button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleSaveCustom}
                className="text-xs py-1.5 px-4 font-semibold"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Save Preferences
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
