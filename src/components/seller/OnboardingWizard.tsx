"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Store,
  Layers,
  Truck,
  Rocket,
  Upload,
  CheckCircle2,
  X,
  CreditCard,
  Building,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import type { Seller, Product } from "@/types";
import plansData from "@/data/plans.json";
import brandsData from "@/data/brands.json";

export interface OnboardingWizardProps {
  seller: Seller;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ seller, isOpen, onClose }: OnboardingWizardProps) {
  const { updateSeller, products, inventory, addInventoryOffer } = useAppStore();

  const [step, setStep] = useState(seller.onboardingStep || 1);
  const [selectedPlanId, setSelectedPlanId] = useState(seller.planId || "plan-starter");
  const [storeName, setStoreName] = useState(seller.company || "");
  const [storeSlug, setStoreSlug] = useState(
    seller.storeSlug || seller.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );
  const [storeDescription, setStoreDescription] = useState(
    seller.storeDescription || "Official authorized luxury cosmeceutical and derma distributor."
  );
  const [bannerColor, setBannerColor] = useState(seller.storeBannerColor || "#C99A45");
  const [selectedBrandId, setSelectedBrandId] = useState(brandsData[0]?.id || "brand-1");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [handlingTime, setHandlingTime] = useState(seller.deliveryDays || 2);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    seller.freeShippingThreshold || 999
  );
  const [shippingFee, setShippingFee] = useState(seller.shippingFee || 79);
  const [serviceableArea, setServiceableArea] = useState<"all" | "custom">("all");
  const [pincodesInput, setPincodesInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (seller.onboardingStep) {
      setStep(seller.onboardingStep);
    }
  }, [seller.onboardingStep]);

  if (!isOpen) return null;

  const saveCurrentStepProgress = (newStep: number) => {
    updateSeller(seller.id, {
      onboardingStep: newStep,
      planId: selectedPlanId,
      storeSlug,
      storeDescription,
      storeBannerColor: bannerColor,
      deliveryDays: handlingTime,
      freeShippingThreshold,
      shippingFee,
    });
    setStep(newStep);
  };

  const handleFinishGoLive = () => {
    // 1. Link selected products as offers if any
    if (selectedProductIds.length > 0) {
      selectedProductIds.forEach((pid) => {
        const prod = products.find((p) => p.id === pid);
        if (prod) {
          const alreadyOffered = inventory.some(
            (inv) => inv.productId === pid && inv.sellerId === seller.id
          );
          if (!alreadyOffered) {
            addInventoryOffer({
              productId: pid,
              sellerId: seller.id,
              price: Math.round(prod.mrp * 0.92),
              mrp: prod.mrp,
              stock: 35,
              reserved: 0,
              lowStockThreshold: 5,
              sku: `${prod.sku}-${seller.id.slice(-2).toUpperCase()}`,
              status: "active",
            });
          }
        }
      });
    }

    // 2. Mark onboarding completed & store live
    updateSeller(seller.id, {
      onboardingCompleted: true,
      onboardingStep: 6,
      isPaused: false,
      planId: selectedPlanId,
      storeSlug,
      storeDescription,
      storeBannerColor: bannerColor,
      deliveryDays: handlingTime,
      freeShippingThreshold,
      shippingFee,
    });

    setIsCompleted(true);

    // 3. Trigger confetti fireworks
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#C99A45", "#E8C77A", "#FFFFFF", "#B8812F"],
    });

    showToast.success("Congratulations! Your boutique is officially LIVE.");
  };

  const stepsList = [
    { num: 1, label: "Choose Plan" },
    { num: 2, label: "Create Store" },
    { num: 3, label: "Add Brand" },
    { num: 4, label: "Add Products" },
    { num: 5, label: "Shipping" },
    { num: 6, label: "Go Live" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0907]/95 backdrop-blur-xl flex flex-col font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="h-20 px-6 sm:px-10 border-b border-[#C99A45]/20 flex items-center justify-between flex-shrink-0 bg-[#1A130B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C99A45]/20 flex items-center justify-center text-[#E8C77A]">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#F5EDE0]">
              Distributor Onboarding Wizard
            </h2>
            <p className="text-xs text-[#A89A85]">
              Step {step} of 6 • Setting up {seller.company}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#A89A85] hover:text-[#F5EDE0] hover:bg-[#241A0F] transition-colors"
          aria-label="Close Wizard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="px-6 sm:px-10 py-3 bg-[#1A130B]/60 border-b border-[#C99A45]/15 flex items-center justify-center gap-2 sm:gap-6 overflow-x-auto">
        {stepsList.map((st) => (
          <button
            key={st.num}
            onClick={() => saveCurrentStepProgress(st.num)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
              step === st.num
                ? "bg-[#C99A45]/20 text-[#E8C77A] border border-[#C99A45]/40"
                : step > st.num
                ? "text-[#5FAF7A] hover:text-[#5FAF7A]/80"
                : "text-[#A89A85] hover:text-[#F5EDE0]"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === st.num
                  ? "bg-[#E8C77A] text-[#0B0907]"
                  : step > st.num
                  ? "bg-[#5FAF7A] text-[#0B0907]"
                  : "bg-[#241A0F] text-[#A89A85]"
              }`}
            >
              {step > st.num ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
            </span>
            <span className="hidden sm:inline">{st.label}</span>
          </button>
        ))}
      </div>

      {/* Main Form Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-[#5FAF7A]/20 border-2 border-[#5FAF7A] flex items-center justify-center text-[#5FAF7A] mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold text-[#F5EDE0]">
                  Your Boutique is Live!
                </h3>
                <p className="text-sm text-[#A89A85] max-w-md mx-auto">
                  Your store credentials, listed items, and logistics SLAs are now active. Customers can discover and purchase your luxury formulations.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-4">
                <Button variant="primary" size="lg" onClick={onClose}>
                  Go to Seller Dashboard
                </Button>
              </div>
            </motion.div>
          ) : step === 1 ? (
            /* STEP 1: CHOOSE PLAN */
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Step 1 of 6
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Select Your Distributor SaaS Plan
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Choose an operational tier that matches your SKU volume and warehouse network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plansData.map((plan: any) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#241A0F] border-[#E8C77A] shadow-[0_4px_20px_rgba(201,154,69,0.25)]"
                          : "bg-[#1A130B] border-[#C99A45]/20 hover:border-[#C99A45]/50"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-[#F5EDE0]">
                            {plan.name}
                          </h4>
                          {plan.isPopular && (
                            <Badge variant="gold" size="sm">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-xl font-bold font-serif text-[#E8C77A]">
                          {plan.priceMonthly === 0
                            ? "Free"
                            : `₹${plan.priceMonthly.toLocaleString("en-IN")}`}
                          <span className="text-xs font-sans text-[#A89A85] font-normal">
                            /mo
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A89A85] leading-relaxed line-clamp-2">
                          {plan.description}
                        </p>
                        <ul className="text-[11px] text-[#F5EDE0] space-y-1.5 pt-2 border-t border-[#C99A45]/15">
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#5FAF7A]" />
                            {plan.limits.maxProducts} SKUs
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#5FAF7A]" />
                            {plan.limits.commissionRate}% Commission
                          </li>
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#C99A45]/15">
                        <div
                          className={`w-full py-1.5 rounded-xl text-center text-xs font-semibold ${
                            isSelected
                              ? "bg-[#E8C77A] text-[#0B0907]"
                              : "bg-[#241A0F] text-[#A89A85]"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select Tier"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={onClose}>
                  Save & Exit
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => saveCurrentStepProgress(2)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to Store Profile
                </Button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            /* STEP 2: CREATE STORE */
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Step 2 of 6
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Configure Your Boutique Identity
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Personalize how your dispensary appears on consumer product pages and seller comparisons.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Public Store Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Store URL Slug
                    </label>
                    <div className="flex items-center rounded-xl bg-[#0B0907] border border-[#C99A45]/30 px-3">
                      <span className="text-xs text-[#A89A85] select-none">
                        celebsalley.com/seller/
                      </span>
                      <input
                        type="text"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 py-2.5 bg-transparent text-xs text-[#F5EDE0] focus:outline-none ml-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    Distributor Bio & Story
                  </label>
                  <textarea
                    rows={3}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Store Theme Accent
                    </label>
                    <div className="flex items-center gap-3">
                      {["#C99A45", "#9B72CF", "#4895EF", "#5FAF7A", "#E0A93B"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBannerColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            bannerColor === c ? "scale-125 border-white" : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Boutique Logo (Simulated)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#241A0F] border border-[#C99A45]/30 flex items-center justify-center text-[#E8C77A] font-serif font-bold text-sm">
                        {storeName.charAt(0) || "C"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showToast.success("Simulated logo uploaded.")}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Upload Emblem
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => saveCurrentStepProgress(1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => saveCurrentStepProgress(3)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to Brands
                </Button>
              </div>
            </motion.div>
          ) : step === 3 ? (
            /* STEP 3: ADD BRAND */
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Step 3 of 6
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Link Your Primary Brand Association
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Select the flagship clinical brand you are authorized to distribute.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brandsData.map((b: any) => {
                  const isSelected = selectedBrandId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBrandId(b.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        isSelected
                          ? "bg-[#241A0F] border-[#E8C77A]"
                          : "bg-[#1A130B] border-[#C99A45]/20 hover:border-[#C99A45]/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 flex items-center justify-center text-xs font-serif font-bold text-[#E8C77A]">
                        {b.name.split(" ")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#F5EDE0] truncate">
                          {b.name}
                        </h4>
                        <p className="text-xs text-[#A89A85] truncate">
                          Origin: {b.origin} • {b.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#5FAF7A] flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => saveCurrentStepProgress(2)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => saveCurrentStepProgress(4)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to First Products
                </Button>
              </div>
            </motion.div>
          ) : step === 4 ? (
            /* STEP 4: ADD FIRST PRODUCTS */
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Step 4 of 6
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Select Products to List
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Link catalog formulations to start selling immediately. (You can also skip and list later).
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2">
                {products.slice(0, 8).map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedProductIds((prev) =>
                          isChecked ? prev.filter((id) => id !== prod.id) : [...prev, prod.id]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-[#241A0F] border-[#E8C77A]"
                          : "bg-[#1A130B] border-[#C99A45]/20 hover:border-[#C99A45]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-center text-xs font-serif text-[#E8C77A]">
                          {prod.routineStep?.charAt(0) || "P"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#F5EDE0] truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-[#A89A85] font-mono">
                            SKU: {prod.sku} • MRP: ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#E8C77A] border-[#E8C77A] text-[#0B0907]"
                            : "border-[#C99A45]/40"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => saveCurrentStepProgress(3)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => saveCurrentStepProgress(5)}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => saveCurrentStepProgress(5)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Continue to Shipping ({selectedProductIds.length} Selected)
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : step === 5 ? (
            /* STEP 5: CONFIGURE SHIPPING */
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                  Step 5 of 6
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Configure Shipping & Logistics SLAs
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Set your warehouse dispatch turnaround and delivery fees.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Handling & Dispatch SLA (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={handlingTime}
                      onChange={(e) => setHandlingTime(Number(e.target.value) || 2)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#A89A85]">
                      Customer will see: &quot;Dispatched within {handlingTime} business days&quot;
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#A89A85]">
                      Orders above ₹{freeShippingThreshold} qualify for complimentary shipping.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    Serviceable Geography
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-[#F5EDE0] cursor-pointer">
                      <input
                        type="radio"
                        checked={serviceableArea === "all"}
                        onChange={() => setServiceableArea("all")}
                        className="accent-[#E8C77A]"
                      />
                      All India (Nationwide Delivery)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#F5EDE0] cursor-pointer">
                      <input
                        type="radio"
                        checked={serviceableArea === "custom"}
                        onChange={() => setServiceableArea("custom")}
                        className="accent-[#E8C77A]"
                      />
                      Specific Pincodes Only
                    </label>
                  </div>
                </div>

                {serviceableArea === "custom" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Comma-separated 6-digit Pincodes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 400001, 400050, 110001"
                      value={pincodesInput}
                      onChange={(e) => setPincodesInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => saveCurrentStepProgress(4)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => saveCurrentStepProgress(6)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Review & Submit for Go-Live
                </Button>
              </div>
            </motion.div>
          ) : (
            /* STEP 6: SUBMIT FOR GO-LIVE */
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#5FAF7A] font-semibold">
                  Step 6 of 6 • Final Verification
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EDE0]">
                  Ready to Launch on Celebs Alley
                </h3>
                <p className="text-xs text-[#A89A85]">
                  Review your configured dispensary details before opening storefront fulfillment.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#A89A85]">Store Name:</span>
                    <p className="font-semibold text-[#F5EDE0]">{storeName}</p>
                  </div>
                  <div>
                    <span className="text-[#A89A85]">Selected Plan:</span>
                    <p className="font-semibold text-[#E8C77A] uppercase">
                      {selectedPlanId.replace("plan-", "")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#A89A85]">Dispatch SLA:</span>
                    <p className="font-semibold text-[#F5EDE0]">{handlingTime} Days</p>
                  </div>
                  <div>
                    <span className="text-[#A89A85]">Initial SKUs to List:</span>
                    <p className="font-semibold text-[#F5EDE0]">{selectedProductIds.length} Products</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#241A0F] border border-[#C99A45]/15 text-xs text-[#A89A85] leading-relaxed">
                  Notice: In this demo simulation, submitting for go-live immediately activates your store and publishes your offers to customer recommendations.
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => saveCurrentStepProgress(5)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinishGoLive}
                  leftIcon={<Rocket className="w-5 h-5 text-[#0B0907]" />}
                >
                  Launch Store Live Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
