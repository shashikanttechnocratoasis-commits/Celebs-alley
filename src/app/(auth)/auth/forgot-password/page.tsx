"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { useAppStore } from "@/store";
import { toast } from "sonner";

const forgotSchema = z.object({
  identifier: z.string().min(3, "Please enter your registered email or 10-digit mobile number"),
});

const resetPassSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetPassFormData = z.infer<typeof resetPassSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identify" | "otp" | "reset" | "success">("identify");
  const [identifier, setIdentifier] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { sendOtp, verifyOtp } = useAppStore();

  const identifyForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { identifier: "radhika@example.com" },
  });

  const resetForm = useForm<ResetPassFormData>({
    resolver: zodResolver(resetPassSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSendResetCode = (data: ForgotFormData) => {
    setIdentifier(data.identifier);
    const res = sendOtp(data.identifier, "forgot");
    if (res.success) {
      setStep("otp");
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyOtp = () => {
    if (otpValue.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    const res = verifyOtp(otpValue);
    if (res.success) {
      setStep("reset");
      toast.success("Identity verified! Set your new password.");
    } else {
      setOtpError(res.message);
    }
  };

  const handleResetPassword = (data: ResetPassFormData) => {
    setStep("success");
    toast.success("Your password has been reset successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Account Recovery
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          Securely reset your password using multi-factor identity verification.
        </p>
      </div>

      {step === "identify" && (
        <form onSubmit={identifyForm.handleSubmit(handleSendResetCode)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...identifyForm.register("identifier")}
                placeholder="radhika@example.com or 9824424455"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {identifyForm.formState.errors.identifier && (
              <p className="text-xs text-rose-400 mt-1">
                {identifyForm.formState.errors.identifier.message}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 text-xs text-gold-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <span>A 6-digit recovery code will be dispatched to your registered contact.</span>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
          >
            Send Recovery Code <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <div className="text-xs text-text-muted">
            Recovery code sent to <strong className="text-gold-300 font-mono">{identifier}</strong>
          </div>

          <div className="py-2">
            <OTPInput
              length={6}
              value={otpValue}
              onChange={(val) => {
                setOtpValue(val);
                setOtpError("");
              }}
              error={otpError}
            />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-300">
            <span>Demo Code: <strong className="font-mono text-amber-200">123456</strong></span>
          </div>

          <Button
            type="button"
            onClick={handleVerifyOtp}
            variant="gold"
            size="lg"
            disabled={otpValue.length < 6}
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
          >
            Verify Recovery Code <CheckCircle2 className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...resetForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
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
            {resetForm.formState.errors.password && (
              <p className="text-xs text-rose-400 mt-1">{resetForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gold-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...resetForm.register("confirmPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/30 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
          >
            Update Password & Login <KeyRound className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-bold text-text-primary">
            Password Updated!
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Your credentials have been securely updated. You can now sign in to your Celebs Alley account.
          </p>
          <div className="pt-2">
            <Link href="/auth/login" className="block w-full">
              <Button variant="gold" size="lg" className="w-full justify-center uppercase tracking-wider text-xs font-semibold">
                Sign In Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Back to login */}
      <div className="text-center text-xs text-text-muted pt-2 border-t border-gold-500/15">
        Remembered your password?{" "}
        <Link href="/auth/login" className="text-gold-300 hover:text-gold-200 font-semibold underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
