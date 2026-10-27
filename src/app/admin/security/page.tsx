"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Shield,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  FileText,
  User,
  Sliders,
  Lock,
  X,
} from "lucide-react";
import type { AuditLogEntry, PrivacyRequest, LoginAttempt } from "@/types";

type SecurityTab = "audit" | "privacy" | "logins" | "consents" | "settings";

export default function SecurityAuditGovernancePage() {
  const {
    auditLogs,
    privacyRequests,
    loginAttempts,
    customerProfile,
    fulfillPrivacyExport,
    processPrivacyDeletion,
  } = useAppStore();

  const { canEdit, isSuperAdmin } = useAdminPermission("security");

  const [activeTab, setActiveTab] = useState<SecurityTab>("audit");

  // Audit Logs Search & Filters
  const [auditQuery, setAuditQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");

  // Privacy Request Action Flash
  const [privacyMessage, setPrivacyMessage] = useState("");

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const resourceStr = (log as any).resource || "";
      if (resourceFilter !== "all" && resourceStr !== resourceFilter) return false;

      if (auditQuery.trim()) {
        const q = auditQuery.toLowerCase();
        const matchActor = (log.actor || log.userName || "").toLowerCase().includes(q);
        const matchAction = (log.action || "").toLowerCase().includes(q);
        const matchDetails = ((log as any).details || (log as any).metadata || "").toLowerCase().includes(q);
        if (!matchActor && !matchAction && !matchDetails) return false;
      }

      return true;
    });
  }, [auditLogs, resourceFilter, auditQuery]);

  // Handle Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = ["ID", "Timestamp", "Actor", "Action", "Resource", "Details"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actor || l.userName}"`,
      `"${l.action}"`,
      `"${(l as any).resource || "system"}"`,
      `"${(l as any).details || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Privacy Actions
  const handleFulfillExport = (reqId: string) => {
    const res = fulfillPrivacyExport(reqId);
    const blob = new Blob([res.jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customer_privacy_dossier_${reqId}.json`;
    link.click();
    setPrivacyMessage(`Generated and fulfilled legal DPDP export dossier for request ${reqId}.`);
    setTimeout(() => setPrivacyMessage(""), 5000);
  };

  const handleProcessDeletion = (reqId: string) => {
    if (confirm("CONFIRM DELETION: This action will permanently anonymize and purge the patient's diagnostic and biometric records in compliance with DPDP Right to Erasure.")) {
      processPrivacyDeletion(reqId);
      setPrivacyMessage(`Processed Right to Erasure anonymization for request ${reqId}.`);
      setTimeout(() => setPrivacyMessage(""), 5000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Security, DPDP Compliance & Audit Trail"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Security & Audit" }]}
      />

      {privacyMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{privacyMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur-md">
        {[
          { id: "audit", label: "Immutable Audit Logs", count: auditLogs.length },
          { id: "privacy", label: "DPDP Data Requests", count: privacyRequests.length },
          { id: "logins", label: "Login & Auth Security", count: loginAttempts.length },
          { id: "consents", label: "Patient Consent Registry", count: 1 },
          { id: "settings", label: "Security Policies" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SecurityTab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"
            }`}
          >
            {tab.label} {tab.count !== undefined ? `(${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Search actor, action type, or mutation details..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Resources</option>
                <option value="parameters">parameters</option>
                <option value="distributors">distributors</option>
                <option value="users">users</option>
                <option value="orders">orders</option>
                <option value="payouts">payouts</option>
                <option value="security">security</option>
              </select>

              <button
                onClick={handleExportAuditCsv}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-500/50 hover:text-white"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" /> Export Audit Trail
              </button>
            </div>
          </div>

          {/* Immutable Audit Table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4">Timestamp (UTC/IST)</th>
                    <th className="px-4 py-3.5">Governing Actor</th>
                    <th className="px-4 py-3.5">Mutation Action</th>
                    <th className="px-4 py-3.5">Resource Target</th>
                    <th className="px-4 py-3.5 pr-6">Audit Evidence & Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-zinc-900/40">
                      <td className="py-3.5 pl-6 pr-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white">
                          {log.actor || log.userName || "Super Admin"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-amber-400 font-bold">
                        {log.action}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300 uppercase">
                          {(log as any).resource || "SYSTEM"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 pr-6 text-zinc-300 leading-relaxed max-w-md">
                        {(log as any).details || (log as any).metadata || "Operational ledger event"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY & DATA REQUESTS TAB */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">DPDP 2023 Statutory Data Requests</h3>
              <p className="text-xs text-zinc-400">
                Patient requests for Right to Access (Export) and Right to Erasure (Purge).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {privacyRequests.map((req) => {
              const isPending = req.status === "pending";
              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{req.id}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            req.type === "deletion"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {req.type === "deletion" ? "Right to Erasure" : "Data Portability Export"}
                        </span>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 uppercase">
                          {req.status}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-white font-medium">
                        Patient: {req.customerName} ({req.customerEmail})
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Requested: {new Date(req.createdAt || req.requestedAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && req.type === "export" && (
                        <button
                          onClick={() => handleFulfillExport(req.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                        >
                          <Download className="h-3.5 w-3.5" /> Fulfil Export (JSON)
                        </button>
                      )}

                      {isPending && req.type === "deletion" && (
                        <button
                          onClick={() => handleProcessDeletion(req.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Process Deletion
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOGIN & AUTH SECURITY TAB */}
      {activeTab === "logins" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">Authentication Attempts & OTP Rate Limiting</h3>
              <p className="text-xs text-zinc-400">
                Real-time security telemetry monitoring brute-force attempts and session lockouts.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4">Timestamp</th>
                    <th className="px-4 py-3.5">Principal Identity</th>
                    <th className="px-4 py-3.5">Role Context</th>
                    <th className="px-4 py-3.5">IP Origin</th>
                    <th className="px-4 py-3.5 pr-6">Authentication Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {loginAttempts.map((attempt) => (
                    <tr key={attempt.id} className="transition hover:bg-zinc-900/40">
                      <td className="py-3.5 pl-6 pr-4 font-mono text-[11px] text-zinc-400">
                        {new Date(attempt.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-white">{attempt.emailOrPhone}</td>

                      <td className="px-4 py-3.5 font-mono text-zinc-300">{attempt.role}</td>

                      <td className="px-4 py-3.5 font-mono text-zinc-500">
                        {attempt.ipAddress || "103.21.244.12"}
                      </td>

                      <td className="px-4 py-3.5 pr-6">
                        {attempt.status === "success" && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" /> AUTHORIZED
                          </span>
                        )}
                        {(attempt.status === "failed" || attempt.status === "failed_otp") && (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                            <AlertTriangle className="h-3 w-3" /> FAILED OTP
                          </span>
                        )}
                        {attempt.status === "locked" && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                            <Lock className="h-3 w-3" /> ACCOUNT LOCKED (15 MIN)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONSENT REGISTRY TAB */}
      {activeTab === "consents" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white">Active Patient DPDP Consent Ledger</h3>
            <p className="text-xs text-zinc-400">
              Biometric facial scan and clinical regimen consent terms recorded during onboarding.
            </p>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Consent Document Version</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {customerProfile.consent?.termsVersion || "v2.1-DPDP-2026"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Timestamp</span>
                  <span className="font-mono text-zinc-300">
                    {customerProfile.consent?.timestamp || "2026-10-09T10:00:00.000Z"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Camera / Biometric Scan Consent</span>
                  <span className="text-emerald-400 font-bold">
                    {customerProfile.consent?.cameraBiometricsConsent ? "GRANTED" : "REVOKED"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Data Processing Authorization</span>
                  <span className="text-emerald-400 font-bold">
                    {customerProfile.consent?.dataProcessingConsent ? "GRANTED" : "REVOKED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-5">
          <h3 className="text-base font-semibold text-white">Platform Security Parameters</h3>
          <p className="text-xs text-zinc-400">
            Administrative timeout thresholds and cryptographic compliance constraints.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-zinc-400 font-medium block">Idle Session Timeout</span>
              <span className="font-mono text-lg font-bold text-white">30 Minutes</span>
              <p className="text-[11px] text-zinc-500">Automated lock for staff and admin roles</p>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-zinc-400 font-medium block">Max OTP Attempts Before Lock</span>
              <span className="font-mono text-lg font-bold text-amber-400">5 Attempts</span>
              <p className="text-[11px] text-zinc-500">Triggers 15-minute temporary lockout</p>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-zinc-400 font-medium block">PII Masking Requirement</span>
              <span className="font-mono text-lg font-bold text-emerald-400">Strict Audited</span>
              <p className="text-[11px] text-zinc-500">All staff reveals logged to immutable audit trail</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
