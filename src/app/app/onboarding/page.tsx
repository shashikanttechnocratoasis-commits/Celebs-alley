"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  AlertCircle,
  HelpCircle,
  FileText,
  User,
  Activity,
  Heart,
  Droplets,
  Sun,
  Edit3,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import questionnaireData from "@/data/questionnaire.json";
import type { QuestionnaireAnswers, ConsentRecord } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { customerProfile, saveConsent, saveQuestionnaire, completeOnboarding } = useAppStore();

  // Current stage: 0 = Consent, 1..8 = Questions, 9 = Summary Review
  const [currentStep, setCurrentStep] = useState(0);
  const totalQuestions = questionnaireData.length; // 8
  const totalSteps = totalQuestions + 2; // Step 0 (Consent), 1..8 (Questions), 9 (Review)

  // Step 0 Consent State
  const [consentAnalysis, setConsentAnalysis] = useState(true);
  const [consentTerms, setConsentTerms] = useState(true);
  const [consentHistory, setConsentHistory] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);

  // Questionnaire Answers State
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    ageRange: "23-32",
    gender: "female",
    skinType: "combination",
    skinConcerns: ["Dehydration", "Redness"],
    allergies: ["none"],
    currentRoutine: "moderate",
    sunExposure: "1 – 3 hours",
    sleepHours: "7 – 8 hours",
    waterIntake: "1.5 – 2.5 Liters",
    stressLevel: "Moderate",
    pregnantOrNursing: "not_applicable",
    ...customerProfile?.questionnaire,
  });

  const canProceedConsent = consentAnalysis && consentTerms;

  const handleConsentSubmit = () => {
    if (!canProceedConsent) return;
    const record: ConsentRecord = {
      timestamp: new Date().toISOString(),
      version: "v1.0",
      facialAnalysis: consentAnalysis,
      privacyTerms: consentTerms,
      storeHistory: consentHistory,
      marketing: consentMarketing,
    };
    saveConsent(record);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSingleSelect = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key: string, value: string) => {
    setAnswers((prev) => {
      const currentList: string[] = prev[key] || [];
      if (value === "none") {
        return { ...prev, [key]: ["none"] };
      }
      const filtered = currentList.filter((v) => v !== "none");
      if (filtered.includes(value)) {
        const next = filtered.filter((v) => v !== value);
        return { ...prev, [key]: next.length ? next : ["none"] };
      } else {
        return { ...prev, [key]: [...filtered, value] };
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentStep < totalQuestions) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Move to Summary Review
      setCurrentStep(totalQuestions + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinishOnboarding = () => {
    saveQuestionnaire(answers);
    completeOnboarding();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#E8C77A", "#AA771C", "#FFFFFF"],
    });

    toast.success("Profile saved! Initializing multi-spectral camera scanner...");
    setTimeout(() => {
      router.push("/app/scan");
    }, 600);
  };

  const progressPercentage = Math.round((currentStep / (totalSteps - 1)) * 100);

  // Active question object
  const activeQuestion = currentStep >= 1 && currentStep <= totalQuestions ? questionnaireData[currentStep - 1] : null;

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col justify-between selection:bg-[#C99A45]/30">
      {/* Top Header & Progress Bar */}
      <header className="sticky top-0 z-40 bg-bg-surface/90 backdrop-blur-xl border-b border-gold-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo variant="full" surface="dark" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gold-300">
              {currentStep === 0
                ? "Step 1/3: Consent"
                : currentStep <= totalQuestions
                ? `Question ${currentStep} of ${totalQuestions}`
                : "Step 3/3: Review"}
            </span>
            <Link
              href="/app"
              className="text-xs text-text-muted hover:text-gold-300 transition-colors hidden sm:inline"
            >
              Exit to Dashboard
            </Link>
          </div>
        </div>

        {/* Linear Gold Progress Bar */}
        <div className="w-full bg-[#1A130B] h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 shadow-gold-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* =========================================================================
              STEP 0: BIOMETRIC CONSENT & DATA PRIVACY
             ========================================================================= */}
          {currentStep === 0 && (
            <motion.div
              key="step-consent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Biometric Transparency Protocol</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-bold text-text-primary">
                  Biometric Consent & Data Sovereignty
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Before we activate the optical scanning camera, please review how Celebs Alley safeguards your biological privacy.
                </p>
              </div>

              {/* 3 Pillars Explainer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-heading font-bold text-text-primary">
                    Detection, Not Recognition
                  </h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    We analyze pixel refraction to score 8 skin biomarkers. We do NOT identify who you are or store facial identity maps.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-heading font-bold text-text-primary">
                    Local Device Processing
                  </h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Camera feeds are processed directly in your browser. Raw video frames never leave your local session.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-heading font-bold text-text-primary">
                    Instant Purge Right
                  </h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    You can permanently erase all scan history and topology records with a single click in your Privacy Settings.
                  </p>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="p-6 rounded-2xl bg-bg-elevated/90 border border-gold-500/30 space-y-4">
                <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400 block pb-2 border-b border-gold-500/20">
                  Consent Agreement (Version 1.0)
                </span>

                {/* 1. Facial capture consent (Required) */}
                <label className="flex items-start gap-3 text-xs text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAnalysis}
                    onChange={(e) => setConsentAnalysis(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 accent-[#C99A45]"
                  />
                  <span>
                    <strong className="text-gold-300">[Required]</strong> I consent to optical facial capture and multi-spectral algorithmic skin parameter analysis.
                  </span>
                </label>

                {/* 2. Terms & Privacy (Required) */}
                <label className="flex items-start gap-3 text-xs text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={(e) => setConsentTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 accent-[#C99A45]"
                  />
                  <span>
                    <strong className="text-gold-300">[Required]</strong> I accept the{" "}
                    <Link href="/legal/terms" target="_blank" className="text-gold-300 underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and acknowledge the{" "}
                    <Link href="/legal/privacy" target="_blank" className="text-gold-300 underline font-semibold">
                      Biometric Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* 3. History Storage (Optional) */}
                <label className="flex items-start gap-3 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentHistory}
                    onChange={(e) => setConsentHistory(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 accent-[#C99A45]"
                  />
                  <span>
                    <span className="text-text-muted">[Optional]</span> Allow storing encrypted scan thumbnails in my account for longitudinal progress comparisons.
                  </span>
                </label>

                {/* 4. Marketing (Optional) */}
                <label className="flex items-start gap-3 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 accent-[#C99A45]"
                  />
                  <span>
                    <span className="text-text-muted">[Optional]</span> Receive curated clinical dermatological tips and royal Ayurvedic formulations.
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  onClick={handleConsentSubmit}
                  variant="gold"
                  size="lg"
                  disabled={!canProceedConsent}
                  className="uppercase tracking-wider text-xs font-semibold shadow-gold-sm w-full sm:w-auto justify-center"
                >
                  Agree & Continue to Questionnaire <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              STEPS 1 to 8: CLINICAL QUESTIONNAIRE
             ========================================================================= */}
          {activeQuestion && (
            <motion.div
              key={`question-${activeQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-semibold uppercase tracking-wider text-gold-400">
                    Category: {activeQuestion.category}
                  </span>
                  {activeQuestion.optional && (
                    <span className="text-text-muted text-[11px]">(Optional Question)</span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                  {activeQuestion.title}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {activeQuestion.description}
                </p>
              </div>

              {/* Single Select Options */}
              {activeQuestion.type === "single" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {activeQuestion.options?.map((rawOpt) => {
                    const opt = rawOpt as { label: string; value: string; hint?: string };
                    const isSelected = answers[activeQuestion.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSingleSelect(activeQuestion.key, opt.value)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-bg-elevated border-gold-400 shadow-gold-sm ring-1 ring-gold-400/50"
                            : "bg-bg-surface border-gold-500/20 hover:border-gold-500/45 hover:bg-bg-elevated/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-sm font-heading font-bold ${isSelected ? "text-gold-300" : "text-text-primary"}`}>
                            {opt.label}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-gold-400 bg-gold-500/20 text-gold-400" : "border-gold-500/30"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-gold-400" />}
                          </div>
                        </div>
                        {opt.hint && (
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {opt.hint}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multiple Select Options */}
              {activeQuestion.type === "multiple" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {activeQuestion.options?.map((rawOpt) => {
                    const opt = rawOpt as { label: string; value: string; hint?: string };
                    const currentSelected: string[] = answers[activeQuestion.key] || [];
                    const isSelected = currentSelected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleMultiSelect(activeQuestion.key, opt.value)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-bg-elevated border-gold-400 shadow-gold-sm ring-1 ring-gold-400/50"
                            : "bg-bg-surface border-gold-500/20 hover:border-gold-500/45"
                        }`}
                      >
                        <span className={`text-sm font-heading font-semibold ${isSelected ? "text-gold-300" : "text-text-primary"}`}>
                          {opt.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-gold-400 bg-gold-500 text-bg-base" : "border-gold-500/30"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Slider Group / Sub Questions (Lifestyle) */}
              {activeQuestion.type === "slider_group" && activeQuestion.subQuestions && (
                <div className="space-y-4 pt-2">
                  {activeQuestion.subQuestions.map((sub) => {
                    const currentVal = answers[sub.key] || sub.options[1];
                    return (
                      <div
                        key={sub.key}
                        className="p-4 sm:p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-heading font-bold text-text-primary">
                            {sub.label}
                          </span>
                          <span className="text-gold-300 font-semibold font-mono">
                            {currentVal}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {sub.options.map((optionText) => (
                            <button
                              key={optionText}
                              type="button"
                              onClick={() => setAnswers((prev) => ({ ...prev, [sub.key]: optionText }))}
                              className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                                currentVal === optionText
                                  ? "bg-bg-elevated border-gold-400 text-gold-300 shadow-gold-sm"
                                  : "bg-bg-base/60 border-gold-500/15 text-text-muted hover:text-text-primary"
                              }`}
                            >
                              {optionText}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-gold-500/20">
                <Button
                  onClick={handlePrev}
                  variant="ghost"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="text-xs text-text-muted hover:text-gold-300"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  {activeQuestion.optional && (
                    <Button
                      onClick={handleNextQuestion}
                      variant="ghost"
                      size="md"
                      className="text-xs text-text-muted"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNextQuestion}
                    variant="gold"
                    size="md"
                    className="uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
                  >
                    Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              STEP 9: SUMMARY REVIEW SCREEN
             ========================================================================= */}
          {currentStep > totalQuestions && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clinical Intake Review</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                  Review Your Diagnostic Profile
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Confirm your baseline data before triggering the 3-angle multi-spectral camera scan.
                </p>
              </div>

              {/* Summary Review Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Demographics & Skin Type */}
                <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/25 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400">
                      Skin Baseline
                    </span>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-sm font-bold text-text-primary capitalize">
                    {answers.skinType} Skin Profile
                  </p>
                  <p className="text-xs text-text-muted">
                    Age Group: {answers.ageRange || "23-32"} • Gender: {answers.gender || "Not specified"}
                  </p>
                </div>

                {/* 2. Target Concerns */}
                <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/25 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400">
                      Target Concerns
                    </span>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {answers.skinConcerns?.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-xs text-gold-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Allergies & Sensitivities */}
                <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/25 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400">
                      Allergies & Contraindications
                    </span>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary capitalize">
                    {answers.allergies?.join(", ") || "No known allergies"}
                  </p>
                </div>

                {/* 4. Lifestyle & Environment */}
                <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/25 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400">
                      Lifestyle Factors
                    </span>
                    <button
                      onClick={() => setCurrentStep(7)}
                      className="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">
                    Sun Exposure: {answers.sunExposure} • Sleep: {answers.sleepHours}
                  </p>
                  <p className="text-xs text-text-muted">
                    Water: {answers.waterIntake} • Stress: {answers.stressLevel}
                  </p>
                </div>
              </div>

              {/* Final Confirm Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gold-500/20">
                <Button
                  onClick={() => setCurrentStep(totalQuestions)}
                  variant="ghost"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="text-xs text-text-muted hover:text-gold-300"
                >
                  Back
                </Button>

                <Button
                  onClick={handleFinishOnboarding}
                  variant="gold"
                  size="lg"
                  className="uppercase tracking-wider text-xs font-semibold shadow-gold-sm"
                >
                  Confirm & Launch AI Camera Scan <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Legal Note */}
      <footer className="py-4 text-center text-[11px] text-text-muted border-t border-gold-500/10">
        Clinical Diagnostic Simulation • Powered by Celebs Alley Neural Vision Matrix v3.2
      </footer>
    </div>
  );
}
