"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { SensitiveActionModal } from "@/components/admin/SensitiveActionModal";
import {
  Percent,
  Sliders,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  FileCheck2,
  CreditCard,
  X,
  AlertTriangle,
} from "lucide-react";
import type { PayoutRequest } from "@/types";

export default function CommissionsFinancialSettlementsPage() {
  const {
    platformSettings,
    sellers,
    orders,
    payoutRequests,
    updatePlatformSettings,
    approvePayoutRequest,
    rejectPayoutRequest,
  } = useAppStore();

  const currentRole = useAppStore((state) => state.currentRole);
  const canView = useAdminPermission("commissions", "view");
  const canEdit = useAdminPermission("commissions", "edit");
  const canApprove = useAdminPermission("commissions", "approve");
  const isSuperAdmin = currentRole === "Super Admin";

  // Local settings
  const [localSettings, setLocalSettings] = useState(platformSettings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Payout Approval Modal with UTR
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Sensitive Action Modal for Plan Commission Rates
  const [confirmRateOpen, setConfirmRateOpen] = useState(false);

  // Save Commission Settings
  const handleSaveSettings = () => {
    updatePlatformSettings(localSettings);
    setIsSettingsSaved(true);
    setConfirmRateOpen(false);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Execute Payout Approval
  const handleExecuteApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !utrNumber.trim()) return;

    approvePayoutRequest(selectedPayout.id, utrNumber.trim());
    setSelectedPayout(null);
    setUtrNumber("");
  };

  // Execute Payout Rejection
  const handleExecuteRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !rejectReason.trim()) return;

    rejectPayoutRequest(selectedPayout.id, rejectReason.trim());
    setIsRejectOpen(false);
    setSelectedPayout(null);
    setRejectReason("");
  };

  // Commission Earnings by Seller & Total
  const commissionReport = useMemo(() => {
    const list = sellers.map((seller) => {
      const sellerOrders = orders.filter(
        (o) =>
          o.status === "delivered" &&
          o.shipments?.some((sh) => sh.sellerId === seller.id)
      );

      const grossPaise = sellerOrders.reduce((sum, o) => {
        const sh = o.shipments?.find((s) => s.sellerId === seller.id);
        return sum + (sh ? (sh.totalAmountPaise ?? sh.total ?? 0) : (o.totalAmountPaise ?? o.total ?? 0));
      }, 0);

      const effectiveRate =
        platformSettings.sellerCommissionOverrides[seller.id] ??
        platformSettings.commissionPlans[seller.planId?.replace("plan-", "") || "starter"] ??
        10;

      const commissionEarnedPaise = Math.round(grossPaise * (effectiveRate / 100));

      return {
        sellerId: seller.id,
        company: seller.company,
        plan: seller.planId?.replace("plan-", "") || "starter",
        effectiveRate,
        grossPaise,
        commissionEarnedPaise,
        ordersCount: sellerOrders.length,
      };
    });

    const totalEarnedPaise = list.reduce((sum, i) => sum + i.commissionEarnedPaise, 0);

    return { list, totalEarnedPaise };
  }, [sellers, orders, platformSettings]);

  if (!canView) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted (403 Forbidden)</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          Your active role (<strong className="text-amber-400">{currentRole}</strong>) does not have authorization to view or manage financial commissions, revenue balances, and seller disbursement settlements.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
          >
            Return to Dashboard
          </a>
          <a
            href="/admin/ai-engine/parameters"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
          >
            Go to AI Engine
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Commission Rates & Payout Approval Queue"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/commerce/orders" },
          { label: "Commissions & Payouts" },
        ]}
      />

      {/* Rake Commission Settings Matrix */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Platform Commission Rake Tiers</h2>
              <p className="text-xs text-zinc-400">
                Plan-level marketplace rake rates applied during real-time order ledger settlement.
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfirmRateOpen(true)}
            disabled={!canEdit}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isSettingsSaved ? <CheckCircle2 className="h-4 w-4" /> : null}
            {isSettingsSaved ? "Settings Committed" : "Update Rates (Confirm)"}
          </button>
        </div>

        {/* Plan Sliders */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "free", label: "Free / Community Tier", default: 12 },
            { key: "starter", label: "Starter Plan", default: 10 },
            { key: "business", label: "Business Plan", default: 8 },
            { key: "enterprise", label: "Enterprise Empire", default: 6 },
          ].map((plan) => {
            const currentVal = localSettings.commissionPlans[plan.key] ?? plan.default;
            return (
              <div key={plan.key} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-white">{plan.label}</span>
                  <span className="font-mono text-amber-400 font-bold">{currentVal}%</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={25}
                  value={currentVal}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      commissionPlans: {
                        ...localSettings.commissionPlans,
                        [plan.key]: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-3 w-full accent-amber-500"
                />
              </div>
            );
          })}
        </div>

        {/* Telemedicine Consultant Commission Slider */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-xs">Telemedicine Consultant Platform Fee</span>
              <span className="font-mono text-amber-400 font-bold text-xs">{localSettings.consultantCommissionPercent ?? 15}%</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Platform rake retained from completed doctor consultations. Doctor net take-home is {100 - (localSettings.consultantCommissionPercent ?? 15)}%.
            </p>
          </div>
          <div className="w-full sm:w-64 flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={30}
              value={localSettings.consultantCommissionPercent ?? 15}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  consultantCommissionPercent: Number(e.target.value),
                })
              }
              className="w-full accent-amber-500"
            />
            <span className="font-mono text-xs text-white font-bold w-10 text-right">
              {localSettings.consultantCommissionPercent ?? 15}%
            </span>
          </div>
        </div>

        {/* Financial Constants */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-850 pt-4 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-3 border border-zinc-800">
            <span className="text-zinc-400">Payment Gateway Fee:</span>
            <span className="font-mono text-amber-400 font-bold">
              {localSettings.paymentGatewayFeePercent}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-3 border border-zinc-800">
            <span className="text-zinc-400">Customer Return Window:</span>
            <span className="font-mono text-white font-bold">{localSettings.returnWindowDays} Days</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-3 border border-zinc-800">
            <span className="text-zinc-400">Free Shipping Threshold:</span>
            <span className="font-mono text-white font-bold">
              ₹{(localSettings.freeShippingThresholdPaise / 100).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Payout Approval Queue Widget */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Distributor Payout Approval Queue</h3>
          </div>
          <span className="font-mono text-xs text-amber-400">
            {payoutRequests.filter((p) => p.status === "requested" || p.status === "processing").length} Pending Dispatches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3 pl-4 pr-3">Payout ID</th>
                <th className="px-3 py-3">Distributor Hub</th>
                <th className="px-3 py-3">Settlement Amount</th>
                <th className="px-3 py-3">Bank Details</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {payoutRequests.map((req) => {
                const seller = sellers.find((s) => s.id === req.sellerId);
                const isPending = req.status === "requested" || req.status === "processing";
                const amountPaise = req.amount || req.amountPaise || 0;

                return (
                  <tr key={req.id} className="transition hover:bg-zinc-900/40">
                    <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-white">
                      {req.id}
                      <span className="text-[10px] text-zinc-500 block font-normal">
                        {new Date(req.requestedAt || req.createdAt || "").toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 font-medium text-white">
                      {seller?.company || req.sellerId}
                    </td>

                    <td className="px-3 py-3.5 font-mono font-bold text-emerald-400">
                      ₹{(amountPaise / 100).toLocaleString("en-IN")}
                    </td>

                    <td className="px-3 py-3.5 font-mono text-zinc-300">
                      {req.bankName} (..{req.bankAccountLast4 || req.bankLast4 || "8812"})
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          req.status === "paid"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : req.status === "rejected"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.utrNumber && (
                        <span className="font-mono text-[10px] text-zinc-500 block mt-0.5">
                          UTR: {req.utrNumber}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3.5 text-right pr-4">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayout(req);
                              setIsRejectOpen(true);
                            }}
                            disabled={!canApprove}
                            className="rounded-lg border border-red-500/30 bg-red-950/20 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setSelectedPayout(req)}
                            disabled={!canApprove}
                            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
                          >
                            Approve (UTR)
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px] italic">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {payoutRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-zinc-500">
                    No distributor payout withdrawal requests in escrow queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Earnings Report */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-base font-semibold text-white">Platform Commission Ledger Report</h3>
            <p className="text-xs text-zinc-400">
              Aggregated rake revenue collected by seller hub based on delivered order volume.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-500 block">Total Platform Rake Earned</span>
            <span className="font-mono text-lg font-bold text-amber-400">
              ₹{(commissionReport.totalEarnedPaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3 pl-4 pr-3">Enterprise Seller</th>
                <th className="px-3 py-3">SaaS Plan</th>
                <th className="px-3 py-3">Effective Rake</th>
                <th className="px-3 py-3">Delivered GMV</th>
                <th className="px-3 py-3 text-right pr-4">Net Platform Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {commissionReport.list.map((item) => (
                <tr key={item.sellerId} className="transition hover:bg-zinc-900/40">
                  <td className="py-3.5 pl-4 pr-3 font-semibold text-white">
                    {item.company}
                    <span className="text-[10px] text-zinc-500 block font-mono">{item.sellerId}</span>
                  </td>

                  <td className="px-3 py-3.5 uppercase font-mono text-zinc-300">{item.plan}</td>

                  <td className="px-3 py-3.5 font-mono text-amber-400 font-bold">
                    {item.effectiveRate}%
                  </td>

                  <td className="px-3 py-3.5 font-mono text-zinc-300">
                    ₹{(item.grossPaise / 100).toLocaleString("en-IN")}
                  </td>

                  <td className="px-3 py-3.5 text-right pr-4 font-mono font-bold text-emerald-400">
                    ₹{(item.commissionEarnedPaise / 100).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Payout Modal with UTR entry */}
      {selectedPayout && !isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Execute Bank Payout Transfer</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Enter official banking Unique Transaction Reference (UTR) to mark payout as completed.
            </p>

            <form onSubmit={handleExecuteApproval} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Settlement Amount</label>
                <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
                  ₹{(((selectedPayout.amount || selectedPayout.amountPaise || 0) / 100)).toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Bank UTR / NEFT Reference Number</label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., HDFCN26102788912"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-amber-400 uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-black hover:bg-emerald-400"
                >
                  Confirm Bank Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payout Modal */}
      {isRejectOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reject Payout Request</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Provide banking compliance reason for withholding distributor withdrawal.
            </p>

            <form onSubmit={handleExecuteRejection} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Bank IFSC mismatch; ongoing customer dispute holds..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectOpen(false);
                    setSelectedPayout(null);
                  }}
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

      {/* Sensitive Confirmation for Plan Commission Changes */}
      <SensitiveActionModal
        open={confirmRateOpen}
        onClose={() => setConfirmRateOpen(false)}
        onConfirm={handleSaveSettings}
        title="Modify Platform Commission Structure"
        description="Changing base plan rake percentages will directly recalibrate distributor payout splits and escrow ledger settlement formulas across all future sales transactions."
        confirmLabel="Apply New Commission Matrix"
        requireTypeConfirm={isSuperAdmin}
        expectedKeyword="CONFIRM"
      />
    </div>
  );
}
