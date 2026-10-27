"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FloatingBookButton() {
  const pathname = usePathname();

  // Hide on booking page or demo/admin panels
  if (
    pathname === "/book" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/consultant") ||
    pathname === "/demo"
  ) {
    return null;
  }

  return (
    <>
      {/* Mobile Sticky Bottom Bar (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-bg-surface/95 backdrop-blur-xl border-t border-gold-500/30 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gold-400">
              Personalized Care
            </span>
            <span className="text-xs font-medium text-text-primary">
              AI Diagnostics + MD Review
            </span>
          </div>
          <Link href="/book" className="shrink-0">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
              className="text-xs font-semibold uppercase tracking-wider py-2 px-4 shadow-gold-sm whitespace-nowrap"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Floating Pill (>=768px) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-30 pointer-events-auto">
        <Link href="/book" className="group block focus:outline-none">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface border border-gold-400/50 shadow-[0_8px_30px_rgba(212,175,55,0.25)] backdrop-blur-lg hover:border-gold-300 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-bg-base shadow-gold-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-gold-400">
                Book Consultation
              </span>
              <span className="text-xs font-medium text-text-primary flex items-center gap-1">
                From ₹1,200 <ArrowRight className="w-3 h-3 text-gold-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
    </>
  );
}
