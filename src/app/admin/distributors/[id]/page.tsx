"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  ShieldCheck,
  FileCheck2,
  FileX2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  FileText,
  CreditCard,
  MapPin,
  ExternalLink,
  Info,
  Check,
  X,
  Send,
} from "lucide-react";
import type { DocumentCheck } from "@/types";

const DEFAULT_DOC_CHECKS: DocumentCheck[] = [
  {
    id: "doc-gst",
    docType: "gst_certificate",
    title: "GSTIN Registration Certificate (Form REG-06)",
    fileName: "gst_reg_06_verified.pdf",
    fileSize: "1.4 MB",
    fileUrl: "#",
    status: "verified",
    comment: "Verified against GSTN portal. Active state match.",
  },
  {
    id: "doc-pan",
    docType: "pan_card",
    title: "Corporate PAN Card Copy",
    fileName: "pan_corporate_entity.pdf",
    fileSize: "840 KB",
    fileUrl: "#",
    status: "verified",
    comment: "Entity name exactly matches certificate of incorporation.",
  },
  {
    id: "doc-drug",
    docType: "drug_license",
    title: "State Cosmetics & Cosmeceuticals Distribution Permit",
    fileName: "cosmetics_distribution_license_20b.pdf",
    fileSize: "2.1 MB",
    fileUrl: "#",
    status: "verified",
    comment: "Valid through 2028. Form 20B wholesale cosmetics clearance.",
  },
  {
    id: "doc-cheque",
    docType: "cancelled_cheque",
    title: "Cancelled Cheque / Bank Settlement Verification",
    fileName: "cancelled_cheque_hdfc.png",
    fileSize: "620 KB",
    fileUrl: "#",
    status: "pending",
  },
  {
    id: "doc-iso",
    docType: "iso_gmp",
    title: "Good Distribution Practices (GDP) / ISO Compliance",
    fileName: "iso_22716_gmp_cert.pdf",
    fileSize: "3.2 MB",
    fileUrl: "#",
    status: "verified",
  },
];

export default function DistributorKycAuditPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const {
    sellers,
    approveSellerKyc,
    rejectSellerKyc,
    requestSellerKycInfo,
  } = useAppStore();

  const { canApprove } = useAdminPermission("distributors");

  const seller = useMemo(() => {
    return sellers.find((s) => s.id === sellerId);
  }, [sellers, sellerId]);

  // Local checklist state for document audit
  const [checklist, setChecklist] = useState<DocumentCheck[]>(DEFAULT_DOC_CHECKS);

  // Reject / Request More Info modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);
  const [requestInfoNote, setRequestInfoNote] = useState("");

  // Success flash
  const [actionSuccess, setActionSuccess] = useState("");

  if (!seller) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Distributor KYC Audit"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Distributors", href: "/admin/distributors" },
            { label: "Audit" },
          ]}
        />
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center text-sm text-red-400">
          Distributor record '{sellerId}' not found in platform registry.
          <div className="mt-4">
            <Link
              href="/admin/distributors"
              className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              Return to Distributor Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const effectiveKyc = (seller as any).kycStatus || seller.status;

  // Toggle Document Status
  const handleDocStatusChange = (
    docId: string,
    status: "verified" | "rejected",
    comment?: string
  ) => {
    setChecklist((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status, comment: comment || doc.comment } : doc))
    );
  };

  // Actions
  const handleApprove = () => {
    if (!canApprove) return;
    approveSellerKyc(seller.id, checklist);
    setActionSuccess("Distributor KYC successfully approved. Store catalog is now live.");
    setTimeout(() => setActionSuccess(""), 5000);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    rejectSellerKyc(seller.id, rejectReason);
    setRejectModalOpen(false);
    setActionSuccess("Distributor application rejected. Notice sent to seller.");
    setTimeout(() => setActionSuccess(""), 5000);
  };

  const handleRequestInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInfoNote.trim()) return;

    requestSellerKycInfo(seller.id, requestInfoNote);
    setRequestInfoModalOpen(false);
    setActionSuccess("Information request sent to distributor owner.");
    setTimeout(() => setActionSuccess(""), 5000);
  };

  // GST & PAN validation check
  const isGstFormatValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    seller.gstNumber || ""
  );
  const isPanFormatValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(seller.panNumber || "");

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/distributors"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title={`KYC Compliance Audit: ${seller.company}`}
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Distributors", href: "/admin/distributors" },
            { label: seller.company },
          ]}
        />
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Audit Header Banner */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{seller.legalName}</h2>
              <span className="font-mono text-xs text-amber-400">{seller.id}</span>
            </div>
            <p className="text-xs text-zinc-400">
              Submitted for National Cosmeceutical Distributor Certification
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setRequestInfoModalOpen(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-white"
          >
            Request More Info
          </button>

          <button
            onClick={() => setRejectModalOpen(true)}
            className="rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30"
          >
            Reject Application
          </button>

          <button
            onClick={handleApprove}
            disabled={!canApprove || effectiveKyc === "approved"}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-40"
          >
            {effectiveKyc === "approved" ? "KYC Approved & Active" : "Approve & Go-Live"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Business Details & Format Verification (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Statutory Registration Dossier */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" /> Regulatory Identification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">GSTIN Number</span>
                  {isGstFormatValid ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> FORMAT VALID
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                      <AlertTriangle className="h-3 w-3" /> INVALID FORMAT
                    </span>
                  )}
                </div>
                <div className="mt-1 font-mono font-semibold text-white text-sm">
                  {seller.gstNumber}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Permanent Account Number (PAN)</span>
                  {isPanFormatValid ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> FORMAT VALID
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                      <AlertTriangle className="h-3 w-3" /> INVALID FORMAT
                    </span>
                  )}
                </div>
                <div className="mt-1 font-mono font-semibold text-white text-sm">
                  {seller.panNumber}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Settlement Bank Details</span>
                  <span className="text-[10px] text-zinc-500 font-mono">HDFC Bank Limited</span>
                </div>
                <div className="mt-1 font-mono text-zinc-300">
                  Account ending in: <span className="text-amber-400 font-bold">****8812</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-3">
                <span className="text-zinc-400 text-[11px] block">Operating Hub & Jurisdiction</span>
                <span className="mt-1 font-medium text-white block">
                  {seller.city}, {seller.state}
                </span>
                <span className="text-zinc-400 text-[11px] block mt-1">
                  Contact: {seller.contactEmail} | {seller.contactPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Audit Timeline */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Audit Timeline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-3">
                <div>
                  <span className="font-semibold text-white block">Application Submitted</span>
                  <span className="text-zinc-500 text-[11px]">
                    {seller.kycSubmittedAt || "10 Oct 2026, 11:30 AM"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-3">
                <div>
                  <span className="font-semibold text-white block">Statutory Format Check</span>
                  <span className="text-zinc-500 text-[11px]">
                    Automatic Regex Verification Passed
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-zinc-700 pl-3">
                <div>
                  <span className="font-semibold text-zinc-300 block">Dossier Auditor Review</span>
                  <span className="text-zinc-500 text-[11px]">
                    {effectiveKyc === "approved"
                      ? "Approved by Super Admin"
                      : "Awaiting final clearance"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Document Checklist (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Statutory Document Verification Checklist</h3>
                <p className="text-xs text-zinc-400">
                  Inspect uploaded licenses and mark each verified or rejected with auditor notes.
                </p>
              </div>
              <span className="font-mono text-xs text-amber-400">
                {checklist.filter((d) => d.status === "verified").length} / {checklist.length} Verified
              </span>
            </div>

            <div className="space-y-3.5">
              {checklist.map((doc) => {
                const isVerified = doc.status === "verified";
                const isRejected = doc.status === "rejected";

                return (
                  <div
                    key={doc.id}
                    className={`rounded-xl border p-4 transition ${
                      isVerified
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : isRejected
                        ? "border-red-500/30 bg-red-950/10"
                        : "border-zinc-800 bg-zinc-900/40"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                          <h4 className="text-xs font-semibold text-white">{doc.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                        {doc.comment && (
                          <p className="text-[11px] text-zinc-300 italic pt-1">
                            Auditor note: {doc.comment}
                          </p>
                        )}
                      </div>

                      {/* Verify / Reject Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleDocStatusChange(doc.id, "verified")}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            isVerified
                              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                              : "bg-zinc-800 text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300"
                          }`}
                        >
                          <Check className="h-3 w-3" /> Verified
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason for this document:");
                            if (reason) handleDocStatusChange(doc.id, "rejected", reason);
                          }}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            isRejected
                              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                              : "bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400"
                          }`}
                        >
                          <X className="h-3 w-3" /> Flag Issue
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Application Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reject Distributor Application</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Provide an official compliance reason. This will be transmitted directly to the distributor owner.
            </p>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Form 20B license expired; address mismatch with GST registration certificate..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-500 px-5 py-2 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {requestInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Request Additional Information</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Moves seller status to 'Under Review' and prompts distributor to provide updated files.
            </p>

            <form onSubmit={handleRequestInfo} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={requestInfoNote}
                onChange={(e) => setRequestInfoNote(e.target.value)}
                placeholder="e.g., Please upload a clearer copy of the cancelled cheque displaying printed account name..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRequestInfoModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
