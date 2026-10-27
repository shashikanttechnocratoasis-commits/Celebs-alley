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
  Stethoscope,
  KeyRound,
  Sliders,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import usersData from "@/data/users.json";

export default function ConsultantLoginPage() {
  const router = useRouter();
  const { loginAs, consultants } = useAppStore();

  const [email, setEmail] = useState("meera.derm@celebsalley.com");
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
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === "Consultant"
      );

      if (!user) {
        setError("Invalid consultant credentials or account not registered as an expert.");
        return;
      }

      // Check suspension
      const consultantId = user.consultantId || (user.id === "user-consultant" ? "cons-1" : "cons-2");
      const matched = (consultants || []).find((c: any) => c.id === consultantId);
      if (matched?.status === "suspended") {
        setError("This consultant account is suspended by platform administration.");
        return;
      }

      if (password !== "Demo@1234" && password.length < 6) {
        setError("Invalid password. Demo password is Demo@1234");
        return;
      }

      loginAs(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push("/consultant");
    }, 350);
  };

  const handleQuickLogin = (userId: string) => {
    const user = (usersData as any[]).find((u) => u.id === userId);
    if (user) {
      const consultantId = user.consultantId || (user.id === "user-consultant" ? "cons-1" : "cons-2");
      const matched = (consultants || []).find((c: any) => c.id === consultantId);
      if (matched?.status === "suspended") {
        setError(`Dr. ${user.name} is currently suspended by admin.`);
        return;
      }
      loginAs(user);
      toast.success(`Logged in as ${user.name} (Consultant)`);
      router.push("/consultant");
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
            <span>Role Switcher</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C99A45]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241A0F] border border-[#C99A45]/30 text-xs text-[#E8C77A]">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Expert Practitioner Cockpit</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F5EDE0]">
              Consultant Portal
            </h1>
            <p className="text-xs text-[#A89A85]">
              Sign in to manage telehealth appointments, client facial scans, and tailored routines.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-[#1A130B] border border-[#C99A45]/30 shadow-2xl space-y-6"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A89A85]">Professional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@celebsalley.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 text-xs text-[#F5EDE0] focus:outline-none focus:border-[#E8C77A] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#A89A85]">Password</label>
                  <span className="text-[11px] text-[#C99A45] font-mono">Demo: Demo@1234</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 text-xs text-[#F5EDE0] focus:outline-none focus:border-[#E8C77A] transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In to Clinic"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-[#C99A45]/15 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A89A85] block text-center">
                Instant Demo Access (3 Specialists)
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("user-consultant")}
                  className="w-full p-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left flex items-center justify-between transition-all group"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#F5EDE0] block group-hover:text-[#E8C77A]">
                      Dr. Meera Nambiar, MD
                    </span>
                    <span className="text-[10px] text-[#A89A85]">Chief Aesthetic Dermatologist • 8 Clients</span>
                  </div>
                  <Badge variant="gold" size="sm">Log In</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("user-consultant-2")}
                  className="w-full p-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left flex items-center justify-between transition-all group"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#F5EDE0] block group-hover:text-[#E8C77A]">
                      Dr. Aditya Singhal, MBBS
                    </span>
                    <span className="text-[10px] text-[#A89A85]">Laser & Anti-Aging Specialist • 5 Clients</span>
                  </div>
                  <Badge variant="outline" size="sm">Log In</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("user-consultant-3")}
                  className="w-full p-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 hover:border-[#E8C77A] text-left flex items-center justify-between transition-all group"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#F5EDE0] block group-hover:text-[#E8C77A]">
                      Dr. Shalini Deshmukh, MD (Ayu)
                    </span>
                    <span className="text-[10px] text-[#A89A85]">Ayurvedic Formulator • 6 Clients</span>
                  </div>
                  <Badge variant="outline" size="sm">Log In</Badge>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Privacy & Security note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#A89A85]">
            <ShieldCheck className="w-4 h-4 text-[#5FAF7A]" />
            <span>End-to-End Encrypted Telemedicine Session Governance</span>
          </div>
        </div>
      </main>
    </div>
  );
}
