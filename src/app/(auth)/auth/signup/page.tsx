"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { useAppStore } from "@/store";
import { toast } from "sonner";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service & Privacy Policy",
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [formData, setFormData] = useState<SignupFormData | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const { sendOtp, verifyOtp, loginAs, customerProfile } = useAppStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      agreeTerms: true,
    },
  });

  const watchedPassword = watch("password") || "";
  useEffect(() => {
    setPasswordValue(watchedPassword);
  }, [watchedPassword]);

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return Math.min(100, score);
  };

  const strength = calculateStrength(passwordValue);
  let strengthLabel = "Too Short";
  let strengthColor = "bg-rose-500";
  if (strength >= 80) {
    strengthLabel = "Very Strong";
    strengthColor = "bg-emerald-400";
  } else if (strength >= 60) {
    strengthLabel = "Good";
    strengthColor = "bg-amber-400";
  } else if (strength >= 30) {
    strengthLabel = "Fair";
    strengthColor = "bg-orange-400";
  }

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const onSignupSubmit = (data: SignupFormData) => {
    setFormData(data);
    const phoneFormatted = `+91 ${data.phone}`;
    const res = sendOtp(phoneFormatted, "signup");
    if (res.success) {
      setStep("verify");
      setResendTimer(30);
      setOtpError("");
      setOtpValue("");
      toast.success(`Verification code dispatched to ${phoneFormatted}`);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifySignupOtp = () => {
    if (otpValue.length < 6) {
      setOtpError("Please enter all 6 digits.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const res = verifyOtp(otpValue);
    if (res.success && formData) {
      // Create new customer account in store
      loginAs({
        id: `cust-${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        phone: `+91 ${formData.phone}`,
        role: "Customer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      });

      toast.success("Account created successfully! Let's personalize your care.");
      router.push("/app/onboarding");
    } else {
      setOtpError(res.message);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Begin Your Transformation
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          Create your clinical account for AI diagnostics & custom formulas.
        </p>
      </div>

      {step === "form" ? (
        <form onSubmit={handleSubmit(onSignupSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register("fullName")}
                placeholder="e.g. Radhika Singhania"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-400 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Mobile Number (India) *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gold-400 font-mono pr-2 border-r border-gold-500/20">
                <span>+91</span>
              </div>
              <input
                {...register("phone")}
                type="tel"
                maxLength={10}
                placeholder="98244 24455"
                className="w-full h-11 pl-16 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register("email")}
                type="email"
                placeholder="radhika@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password with Strength Meter */}
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Create Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 chars (upper, number)"
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

            {/* Strength Meter Bar */}
            {passwordValue.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-text-muted">Password Strength:</span>
                  <span className="font-semibold text-gold-300">{strengthLabel}</span>
                </div>
                <div className="w-full bg-bg-elevated h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-300`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-text-muted cursor-pointer">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 accent-[#C99A45]"
              />
              <span>
                I agree to the{" "}
                <Link href="/legal/terms" target="_blank" className="text-gold-300 underline">
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link href="/legal/privacy" target="_blank" className="text-gold-300 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-rose-400 mt-1">{errors.agreeTerms.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={isSubmitting}
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm mt-2"
          >
            Create Account & Verify OTP <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      ) : (
        /* OTP Verification Step */
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Verify number <strong className="text-gold-300 font-mono">+91 {formData?.phone}</strong>
            </span>
            <button
              onClick={() => setStep("form")}
              className="text-gold-400 hover:text-gold-200 underline"
            >
              Back
            </button>
          </div>

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

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-300">
            <span>Demo OTP Code: <strong className="font-mono text-amber-200">123456</strong></span>
          </div>

          <Button
            type="button"
            onClick={handleVerifySignupOtp}
            variant="gold"
            size="lg"
            disabled={otpValue.length < 6}
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
          >
            Confirm Registration <CheckCircle2 className="w-4 h-4 ml-1.5" />
          </Button>

          <div className="text-center text-xs text-text-muted">
            {resendTimer > 0 ? (
              <span>Resend in <strong className="text-gold-400 font-mono">{resendTimer}s</strong></span>
            ) : (
              <button
                onClick={() => {
                  if (formData) {
                    sendOtp(`+91 ${formData.phone}`, "signup");
                    setResendTimer(30);
                    toast.success("New OTP code dispatched!");
                  }
                }}
                className="text-gold-400 hover:text-gold-200 font-semibold underline cursor-pointer"
              >
                Resend OTP Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Switch to Sign In */}
      <div className="text-center text-xs text-text-muted pt-2 border-t border-gold-500/15">
        Already have a Celebs Alley profile?{" "}
        <Link href="/auth/login" className="text-gold-300 hover:text-gold-200 font-semibold underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
