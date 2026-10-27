"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { Plan, PlanStep, Product } from "@/types";
import {
  ClipboardList,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Save,
  Send,
  Eye,
  Sun,
  Moon,
  Bookmark,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function PrescriptionPlanBuilderPage() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams?.get("clientId") || null;

  const {
    currentUser,
    appointments,
    customers,
    products,
    ingredients,
    clientPlans,
    planTemplates,
    planProgress,
    createPlan,
    publishPlan,
    savePlanAsTemplate,
    logAuditEvent,
  } = useAppStore();

  const activeConsultantId =
    currentUser?.consultantId ||
    (currentUser?.id === "user-consultant"
      ? "cons-1"
      : currentUser?.id === "user-consultant-2"
      ? "cons-2"
      : currentUser?.id === "user-consultant-3"
      ? "cons-3"
      : "cons-1");

  // Clients with an appointment with this consultant
  const myClients = useMemo(() => {
    const clientIds = new Set(
      appointments
        .filter((a) => a.consultantId === activeConsultantId)
        .map((a) => a.customerId)
    );
    return (customers || []).filter((c: any) => clientIds.has(c.id));
  }, [appointments, customers, activeConsultantId]);

  // Selected client for the new/edited plan
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClientId || myClients[0]?.id || "cust-1"
  );

  const selectedClient = useMemo(() => {
    return (customers || []).find((c: any) => c.id === selectedClientId) || customers[0];
  }, [customers, selectedClientId]);

  // Existing plans for this client & consultant
  const existingPlans = useMemo(() => {
    return clientPlans.filter(
      (p) =>
        p.consultantId === activeConsultantId &&
        (selectedClientId ? p.clientId === selectedClientId : true)
    );
  }, [clientPlans, activeConsultantId, selectedClientId]);

  // Plan Form State
  const [planTitle, setPlanTitle] = useState(
    "Clinical Barrier Restoration & Cellular Renewal Protocol"
  );
  const [planGoals, setPlanGoals] = useState(
    "Soothe persistent erythema, repair stratum corneum lipid matrix, normalize TEWL rate."
  );
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [lifestyleTips, setLifestyleTips] = useState(
    "Use lukewarm water only. Avoid hot showers on facial skin. Sleep with silk pillowcase."
  );
  const [dietNotes, setDietNotes] = useState(
    "Increase dietary omega-3 fatty acids (flaxseed, walnuts). Drink 2.5L water daily."
  );
  const [followupWeeks, setFollowupWeeks] = useState(4);

  // AM and PM Routine steps
  const [amSteps, setAmSteps] = useState<PlanStep[]>([
    {
      id: "step-am-1",
      stepNumber: 1,
      title: "Gentle Barrier Cleanse",
      productId: "prod-2",
      productName: "Barrier Defense Soothing Cleanser",
      routineStep: "Cleanser",
      timeOfDay: "AM",
      usage: "Apply 2 pumps on damp face, massage for 45s, rinse with lukewarm water",
      frequency: "Daily",
      waitTime: "None",
    },
    {
      id: "step-am-2",
      stepNumber: 2,
      title: "Cellular Hydration Serum",
      productId: "prod-1",
      productName: "Golden Elixir Cellular Infusion Serum",
      routineStep: "Serum",
      timeOfDay: "AM",
      usage: "Press 3-4 drops gently across cheeks and forehead",
      frequency: "Daily",
      waitTime: "Wait 2 minutes",
    },
  ]);

  const [pmSteps, setPmSteps] = useState<PlanStep[]>([
    {
      id: "step-pm-1",
      stepNumber: 1,
      title: "Oil-Based Deep Cleanse",
      productId: "prod-2",
      productName: "Barrier Defense Soothing Cleanser",
      routineStep: "Cleanser",
      timeOfDay: "PM",
      usage: "Massage over dry skin to dissolve pollution and sebum",
      frequency: "Daily",
      waitTime: "None",
    },
    {
      id: "step-pm-2",
      stepNumber: 2,
      title: "Night Repair Barrier Cream",
      productId: "prod-3",
      productName: "Velvet Night Lipid Restore Cream",
      routineStep: "Moisturizer",
      timeOfDay: "PM",
      usage: "Warm a pea-sized amount between fingertips and pat on face",
      frequency: "Daily",
      waitTime: "Wait 5 minutes before bed",
    },
  ]);

  // Product Catalog Search for Step Adding
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [pickerTargetTime, setPickerTargetTime] = useState<"AM" | "PM">("AM");
  const [productSearch, setProductSearch] = useState("");

  // Allergy / Contraindication Safety Dialog State
  const [safetyDialogOpen, setSafetyDialogOpen] = useState(false);
  const [conflictedProduct, setConflictedProduct] = useState<Product | null>(null);
  const [conflictReason, setConflictReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  // Duplicate active warning
  const duplicateActiveWarning = useMemo(() => {
    const allStepProductIds = [...amSteps, ...pmSteps].map((s) => s.productId);
    const retinoidProducts = products.filter((p) => {
      if (!allStepProductIds.includes(p.id)) return false;
      return (
        p.name.toLowerCase().includes("retin") ||
        p.ingredients.some((ingId) => ingId === "ing-3")
      );
    });

    if (retinoidProducts.length > 1) {
      return `Potential Duplicate Active: Multiple retinoid products selected (${retinoidProducts
        .map((p) => p.name)
        .join(", ")}). Simultaneous application may induce retinoid dermatitis.`;
    }
    return null;
  }, [amSteps, pmSteps, products]);

  // Load template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Apply template
  const handleApplyTemplate = (templateId: string) => {
    const tpl = planTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    const goalsText = Array.isArray(tpl.goals) ? tpl.goals.join(", ") : (tpl.goals || tpl.description || "");
    setPlanTitle(tpl.title);
    setPlanGoals(goalsText);
    setDurationWeeks(tpl.durationWeeks);
    const templateAm = tpl.amSteps || (tpl as any).amRoutine || [];
    const templatePm = tpl.pmSteps || (tpl as any).pmRoutine || [];
    setAmSteps(
      templateAm.map((s: any, i: number) => ({
        ...s,
        id: `step-tpl-am-${Date.now()}-${i}`,
        timeOfDay: "AM",
      }))
    );
    setPmSteps(
      templatePm.map((s: any, i: number) => ({
        ...s,
        id: `step-tpl-pm-${Date.now()}-${i}`,
        timeOfDay: "PM",
      }))
    );
    setTemplateDialogOpen(false);
    showToast.success(`Applied template: ${tpl.title}`);
  };

  // Reordering steps
  const moveStep = (timeOfDay: "AM" | "PM", index: number, direction: "up" | "down") => {
    const list = timeOfDay === "AM" ? [...amSteps] : [...pmSteps];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // re-number
    const updated = list.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    if (timeOfDay === "AM") setAmSteps(updated);
    else setPmSteps(updated);
  };

  // Remove step
  const removeStep = (timeOfDay: "AM" | "PM", index: number) => {
    const list = timeOfDay === "AM" ? [...amSteps] : [...pmSteps];
    list.splice(index, 1);
    const updated = list.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    if (timeOfDay === "AM") setAmSteps(updated);
    else setPmSteps(updated);
  };

  // Check product safety before adding
  const checkSafetyAndAddProduct = (prod: Product) => {
    // 1. Allergy check against selected client
    const clientAllergies = selectedClient?.allergies || [];
    let hasConflict = false;
    let detectedReason = "";

    clientAllergies.forEach((allergy: string) => {
      const lowerAllergy = allergy.toLowerCase();
      // Check product name or matched ingredients
      if (prod.name.toLowerCase().includes(lowerAllergy)) {
        hasConflict = true;
        detectedReason = `Product contains client allergy allergen: "${allergy}".`;
      }
      // Check ingredients
      prod.ingredients.forEach((ingId) => {
        const ing = ingredients.find((i) => i.id === ingId);
        if (
          ing &&
          (ing.name.toLowerCase().includes(lowerAllergy) ||
            ing.inciName.toLowerCase().includes(lowerAllergy))
        ) {
          hasConflict = true;
          detectedReason = `Product contains ingredient "${ing.name}" which conflicts with client's recorded allergy to "${allergy}".`;
        }
      });
    });

    // 2. Pregnancy check
    if (selectedClient?.pregnancyFlag) {
      if (
        prod.name.toLowerCase().includes("retin") ||
        prod.ingredients.some((i) => i === "ing-3")
      ) {
        hasConflict = true;
        detectedReason = `Patient is currently pregnant/nursing. Retinoid therapy is contraindicated.`;
      }
    }

    if (hasConflict) {
      setConflictedProduct(prod);
      setConflictReason(detectedReason);
      setOverrideReason("");
      setSafetyDialogOpen(true);
      return;
    }

    // Direct add
    addConfirmedStep(prod);
  };

  const addConfirmedStep = (prod: Product, isOverridden = false) => {
    const newStep: PlanStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      stepNumber:
        pickerTargetTime === "AM" ? amSteps.length + 1 : pmSteps.length + 1,
      title: `${prod.routineStep || "Treatment"}: ${prod.name}`,
      productId: prod.id,
      productName: prod.name,
      routineStep: prod.routineStep || "Serum",
      timeOfDay: pickerTargetTime,
      usage: prod.usage || "Apply evenly on skin",
      frequency: "Daily",
      waitTime: "Wait 2 minutes",
    };

    if (pickerTargetTime === "AM") {
      setAmSteps([...amSteps, newStep]);
    } else {
      setPmSteps([...pmSteps, newStep]);
    }

    if (isOverridden) {
      logAuditEvent?.({
        actor: currentUser?.name || "Dr. Meera Nambiar",
        action: `Consultant explicitly overrode allergy/contraindication safety warning for ${selectedClient.name} with product ${prod.name}. Clinical override justification: "${overrideReason}"`,
        resource: "plans",
        ipAddress: "127.0.0.1 (Consultant Portal)",
      });
      showToast.warning("Safety conflict overridden and logged to Platform Audit");
    } else {
      showToast.success(`Added ${prod.name} to ${pickerTargetTime} routine`);
    }

    setProductPickerOpen(false);
    setSafetyDialogOpen(false);
  };

  // Publish plan action
  const handlePublishPlan = () => {
    if (!selectedClient) {
      showToast.error("Select a client first");
      return;
    }

    const newPlan = createPlan({
      consultantId: activeConsultantId,
      consultantName: currentUser?.name || "Dr. Meera Nambiar, MD",
      customerId: selectedClient.id,
      customerName: selectedClient.name,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      title: planTitle,
      goals: planGoals,
      durationWeeks: durationWeeks as 4 | 8 | 12,
      amSteps,
      pmSteps,
      amRoutine: amSteps,
      pmRoutine: pmSteps,
      lifestyleTips,
      dietNotes,
      status: "published",
      followupScheduleWeeks: followupWeeks,
    });

    publishPlan(newPlan.id, "Prescribed initial clinical protocol");

    showToast.success(
      `Plan published successfully! Sent to ${selectedClient.name}'s customer portal.`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Personalized Skincare Plan Builder"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Plans" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <Bookmark className="w-4 h-4 mr-1.5 text-[#E8C77A]" />
              Templates
            </Button>
            <Button variant="gold" size="sm" onClick={handlePublishPlan}>
              <Send className="w-4 h-4 mr-1.5" />
              Publish Plan to Client
            </Button>
          </div>
        }
      />

      {/* Duplicate Active Warning Banner */}
      {duplicateActiveWarning && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-300">
              Clinical Active Caution
            </span>
            <p className="text-[#A89A85]">{duplicateActiveWarning}</p>
          </div>
        </div>
      )}

      {/* Main 2-column layout (Builder on left, Live Customer App Preview on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Client Target & Basic Info */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                  Prescribe For Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#1A130B] border border-[#C99A45]/30 text-xs text-[#F5EDE0] rounded-xl px-3 py-2 font-medium"
                >
                  {myClients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.skinType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                  Regimen Duration
                </label>
                <select
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="bg-[#1A130B] border border-[#C99A45]/30 text-xs text-[#F5EDE0] rounded-xl px-3 py-2"
                >
                  <option value={4}>4 Weeks (Intensive)</option>
                  <option value={8}>8 Weeks (Restorative)</option>
                  <option value={12}>12 Weeks (Full Cellular Cycle)</option>
                </select>
              </div>
            </div>

            {/* Client Allergy Caution Box */}
            {selectedClient?.allergies && selectedClient.allergies.length > 0 && (
              <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  Client Allergies on file:{" "}
                  <strong>{selectedClient.allergies.join(", ")}</strong>. System will block conflicting formulas.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                Protocol Title
              </label>
              <Input
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="e.g. 8-Week Lipid Restoration & Melasma Regimen"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                Clinical Goals & Objectives
              </label>
              <Textarea
                value={planGoals}
                onChange={(e) => setPlanGoals(e.target.value)}
                placeholder="What outcomes will this regimen achieve?"
                rows={2}
              />
            </div>
          </Card>

          {/* AM Routine Builder */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#F5EDE0] flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Morning Protocol (AM)
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setPickerTargetTime("AM");
                  setProductPickerOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add AM Step
              </Button>
            </div>

            <div className="space-y-2">
              {amSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#241A0F] border border-[#C99A45]/30 text-[#E8C77A] font-bold flex items-center justify-center shrink-0 text-xs">
                      {step.stepNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-[#F5EDE0]">
                        {step.productName}
                      </div>
                      <div className="text-[11px] text-[#A89A85]">
                        {step.usage} • {step.waitTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveStep("AM", index, "up")}
                      className="p-1 text-[#A89A85] hover:text-[#F5EDE0] disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === amSteps.length - 1}
                      onClick={() => moveStep("AM", index, "down")}
                      className="p-1 text-[#A89A85] hover:text-[#F5EDE0] disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeStep("AM", index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* PM Routine Builder */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#F5EDE0] flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Evening Protocol (PM)
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setPickerTargetTime("PM");
                  setProductPickerOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add PM Step
              </Button>
            </div>

            <div className="space-y-2">
              {pmSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#241A0F] border border-[#C99A45]/30 text-[#E8C77A] font-bold flex items-center justify-center shrink-0 text-xs">
                      {step.stepNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-[#F5EDE0]">
                        {step.productName}
                      </div>
                      <div className="text-[11px] text-[#A89A85]">
                        {step.usage} • {step.waitTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveStep("PM", index, "up")}
                      className="p-1 text-[#A89A85] hover:text-[#F5EDE0] disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === pmSteps.length - 1}
                      onClick={() => moveStep("PM", index, "down")}
                      className="p-1 text-[#A89A85] hover:text-[#F5EDE0] disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeStep("PM", index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Lifestyle, Nutrition & Follow-up */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
              Lifestyle, Diet & Telehealth Checkpoints
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                  Lifestyle & Environmental Care
                </label>
                <Textarea
                  value={lifestyleTips}
                  onChange={(e) => setLifestyleTips(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                  Dietary & Hydration Directives
                </label>
                <Textarea
                  value={dietNotes}
                  onChange={(e) => setDietNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
                Suggested Follow-up Scan Checkpoint
              </label>
              <select
                value={followupWeeks}
                onChange={(e) => setFollowupWeeks(Number(e.target.value))}
                className="bg-[#1A130B] border border-[#C99A45]/30 text-xs text-[#F5EDE0] rounded-xl px-3 py-2"
              >
                <option value={2}>Week 2 Checkpoint (Tolerance check)</option>
                <option value={4}>Week 4 Checkpoint (Midway cellular review)</option>
                <option value={8}>Week 8 Checkpoint (Full cycle assessment)</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Customer App Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A89A85]">
              Live Patient App Preview (/app/consultations)
            </span>
            <Badge variant="gold" size="sm">
              Live Preview
            </Badge>
          </div>

          <div className="p-5 rounded-3xl bg-[#140F0A] border-2 border-[#C99A45]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C99A45]/15">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#C99A45] tracking-wider">
                  Official Dermatologist Regimen
                </span>
                <h4 className="font-serif text-base font-bold text-[#F5EDE0]">
                  {planTitle}
                </h4>
              </div>
              <Badge variant="gold" size="sm">
                Dr. Meera Nambiar
              </Badge>
            </div>

            <p className="text-xs text-[#A89A85] leading-relaxed">
              {planGoals}
            </p>

            {/* Daily Adherence Progress Checklist Preview */}
            <div className="p-3.5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/15 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F5EDE0]">
                  Daily Regimen Checklist
                </span>
                <span className="text-[11px] text-[#5FAF7A] font-bold">
                  75% Adherence
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#A89A85]">
                {amSteps.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0B0907] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="accent-[#C99A45]"
                      readOnly
                    />
                    <span className="text-[11px] text-[#F5EDE0]">
                      AM: {s.productName}
                    </span>
                  </label>
                ))}
                {pmSteps.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0B0907] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="accent-[#C99A45]"
                      readOnly
                    />
                    <span className="text-[11px] text-[#A89A85]">
                      PM: {s.productName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add All to Cart button preview */}
            <Button variant="gold" className="w-full text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Add All Prescribed Products to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Product Catalog Picker Dialog */}
      <ResponsiveDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        title={`Select Clinical Product for ${pickerTargetTime} Protocol`}
        description="Search active cosmetic catalog. Client AI fit score and allergy tags will be validated."
      >
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
            <Input
              placeholder="Search serums, cleansers, creams..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {products
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.routineStep?.toLowerCase().includes(productSearch.toLowerCase())
              )
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => checkSafetyAndAddProduct(prod)}
                  className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#F5EDE0]">{prod.name}</div>
                    <div className="text-[11px] text-[#A89A85]">
                      {prod.routineStep} • Rating: {prod.rating}★
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Select
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </ResponsiveDialog>

      {/* Blocking Allergy / Contraindication Safety Dialog */}
      <ResponsiveDialog
        open={safetyDialogOpen}
        onOpenChange={setSafetyDialogOpen}
        title="⚠️ Safety Conflict Detected: Clinical Override Required"
        description="The selected product conflicts with patient medical flags. To prescribe this formulation, a clinical override justification must be provided and logged."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Contraindication Flag:
            </div>
            <p>{conflictReason}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A89A85] mb-1 block">
              Practitioner Justification for Override (Mandatory)
            </label>
            <Textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Micro-dosed 0.5% buffered tolerance protocol under direct clinical observation with patch test cleared."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSafetyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={overrideReason.trim().length < 5}
              onClick={() => {
                if (conflictedProduct) {
                  addConfirmedStep(conflictedProduct, true);
                }
              }}
            >
              Sign & Override Safety Lock
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Template Picker Dialog */}
      <ResponsiveDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        title="Clinical Plan Templates"
        description="Choose a standardized dermatologist protocol as a baseline for this client."
      >
        <div className="space-y-3 pt-2">
          {planTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl.id)}
              className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#F5EDE0]">{tpl.title}</h4>
                <Badge variant="outline" size="sm">
                  {tpl.durationWeeks} Weeks
                </Badge>
              </div>
              <p className="text-[11px] text-[#A89A85]">{tpl.description}</p>
            </div>
          ))}
        </div>
      </ResponsiveDialog>
    </div>
  );
}
