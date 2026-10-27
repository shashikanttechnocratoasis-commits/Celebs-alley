"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { useAppStore } from "@/store";
import { toast } from "sonner";

// Phone validation schema
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)"),
});

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type EmailFormData = z.infer<typeof emailSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"otp" | "email">("otp");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [phoneValue, setPhoneValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const { sendOtp, verifyOtp, otpState, loginAs, customerProfile } = useAppStore();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "9824424455" },
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "radhika@example.com",
      password: "Demo@1234",
      rememberMe: true,
    },
  });

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Lockout countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSendOtp = (data: PhoneFormData) => {
    const formattedPhone = `+91 ${data.phone}`;
    setPhoneValue(formattedPhone);

    const res = sendOtp(formattedPhone, "login");
    if (res.success) {
      setStep("verify");
      setResendTimer(30);
      setOtpError("");
      setOtpValue("");
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0 || lockoutTimer > 0) return;
    const res = sendOtp(phoneValue, "login");
    if (res.success) {
      setResendTimer(30);
      setOtpError("");
      setOtpValue("");
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyOtp = () => {
    if (otpValue.length < 6) {
      setOtpError("Please enter all 6 digits.");
      triggerShake();
      return;
    }

    const res = verifyOtp(otpValue);
    if (res.success) {
      toast.success(res.message);
      // Navigate to onboarding if not completed, else to app dashboard
      if (!customerProfile?.onboardingCompleted) {
        router.push("/app/onboarding");
      } else {
        router.push("/app");
      }
    } else {
      setOtpError(res.message);
      triggerShake();
      if (res.locked) {
        setLockoutTimer(30);
      }
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleEmailLogin = (data: EmailFormData) => {
    if (data.password !== "Demo@1234") {
      emailForm.setError("password", { message: "Invalid password. (Demo password: Demo@1234)" });
      return;
    }

    loginAs({
      id: "cust-1",
      name: "Radhika Singhania",
      email: data.email,
      phone: "+91 98244 24455",
      role: "Customer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    });

    toast.success("Welcome back, Radhika!");
    if (!customerProfile?.onboardingCompleted) {
      router.push("/app/onboarding");
    } else {
      router.push("/app");
    }
  };

  const handleGoogleAccountSelect = (name: string, email: string) => {
    setGoogleModalOpen(false);
    loginAs({
      id: "cust-1",
      name,
      email,
      phone: "+91 98244 24455",
      role: "Customer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    });

    toast.success(`Signed in with Google as ${name}`);
    if (!customerProfile?.onboardingCompleted) {
      router.push("/app/onboarding");
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Sign In to Celebs Alley
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          Access your AI biomarker scans, prescriptions & bespoke orders.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#140E08] border border-gold-500/20">
        <button
          onClick={() => {
            setAuthMode("otp");
            setStep("input");
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            authMode === "otp"
              ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base shadow-gold-sm"
              : "text-text-muted hover:text-gold-300"
          }`}
        >
          Mobile OTP (Fast)
        </button>
        <button
          onClick={() => setAuthMode("email")}
          className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            authMode === "email"
              ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base shadow-gold-sm"
              : "text-text-muted hover:text-gold-300"
          }`}
        >
          Email & Password
        </button>
      </div>

      {/* Mode 1: Mobile OTP Flow */}
      {authMode === "otp" && (
        <div>
          {step === "input" ? (
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-gold-400 font-mono pr-2 border-r border-gold-500/20">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    {...phoneForm.register("phone")}
                    type="tel"
                    maxLength={10}
                    placeholder="98244 24455"
                    className="w-full h-12 pl-24 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Demo Hint Banner */}
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-start gap-2.5 text-xs text-gold-300">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-gold-200">Demo Instant Login</span>
                  <span>Use pre-filled number or any 10-digit number. Demo OTP code is <strong>123456</strong>.</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={phoneForm.formState.isSubmitting}
                className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
              >
                Send 6-Digit OTP <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          ) : (
            /* Step: Verify OTP */
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  Code sent to <strong className="text-gold-300 font-mono">{phoneValue}</strong>
                </span>
                <button
                  onClick={() => setStep("input")}
                  className="text-gold-400 hover:text-gold-200 underline"
                >
                  Edit
                </button>
              </div>

              {/* Lockout Notice Banner */}
              {lockoutTimer > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Temporary Lockout Active: Please wait <strong>{lockoutTimer}s</strong>.</span>
                </div>
              )}

              {/* 6-box OTP input */}
              <motion.div
                animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="py-2"
              >
                <OTPInput
                  length={6}
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setOtpError("");
                  }}
                  error={otpError}
                />
              </motion.div>

              {/* Demo OTP Banner */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-300">
                <span>Demo Code: <strong className="font-mono text-amber-200">123456</strong></span>
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyOtp}
                variant="gold"
                size="lg"
                disabled={otpValue.length < 6 || lockoutTimer > 0}
                className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
              >
                Verify & Continue <CheckCircle2 className="w-4 h-4 ml-1.5" />
              </Button>

              {/* Resend Link */}
              <div className="text-center text-xs text-text-muted">
                {resendTimer > 0 ? (
                  <span>Resend OTP in <strong className="text-gold-400 font-mono">{resendTimer}s</strong></span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={lockoutTimer > 0}
                    className="text-gold-400 hover:text-gold-200 font-semibold underline cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Email & Password Flow */}
      {authMode === "email" && (
        <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...emailForm.register("email")}
                type="email"
                placeholder="radhika@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="text-xs text-rose-400 mt-1">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-gold-400 hover:text-gold-200 underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...emailForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {emailForm.formState.errors.password && (
              <p className="text-xs text-rose-400 mt-1">{emailForm.formState.errors.password.message}</p>
            )}
          </div>

          {/* Demo Hint Banner */}
          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 text-xs text-gold-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <div>
              <span>Demo Customer: <strong>radhika@example.com</strong></span>
              <span className="block text-text-muted">Password: <strong className="text-gold-200">Demo@1234</strong></span>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
          >
            Sign In with Email <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {/* Social / Google Auth Simulation */}
      <div className="space-y-3 pt-2">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gold-500/20 w-full" />
          <span className="bg-[#1A130B] px-3 text-[11px] text-text-muted uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={() => setGoogleModalOpen(true)}
          className="w-full h-11 rounded-xl border border-gold-500/30 bg-bg-elevated hover:bg-[#241A0F] text-xs font-medium text-text-primary flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.56 0 2.97.57 4.08 1.51l3.06-3.06C17.29 1.7 14.84 1 12 1 7.55 1 3.76 3.56 1.9 7.28l3.66 2.84C6.44 7.37 8.98 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.42-4.93 3.42-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.56 14.88c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.9 7.28C.69 9.69 0 12 0 12s.69 2.31 1.9 4.72l3.66-2.84z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.08.72-2.45 1.16-4.22 1.16-3.02 0-5.56-2.37-6.44-5.12L1.9 16.09C3.76 19.81 7.55 23 12 23z"
            />
          </svg>
          <span>Continue with Google (Demo Account)</span>
        </button>
      </div>

      {/* Switch to Signup */}
      <div className="text-center text-xs text-text-muted pt-2 border-t border-gold-500/15">
        Don&apos;t have an account yet?{" "}
        <Link href="/auth/signup" className="text-gold-300 hover:text-gold-200 font-semibold underline">
          Create Account
        </Link>
      </div>

      {/* Simulated Google Account Chooser Modal */}
      <AnimatePresence>
        {googleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-bg-surface border border-gold-500/40 p-6 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gold-500/20">
                <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  Select Demo Google Account
                </span>
                <button
                  onClick={() => setGoogleModalOpen(false)}
                  className="text-text-muted hover:text-gold-300 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGoogleAccountSelect("Radhika Singhania", "radhika@example.com")}
                  className="w-full p-3 rounded-xl bg-bg-elevated hover:bg-[#241A0F] border border-gold-500/20 flex items-center gap-3 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-300 font-bold flex items-center justify-center text-sm">
                    RS
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-primary block">
                      Radhika Singhania (Demo Patron)
                    </span>
                    <span className="text-xs text-text-muted">radhika@example.com</span>
                  </div>
                </button>

                <button
                  onClick={() => handleGoogleAccountSelect("Vikram Malhotra", "vikram@example.com")}
                  className="w-full p-3 rounded-xl bg-bg-elevated hover:bg-[#241A0F] border border-gold-500/20 flex items-center gap-3 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                    VM
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-primary block">
                      Vikram Malhotra (Demo Patron)
                    </span>
                    <span className="text-xs text-text-muted">vikram@example.com</span>
                  </div>
                </button>
              </div>

              <p className="text-[11px] text-text-muted text-center pt-2">
                Simulated OAuth: Instant one-click authentication without password.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
