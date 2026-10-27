"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/Toast";
import type { User } from "@/types";
import initialUsers from "@/data/users.json";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  User as UserIcon,
  Stethoscope,
  Store,
  Shield,
  CreditCard,
  Layers,
  RotateCcw,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function DemoWalkthroughPage() {
  const router = useRouter();
  const {
    currentUser,
    currentRole,
    loginAs,
    appointments,
    scanShareConsents,
    clientNotes,
    clientPlans,
    orders,
    consultantReviews,
    parameters,
    payoutRequests,
    auditLogs,
    resetDemoData,
  } = useAppStore();

  // Helper to switch role and navigate
  const handleSwitchAndGo = (userId: string, targetPath: string) => {
    const user = (initialUsers as User[]).find((u) => u.id === userId);
    if (user) {
      loginAs(user);
      showToast.success(`Switched role to ${user.name} (${user.role})`);
      router.push(targetPath);
    }
  };

  // State checks for the 10 scenarios
  const step1Done = useMemo(() => {
    return appointments.some((a) => a.status === "pending" || a.status === "confirmed");
  }, [appointments]);

  const step2Done = useMemo(() => {
    return appointments.some(
      (a) => a.status === "confirmed" && a.consultantId === "cons-1"
    );
  }, [appointments]);

  const step3Done = useMemo(() => {
    return scanShareConsents.some(
      (c) => c.customerId === "cust-1" && c.consultantId === "cons-1" && c.granted
    );
  }, [scanShareConsents]);

  const step4Done = useMemo(() => {
    return clientNotes.some(
      (n) => n.clientId === "cust-1" && n.consultantId === "cons-1"
    );
  }, [clientNotes]);

  const step5Done = useMemo(() => {
    return clientPlans.some(
      (p) => p.consultantId === "cons-1" && p.status === "published"
    );
  }, [clientPlans]);

  const step6Done = useMemo(() => {
    return orders.some((o) => o.customerId === "cust-1" || (o as any).items?.length > 0);
  }, [orders]);

  const step7Done = useMemo(() => {
    return orders.some(
      (o) => o.status === "shipped" || o.status === "delivered" || (o.status as string) === "fulfilled"
    );
  }, [orders]);

  const step8Done = useMemo(() => {
    return consultantReviews.some(
      (r) => r.customerId === "cust-1" && r.consultantId === "cons-1"
    );
  }, [consultantReviews]);

  const step9Done = useMemo(() => {
    return auditLogs.some(
      (l) => l.action?.includes("parameter") || l.action?.includes("weight")
    );
  }, [auditLogs]);

  const step10Done = useMemo(() => {
    return payoutRequests.some(
      (p) => (p.status as string) === "paid" || (p.status as string) === "completed" || p.status === "processing"
    );
  }, [payoutRequests]);

  const scenarios = [
    {
      id: 1,
      title: "1. Customer Books Consultation",
      panel: "Public Booking Engine (/book)",
      roleName: "Ritu Sharma (Customer)",
      userId: "user-customer",
      targetPath: "/book",
      isDone: step1Done,
      description:
        "Customer selects service, picks an available slot for Dr. Meera Nambiar, provides skin intake notes, and grants scan sharing consent.",
      causeEffect:
        "Creates a pending appointment in Dr. Meera's Requests queue and notifies the doctor.",
    },
    {
      id: 2,
      title: "2. Consultant Accepts Booking",
      panel: "Consultant Portal (/consultant/appointments)",
      roleName: "Dr. Meera Nambiar (Consultant)",
      userId: "user-consultant",
      targetPath: "/consultant/appointments",
      isDone: step2Done,
      description:
        "Doctor reviews incoming request in Requests view, checks clinical conflicts, and accepts the booking.",
      causeEffect:
        "Transitions status to confirmed, creates video session room, and updates customer's /app/consultations view.",
    },
    {
      id: 3,
      title: "3. Customer Shares Diagnostic Scan Consent",
      panel: "Customer App (/app/privacy)",
      roleName: "Ritu Sharma (Customer)",
      userId: "user-customer",
      targetPath: "/app/privacy",
      isDone: step3Done,
      description:
        "Customer explicitly enables 'Share my diagnostic scans with my consultant' with revocable consent timestamp.",
      causeEffect:
        "Unlocks the client's 8-parameter radar chart and gauges inside the doctor's clinical file.",
    },
    {
      id: 4,
      title: "4. Consultant Reviews Scans & Records SOAP Note",
      panel: "Consultant Portal (/consultant/clients)",
      roleName: "Dr. Meera Nambiar (Consultant)",
      userId: "user-consultant",
      targetPath: "/consultant/clients?clientId=cust-1",
      isDone: step4Done,
      description:
        "Doctor views unlocked radar comparison, inspects Redness 88 and Hydration 72, and saves private SOAP clinical notes.",
      causeEffect:
        "Logs scan inspection in Security Audit and stores confidential practitioner record.",
    },
    {
      id: 5,
      title: "5. Consultant Publishes Treatment Plan",
      panel: "Consultant Portal (/consultant/plans)",
      roleName: "Dr. Meera Nambiar (Consultant)",
      userId: "user-consultant",
      targetPath: "/consultant/plans",
      isDone: step5Done,
      description:
        "Doctor builds AM/PM routine protocol, checks allergy conflicts, detects duplicate actives, and clicks Publish.",
      causeEffect:
        "Sends plan to customer portal with daily adherence checklist and 'Add All to Cart' shortcut.",
    },
    {
      id: 6,
      title: "6. Customer Adds Plan Products & Places Order",
      panel: "Customer App (/app/consultations)",
      roleName: "Ritu Sharma (Customer)",
      userId: "user-customer",
      targetPath: "/app/consultations",
      isDone: step6Done,
      description:
        "Customer reviews 'Plan from Dr. Meera Nambiar', ticks daily regimen checklist, and clicks 'Add All to Cart'.",
      causeEffect:
        "Adds products with optimal distributor offers to cart and generates order with payment authorization.",
    },
    {
      id: 7,
      title: "7. Seller Fulfills Prescribed Order",
      panel: "Distributor Portal (/seller/orders)",
      roleName: "Kabir Singhania (Distributor Owner)",
      userId: "user-seller-owner",
      targetPath: "/seller/orders",
      isDone: step7Done,
      description:
        "Warehouse seller verifies stock reservation, generates airway bill, and marks order as dispatched/fulfilled.",
      causeEffect:
        "Decrements warehouse inventory, notifies customer with tracking, and credits seller escrow balance.",
    },
    {
      id: 8,
      title: "8. Customer Rates Consultant",
      panel: "Customer App (/app/consultations)",
      roleName: "Ritu Sharma (Customer)",
      userId: "user-customer",
      targetPath: "/app/consultations",
      isDone: step8Done,
      description:
        "After telehealth session, customer submits a 5-star rating and written testimonial for Dr. Meera.",
      causeEffect:
        "Recalculates doctor average rating and updates public /experts directory profile card.",
    },
    {
      id: 9,
      title: "9. Admin Modifies Parameter Weights",
      panel: "Admin AI Engine (/admin/ai-engine/parameters)",
      roleName: "Dr. Sneha Iyer (AI/Rule Manager)",
      userId: "user-ai-manager",
      targetPath: "/admin/ai-engine/parameters",
      isDone: step9Done,
      description:
        "Admin adjusts parameter weight or toggles active status, publishes a new version, and checks audit log.",
      causeEffect:
        "Recalculates customer overall scan scores dynamically across the platform with zero data mismatch.",
    },
    {
      id: 10,
      title: "10. Finance Manager Approves Bank Settlement",
      panel: "Admin Finance (/admin/finance)",
      roleName: "Suresh Menon (Finance Manager)",
      userId: "user-finance",
      targetPath: "/admin/finance",
      isDone: step10Done,
      description:
        "Finance manager audits pending withdrawal queue, inputs bank UTR reference, and confirms NEFT payout.",
      causeEffect:
        "Disburses funds, writes immutable financial audit trail, and notifies seller/consultant of settlement.",
    },
  ];

  const completedCount = scenarios.filter((s) => s.isDone).length;

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C99A45]/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">
                Phase 7 Cross-Panel Architecture
              </Badge>
              <span className="text-xs text-[#A89A85]">
                {completedCount} of 10 Complete
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#F5EDE0]">
              End-to-End Cross-Panel Walkthrough
            </h1>
            <p className="text-xs text-[#A89A85] max-w-2xl leading-relaxed">
              Verify reactive multi-tenant data flow across all 5 user panels. Click &ldquo;Open as [Role]&rdquo; to authenticate into any panel in one click and complete the scenario.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemoData();
                showToast.success("Demo dataset reset to baseline state");
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#C99A45]" /> Reset Data
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/demo">Return to /demo</Link>
            </Button>
          </div>
        </div>

        {/* 10 Scenarios Checklist */}
        <div className="space-y-4">
          {scenarios.map((sc) => (
            <Card
              key={sc.id}
              className={`p-5 transition-all border ${
                sc.isDone
                  ? "bg-[#14100A] border-emerald-500/30"
                  : "bg-[#1A130B] border-[#C99A45]/20 hover:border-[#E8C77A]/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif text-base font-bold text-[#F5EDE0]">
                      {sc.title}
                    </span>
                    <Badge variant={sc.isDone ? "success" : "warning"} size="sm">
                      {sc.isDone ? "Completed in Store" : "Pending Action"}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {sc.panel}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#A89A85] leading-relaxed">
                    {sc.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/15 text-[11px] text-[#E8C77A]">
                    <strong>Cross-Panel Effect:</strong> {sc.causeEffect}
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <Button
                    size="sm"
                    variant={sc.isDone ? "outline" : "gold"}
                    className="text-xs whitespace-nowrap"
                    onClick={() => handleSwitchAndGo(sc.userId, sc.targetPath)}
                  >
                    Open as {sc.roleName.split(" ")[0]}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
