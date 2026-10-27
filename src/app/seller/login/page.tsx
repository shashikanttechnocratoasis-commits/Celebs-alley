"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import usersData from "@/data/users.json";

export default function SellerLoginPage() {
  const router = useRouter();
  const { loginAs } = useAppStore();

  const [email, setEmail] = useState("kabir@royalbeauty.in");
  const [password, setPassword] = useState("Demo@1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find user by email
      const user = (usersData as any[]).find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.sellerId
      );

      if (!user) {
        setError("Invalid distributor credentials or not authorized as a seller.");
        return;
      }

      // Check password simulation (Demo@1234 or any password >= 6 chars in demo)
      if (password !== "Demo@1234" && password.length < 6) {
        setError("Invalid password. Demo password is Demo@1234");
        return;
      }

      loginAs(user);
      showToast.success(`Welcome back, ${user.name}!`);
      router.push("/seller");
    }, 400);
  };

  const handleQuickLogin = (userId: string) => {
    const user = (usersData as any[]).find((u) => u.id === userId);
    if (user) {
      loginAs(user);
      showToast.success(`Logged in as ${user.name} (${user.role})`);
      router.push("/seller");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col font-sans selection:bg-[#C99A45]/30">
      {/* Top Bar */}
      <header className="h-20 px-6 sm:px-10 border-b border-[#C99A45]/20 bg-[#1A130B]/90 backdrop-blur-md flex items-center justify-between">
        <Logo variant="with-tagline" size="md" />
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#241A0F] border border-[#C99A45]/25 text-xs text-[#E8C77A] hover:border-[#E8C77A] transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Use Demo Hub</span>
          </Link>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#1A130B] to-[#120D08] border border-[#C99A45]/30 shadow-2xl space-y-6"
          >
            <div className="space-y-2 text-center">
              <Badge variant="gold" size="sm" className="mx-auto w-fit">
                B2B Distributor SaaS Portal
              </Badge>
              <h1 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                Distributor Login
              </h1>
              <p className="text-xs text-[#A89A85]">
                Access your regional SKU pricing, warehouse dispatch, and commission payouts.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#D4604F]/10 border border-[#D4604F]/40 flex items-center gap-2.5 text-xs text-[#D4604F]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A89A85]">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@distributor.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#C99A45]">Demo: Demo@1234</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-[#C99A45]/15 space-y-2">
              <p className="text-xs text-[#A89A85]">
                New cosmetics distributor or clinic supplier?
              </p>
              <Link
                href="/seller/register"
                className="text-xs font-semibold text-[#E8C77A] hover:underline inline-flex items-center gap-1"
              >
                Register for Seller Onboarding
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Quick 1-Click Role Presets */}
          <div className="p-5 rounded-2xl bg-[#1A130B]/80 border border-[#C99A45]/20 space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-[#A89A85] font-semibold block">
              1-Click Demo Logins by Role:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("user-seller-owner")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Distributor Owner</div>
                <div className="text-[10px] text-[#A89A85] truncate">Kabir Singhania</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-seller-manager")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Distributor Manager</div>
                <div className="text-[10px] text-[#A89A85] truncate">Priya Verma</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-inventory-manager")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Inventory Manager</div>
                <div className="text-[10px] text-[#A89A85] truncate">Rohan Gupta</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-order-manager")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Order Manager</div>
                <div className="text-[10px] text-[#A89A85] truncate">Vikas Sethi</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-sales-exec")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Sales Executive</div>
                <div className="text-[10px] text-[#A89A85] truncate">Amit Patel</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-accountant")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E8C77A]">Accountant</div>
                <div className="text-[10px] text-[#A89A85] truncate">Suresh Menon</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-seller-pending")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#E0A93B]/40 hover:border-[#E0A93B] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#E0A93B]">KYC Pending Demo</div>
                <div className="text-[10px] text-[#A89A85] truncate">Mahesh (Rajputana)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("user-seller-rejected")}
                className="p-2 rounded-xl bg-[#241A0F] border border-[#D4604F]/40 hover:border-[#D4604F] text-left text-[#F5EDE0] transition-colors"
              >
                <div className="font-semibold text-[11px] text-[#D4604F]">KYC Rejected Demo</div>
                <div className="text-[10px] text-[#A89A85] truncate">Tariq (Kashmir Bot.)</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
