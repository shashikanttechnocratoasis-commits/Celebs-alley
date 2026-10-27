"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  CreditCard,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LogOut,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { Seller } from "@/types";

export function KycStatusScreen({ seller }: { seller: Seller }) {
  const router = useRouter();
  const { sellerSimulateKycStatus, logout, saveSellerKycDraft } = useAppStore();

  const [showDemoShortcuts, setShowDemoShortcuts] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Submitted GST certificate trade name does not match corporate legal entity. The cancelled cheque copy provided was illegible."
  );

  const status = seller.status;

  const steps = [
    {
      id: "pending",
      title: "Registration Submitted",
      description: "Company details, licences, and bank credentials received.",
      timestamp: seller.kycSubmittedAt ? new Date(seller.kycSubmittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today, 10:30 AM",
      isDone: true,
      isActive: status === "pending",
    },
    {
      id: "under_review",
      title: "Compliance & Vetting",
      description: "Platform legal and drug regulatory officers verify GSTIN, PAN and drug licences.",
      timestamp: seller.kycReviewedAt && status !== "pending" ? new Date(seller.kycReviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Estimated 24-48 business hours",
      isDone: status === "under_review" || status === "approved" || status === "rejected",
      isActive: status === "under_review",
    },
    {
      id: status === "rejected" ? "rejected" : "approved",
      title: status === "rejected" ? "Application Rejected" : "Approved & Authorized",
      description:
        status === "rejected"
          ? seller.rejectionReason || "Verification failed due to documentation discrepancies."
          : "Merchant credentials validated. Ready to onboard and configure catalog.",
      timestamp: status === "rejected" || status === "approved" ? "Completed" : "Pending prior review",
      isDone: status === "approved" || status === "rejected",
      isActive: status === "approved" || status === "rejected",
    },
  ];

  const handleFixAndResubmit = () => {
    // Populate draft with seller data
    saveSellerKycDraft({
      companyName: seller.company,
      brandName: seller.company.split(" ")[0] || "Luxury Brands",
      businessType: "Distributor",
      address: `${seller.city}, ${seller.state}`,
      city: seller.city,
      state: seller.state,
      pincode: "400001",
      yearsInBusiness: 5,
      categories: ["skincare", "serums"],
      gstin: seller.gstNumber,
      pan: seller.panNumber,
      cosmeticsLicence: "COS-MH-2024-9912",
      accountHolder: seller.legalName || seller.company,
      accountNumber: "918273645192",
      confirmAccountNumber: "918273645192",
      ifsc: "HDFC0001234",
    });
    showToast.info("Pre-filled registration form with your saved data.");
    router.push("/seller/register?mode=resubmit");
  };

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col font-sans selection:bg-[#C99A45]/30">
      {/* Top Bar */}
      <header className="h-20 px-6 sm:px-10 border-b border-[#C99A45]/20 bg-[#1A130B]/90 backdrop-blur-md flex items-center justify-between">
        <Logo variant="with-tagline" size="md" />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/demo");
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch Account
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A130B] via-[#241A0F] to-[#1A130B] border border-[#C99A45]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C99A45]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-widest text-[#A89A85]">
                  Merchant Verification Protocol
                </span>
                <Badge
                  variant={
                    status === "approved"
                      ? "success"
                      : status === "rejected"
                      ? "danger"
                      : "gold"
                  }
                  size="md"
                >
                  {status === "approved"
                    ? "Verified & Approved"
                    : status === "rejected"
                    ? "Action Required / Rejected"
                    : status === "under_review"
                    ? "Under Active Review"
                    : "Pending Verification"}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#F5EDE0] font-bold">
                {seller.company}
              </h1>
              <p className="text-xs sm:text-sm text-[#A89A85] mt-1 font-mono">
                Ticket Ref: KYC-2026-{seller.id.replace("seller-", "00")} • GSTIN: {seller.gstNumber}
              </p>
            </div>

            {status === "rejected" && (
              <Button
                variant="primary"
                onClick={handleFixAndResubmit}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Fix & Resubmit KYC
              </Button>
            )}
          </div>
        </div>

        {/* Rejection Alert If Rejected */}
        {status === "rejected" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#D4604F]/10 border border-[#D4604F]/40 flex items-start gap-4"
          >
            <AlertTriangle className="w-6 h-6 text-[#D4604F] flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-sm text-[#D4604F]">
                Compliance Rejection Notice
              </h3>
              <p className="text-xs text-[#F5EDE0] leading-relaxed">
                {seller.rejectionReason ||
                  "Submitted GST certificate trade name does not match the corporate legal entity. The cancelled cheque copy provided was illegible."}
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFixAndResubmit}
                  className="border-[#D4604F]/40 text-[#D4604F] hover:bg-[#D4604F]/20"
                >
                  Edit Application & Upload New Documents
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Animated Stepper */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-8">
          <h2 className="text-lg font-serif font-semibold text-[#F5EDE0] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E8C77A]" />
            KYC Verification Timeline
          </h2>

          <div className="relative border-l-2 border-[#C99A45]/20 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            {steps.map((st, idx) => {
              const isCurrent = st.isActive;
              const isRejectedStep = st.id === "rejected";

              return (
                <div key={st.id} className="relative group">
                  {/* Stepper Node Icon */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform duration-300 ${
                      isRejectedStep
                        ? "bg-[#D4604F]/20 border-[#D4604F] text-[#D4604F]"
                        : st.isDone
                        ? "bg-[#5FAF7A]/20 border-[#5FAF7A] text-[#5FAF7A]"
                        : "bg-[#241A0F] border-[#C99A45]/30 text-[#A89A85]"
                    }`}
                  >
                    {isRejectedStep ? (
                      <XCircle className="w-4 h-4" />
                    ) : st.isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3
                        className={`text-sm font-semibold tracking-wide ${
                          isRejectedStep
                            ? "text-[#D4604F]"
                            : isCurrent
                            ? "text-[#E8C77A]"
                            : "text-[#F5EDE0]"
                        }`}
                      >
                        {st.title}
                      </h3>
                      <span className="text-xs text-[#A89A85] font-mono">
                        {st.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#A89A85] leading-relaxed max-w-xl">
                      {st.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#A89A85] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#E8C77A]" /> Legal Entity
            </span>
            <p className="text-xs font-semibold text-[#F5EDE0] truncate">
              {seller.legalName || seller.company}
            </p>
            <p className="text-[11px] text-[#A89A85]">{seller.city}, {seller.state}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#A89A85] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#E8C77A]" /> Tax Credentials
            </span>
            <p className="text-xs font-mono font-semibold text-[#F5EDE0]">
              GST: {seller.gstNumber}
            </p>
            <p className="text-[11px] font-mono text-[#A89A85]">PAN: {seller.panNumber}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/15 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#A89A85] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#E8C77A]" /> Settlement Account
            </span>
            <p className="text-xs font-semibold text-[#F5EDE0]">
              {seller.bankName || "HDFC Bank"} •••• {seller.bankLast4 || "9901"}
            </p>
            <p className="text-[11px] text-[#5FAF7A]">Account Name Verified</p>
          </div>
        </div>

        {/* DEMO TOOLS CARD (Hidden by default; governed by Super Admin Panel in Phase 6) */}
        <div className="rounded-3xl bg-[#241A0F]/60 border border-[#C99A45]/20 overflow-hidden shadow-xl">
          <button
            onClick={() => setShowDemoShortcuts(!showDemoShortcuts)}
            className="w-full p-4 flex items-center justify-between bg-[#1A130B]/70 hover:bg-[#1A130B] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#C99A45]/15 flex items-center justify-center text-[#E8C77A]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#E8C77A]">
                  Show Demo Shortcuts (Governed at /admin/distributors)
                </h4>
                <p className="text-[11px] text-[#A89A85]">
                  Verification is now live on the Super Admin panel. Toggle on to test local shortcuts.
                </p>
              </div>
            </div>
            {showDemoShortcuts ? (
              <ChevronUp className="w-4 h-4 text-[#A89A85]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#A89A85]" />
            )}
          </button>

          <AnimatePresence>
            {showDemoShortcuts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-5 border-t border-[#C99A45]/20 bg-[#0B0907]/60 space-y-3"
              >
                <p className="text-xs text-[#A89A85]">
                  Select an admin simulation action to transition this distributor&apos;s credentials:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={status === "under_review"}
                    onClick={() => {
                      sellerSimulateKycStatus(seller.id, "under_review");
                      showToast.info("Simulated: Application moved to 'Under Review'.");
                    }}
                    leftIcon={<Clock className="w-4 h-4 text-[#E8C77A]" />}
                  >
                    Simulate: Move to Under Review
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={status === "approved"}
                    onClick={() => {
                      sellerSimulateKycStatus(seller.id, "approved");
                      showToast.success("Simulated: Application Approved! Launching Onboarding Wizard.");
                    }}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Simulate: Approve KYC
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={status === "rejected"}
                    onClick={() => setRejectModalOpen(true)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Simulate: Reject (with reason)
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reject Modal */}
      <ResponsiveDialog
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        title="Simulate Admin Rejection"
        description="Provide a compliance rejection explanation to test the distributor fix-and-resubmit workflow."
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A89A85]">
              Rejection Reason & Auditor Note
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                sellerSimulateKycStatus(seller.id, "rejected", rejectionReason);
                setRejectModalOpen(false);
                showToast.error("Simulated: Application rejected.");
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
