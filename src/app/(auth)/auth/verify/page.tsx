"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { useAppStore } from "@/store";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const { otpState, verifyOtp, customerProfile } = useAppStore();

  const handleVerify = () => {
    if (otpValue.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    const res = verifyOtp(otpValue);
    if (res.success) {
      toast.success(res.message);
      if (!customerProfile?.onboardingCompleted) {
        router.push("/app/onboarding");
      } else {
        router.push("/app");
      }
    } else {
      setOtpError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Two-Factor Authentication
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          Enter the verification code sent to your registered device.
        </p>
      </div>

      <div className="space-y-5">
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
          <span>Demo Verification Code: <strong className="font-mono text-amber-200">123456</strong></span>
        </div>

        <Button
          type="button"
          onClick={handleVerify}
          variant="gold"
          size="lg"
          disabled={otpValue.length < 6}
          className="w-full justify-center uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
        >
          Confirm & Enter <CheckCircle2 className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      <div className="text-center text-xs text-text-muted pt-2 border-t border-gold-500/15">
        Need to change account?{" "}
        <Link href="/auth/login" className="text-gold-300 hover:text-gold-200 font-semibold underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
