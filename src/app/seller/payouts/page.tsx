"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/pricing";
import { usePermission } from "@/lib/rbac";
import { calculateSellerBalances, calculateShipmentEarning } from "@/lib/settlement";
import type { Settlement, PayoutRequest } from "@/types";
import plansData from "@/data/plans.json";

export default function SellerPayoutsPage() {
  const {
    currentUser,
    currentRole,
    sellers,
    orders,
    settlements,
    payoutRequests,
    createPayoutRequest,
    platformSettings,
  } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";
  const plan = plansData.find((p) => p.id === (currentSeller?.planId || "plan-starter")) || plansData[1];
  
  // Dynamic runtime commission from platform governance settings
  const planNameNormalized = (currentSeller?.plan || plan?.name || "Starter").toLowerCase();
  const matchedPlanKey = Object.keys(platformSettings?.commissionPlans || {}).find(
    (k) => k.toLowerCase() === planNameNormalized
  );
  const runtimePlanCommission = matchedPlanKey
    ? platformSettings?.commissionPlans[matchedPlanKey]
    : undefined;

  const commissionRate =
    platformSettings?.sellerCommissionOverrides?.[sellerId] ??
    runtimePlanCommission ??
    plan?.limits?.commissionRate ??
    10;

  // RBAC checks
  const canViewPayouts = usePermission("payouts", "view");
  const canCreatePayouts = usePermission("payouts", "create");

  // State
  const [requestPayoutOpen, setRequestPayoutOpen] = useState(false);
  const [payoutAmountPaise, setPayoutAmountPaise] = useState<number>(5000000); // Default ₹50,000 (5M paise)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [activeTab, setActiveTab] = useState<"settlements" | "requests" | "breakdown">("settlements");

  // Filter settlements and requests for this seller
  const tenantSettlements = useMemo(
    () => settlements.filter((s) => s.sellerId === sellerId),
    [settlements, sellerId]
  );
  const tenantPayoutRequests = useMemo(
    () => payoutRequests.filter((p) => p.sellerId === sellerId),
    [payoutRequests, sellerId]
  );

  // Compute live balances using pure integer-paise settlement helper
  const totalPaidOutPaise = useMemo(
    () => tenantSettlements.reduce((acc, s) => acc + s.netPayout, 0),
    [tenantSettlements]
  );

  const balances = useMemo(() => {
    return calculateSellerBalances(sellerId, orders, commissionRate, totalPaidOutPaise);
  }, [sellerId, orders, commissionRate, totalPaidOutPaise]);

  // Breakdown of recent delivered shipments
  const shipmentBreakdowns = useMemo(() => {
    const list: any[] = [];
    orders.forEach((ord) => {
      ord.shipments?.forEach((sh) => {
        if (sh.sellerId === sellerId && sh.status === "delivered") {
          list.push(calculateShipmentEarning(sh, ord, commissionRate));
        }
      });
    });
    return list;
  }, [orders, sellerId, commissionRate]);

  // Submit payout request
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreatePayouts) {
      showToast.error("Your role cannot request payouts.");
      return;
    }
    const bankName = currentSeller?.bankDetails?.bankName || "HDFC Bank Ltd";
    const last4 = currentSeller?.bankDetails?.accountNumberLast4 || "8821";

    const res = createPayoutRequest(sellerId, payoutAmountPaise, last4, bankName);
    if (res.success) {
      showToast.success(res.message);
      setRequestPayoutOpen(false);
    } else {
      showToast.error(res.message);
    }
  };

  // Demo advancement for payout request status
  const handleAdvancePayoutRequest = (reqId: string, nextStatus: "processing" | "paid") => {
    // Modify through store state
    useAppStore.setState((state) => ({
      payoutRequests: state.payoutRequests.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: nextStatus,
              utrNumber: nextStatus === "paid" ? `HDFC000${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
              paidAt: nextStatus === "paid" ? new Date().toISOString() : undefined,
            }
          : r
      ),
    }));
    showToast.info(`Payout request advanced to "${nextStatus.toUpperCase()}".`);
  };

  if (!canViewPayouts) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view bank payouts or financial ledgers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Bank Payouts & Settlement Ledgers"
          description={`Automated 7-day return escrow disbursement engine for ${currentSeller?.company}. All monetary computations run in integer paise.`}
          breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Payouts" }]}
        />

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="gold"
            disabled={!canCreatePayouts || balances.availablePaise < 50000}
            onClick={() => {
              setPayoutAmountPaise(Math.min(balances.availablePaise, 10000000));
              setRequestPayoutOpen(true);
            }}
          >
            <DollarSign className="w-3.5 h-3.5 mr-1" /> Request Payout
          </Button>
        </div>
      </div>

      {/* 4 Balance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 bg-gradient-to-br from-obsidian-900 to-obsidian-950 border border-gold-500/40 rounded-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gold-400 uppercase tracking-widest font-bold">
              Available For Withdrawal
            </span>
            <Badge variant="gold" size="sm">
              Ready
            </Badge>
          </div>
          <p className="text-2xl font-bold font-mono text-gold-300">
            {formatINR(Math.round(balances.availablePaise / 100))}
          </p>
          <p className="text-[11px] text-cream-400">
            Cleared 7-day post-delivery customer return window.
          </p>
        </div>

        {/* Pending Escrow Hold */}
        <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-400 uppercase tracking-wider font-semibold">
              Pending in Escrow Hold
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300">
            {formatINR(Math.round(balances.pendingHoldPaise / 100))}
          </p>
          <p className="text-[11px] text-cream-500">
            Delivered orders currently within 7-day return escrow.
          </p>
        </div>

        {/* Paid Out */}
        <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-400 uppercase tracking-wider font-semibold">
              Disbursed to Date
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cream-100">
            {formatINR(Math.round(balances.paidOutPaise / 100))}
          </p>
          <p className="text-[11px] text-cream-500">
            Successfully wired via NEFT/RTGS to bank account.
          </p>
        </div>

        {/* Platform Commission Paid */}
        <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-400 uppercase tracking-wider font-semibold">
              Platform Fees Paid ({commissionRate}%)
            </span>
            <Building2 className="w-3.5 h-3.5 text-cream-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cream-300">
            {formatINR(Math.round(balances.commissionPaidPaise / 100))}
          </p>
          <p className="text-[11px] text-cream-500">
            Celebs Alley tier commission + 2% online gateway fees.
          </p>
        </div>
      </div>

      {/* Bank Account Verification Notice */}
      <div className="p-4 bg-obsidian-950 border border-obsidian-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-cream-100">
              Verified Settlement Bank Account
            </p>
            <p className="text-cream-400 font-mono">
              {currentSeller?.bankDetails?.bankName || "HDFC Bank"} ••••••••{currentSeller?.bankDetails?.accountNumberLast4 || "8821"} (IFSC: {currentSeller?.bankDetails?.ifsc || "HDFC0001234"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3 h-3 mr-1" /> Penny-Drop Verified
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-obsidian-800 pb-2">
        <button
          onClick={() => setActiveTab("settlements")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "settlements"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Weekly Settlement Cycles ({tenantSettlements.length})
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "requests"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Payout Requests ({tenantPayoutRequests.length})
        </button>

        <button
          onClick={() => setActiveTab("breakdown")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "breakdown"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Shipment Earning Math Audit
        </button>
      </div>

      {/* TAB 1: WEEKLY SETTLEMENT CYCLES */}
      {activeTab === "settlements" && (
        <div className="space-y-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-obsidian-950 text-cream-400 text-[10px] uppercase border-b border-obsidian-800">
                  <tr>
                    <th className="p-3.5">Cycle ID & Window</th>
                    <th className="p-3.5 text-center">Orders</th>
                    <th className="p-3.5 text-right">Gross Total</th>
                    <th className="p-3.5 text-right">Commission ({commissionRate}%)</th>
                    <th className="p-3.5 text-right">Gateway + TCS/TDS</th>
                    <th className="p-3.5 text-right">Net Payout</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Statement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800 text-cream-200">
                  {tenantSettlements.map((stl) => (
                    <tr key={stl.id} className="hover:bg-obsidian-850/50">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-cream-100">{stl.id}</span>
                        <span className="text-[11px] text-cream-500 block">
                          {new Date(stl.cycleStart).toLocaleDateString()} - {new Date(stl.cycleEnd).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold">
                        {stl.orderIds.length}
                      </td>

                      <td className="p-3.5 text-right font-mono text-cream-200">
                        {formatINR(Math.round(stl.grossAmount / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono text-rose-300">
                        -{formatINR(Math.round(stl.commissionAmount / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono text-cream-400">
                        -{formatINR(Math.round((stl.gatewayFee + stl.tcsTdsAmount) / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-gold-300">
                        {formatINR(Math.round(stl.netPayout / 100))}
                      </td>

                      <td className="p-3.5">
                        <Badge variant="success" size="sm">
                          {stl.status.toUpperCase()}
                        </Badge>
                        {stl.utrNumber && (
                          <span className="text-[10px] text-cream-500 font-mono block mt-0.5">
                            UTR: {stl.utrNumber.slice(-8)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedSettlement(stl)}
                        >
                          <Printer className="w-3 h-3 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYOUT REQUESTS & DEMO ADVANCEMENT */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-obsidian-950 text-cream-400 text-[10px] uppercase border-b border-obsidian-800">
                  <tr>
                    <th className="p-3.5">Request Reference</th>
                    <th className="p-3.5">Destination Bank</th>
                    <th className="p-3.5 text-right">Amount (INR)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5 text-right">Settlement Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800 text-cream-200">
                  {tenantPayoutRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-cream-500 text-xs">
                        No payout requests created yet. Use &quot;Request Payout&quot; above to initiate a disbursement.
                      </td>
                    </tr>
                  ) : (
                    tenantPayoutRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-obsidian-850/50">
                        <td className="p-3.5 font-mono font-bold text-cream-100">
                          {req.id}
                        </td>
                        <td className="p-3.5">
                          <span className="text-cream-200">{req.bankName}</span>
                          <span className="text-[10px] text-cream-500 font-mono block">
                            A/C ending ••••{req.bankLast4 || req.bankAccountLast4}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-gold-300">
                          {formatINR(Math.round((req.amountPaise || req.amount) / 100))}
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              req.status === "paid"
                                ? "success"
                                : req.status === "processing"
                                ? "warning"
                                : "outline"
                            }
                            size="sm"
                          >
                            {req.status.toUpperCase()}
                          </Badge>
                          {(req.utrNumber || req.referenceNumber) && (
                            <span className="text-[10px] text-cream-500 font-mono block mt-0.5">
                              UTR: {req.utrNumber || req.referenceNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[11px] text-cream-400 font-mono">
                          {new Date(req.createdAt || req.requestedAt).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-[11px]">
                            {req.status === "requested" && (
                              <span className="text-amber-400 font-medium">
                                In Super Admin Escrow Queue
                              </span>
                            )}
                            {req.status === "processing" && (
                              <span className="text-blue-300 font-medium">
                                Banking Wire In Progress
                              </span>
                            )}
                            {req.status === "paid" && (
                              <span className="text-emerald-400 font-medium">
                                Disbursed & Settled
                              </span>
                            )}
                            {req.status === "rejected" && (
                              <span className="text-red-400 font-medium">
                                Compliance Hold: {req.rejectionReason || "Verification failed"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SHIPMENT EARNING BREAKDOWN (PAISE PRECISION AUDIT) */}
      {activeTab === "breakdown" && (
        <div className="space-y-4">
          <div className="p-4 bg-obsidian-950 border border-obsidian-800 rounded-xl text-xs space-y-2">
            <h4 className="font-semibold text-cream-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              Settlement Formula & Integer-Paise Deductions Audit
            </h4>
            <p className="text-cream-400 leading-relaxed font-mono text-[11px]">
              Seller Earning = Item Total (excl GST) - Platform Commission ({commissionRate}%) - Gateway Fee (2% prepaid, 0% COD) - TCS (1%) - TDS (1%).
            </p>
          </div>

          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-obsidian-950 text-cream-400 text-[10px] uppercase border-b border-obsidian-800">
                  <tr>
                    <th className="p-3.5">Order / Shipment</th>
                    <th className="p-3.5">Delivered</th>
                    <th className="p-3.5 text-right">Items (excl GST)</th>
                    <th className="p-3.5 text-right">Commission</th>
                    <th className="p-3.5 text-right">Gateway</th>
                    <th className="p-3.5 text-right">TCS + TDS</th>
                    <th className="p-3.5 text-right">Net Earning</th>
                    <th className="p-3.5">Return Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800 text-cream-200">
                  {shipmentBreakdowns.map((b, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/50">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-cream-100">#{b.orderNumber}</span>
                        <span className="text-[10px] text-cream-500 font-mono block">{b.shipmentId}</span>
                      </td>

                      <td className="p-3.5 text-[11px] text-cream-400 font-mono">
                        {new Date(b.deliveredAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right font-mono text-cream-200">
                        {formatINR(Math.round(b.itemTotalPaise / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono text-rose-300">
                        -{formatINR(Math.round(b.commissionPaise / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono text-cream-400">
                        -{formatINR(Math.round(b.gatewayFeePaise / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono text-cream-400">
                        -{formatINR(Math.round((b.tcsPaise + b.tdsPaise) / 100))}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-gold-300">
                        {formatINR(Math.round(b.netEarningPaise / 100))}
                      </td>

                      <td className="p-3.5">
                        {b.isEligibleForPayout ? (
                          <Badge variant="success" size="sm">
                            Cleared For Payout
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-medium">
                            Hold ({b.daysRemainingInReturnWindow}d left)
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

      {/* MODAL: Request Payout */}
      {requestPayoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Request Bank Payout Withdrawal
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Disburse available cleared funds directly to your verified bank account.
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Withdrawal Amount (Min ₹500 / Max {formatINR(Math.round(balances.availablePaise / 100))})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400 font-mono text-xs">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min={500}
                    max={Math.round(balances.availablePaise / 100)}
                    value={Math.round(payoutAmountPaise / 100)}
                    onChange={(e) => setPayoutAmountPaise(Math.round(Number(e.target.value) * 100))}
                    className="pl-8 h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-cream-400">
                  <span>Destination:</span>
                  <span className="font-semibold text-cream-200">
                    {currentSeller?.bankDetails?.bankName || "HDFC Bank"} ••••{currentSeller?.bankDetails?.accountNumberLast4 || "8821"}
                  </span>
                </div>
                <div className="flex justify-between text-cream-400">
                  <span>Processing SLA:</span>
                  <span className="text-emerald-400 font-medium">NEFT within 24 Hours</span>
                </div>
                <div className="flex justify-between text-cream-400">
                  <span>Transfer Fee:</span>
                  <span className="text-cream-200 font-mono">₹0 (Included in Tier)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-obsidian-800">
                <Button size="sm" variant="outline" type="button" onClick={() => setRequestPayoutOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="gold" type="submit">
                  Confirm Withdrawal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VIEW: Settlement Statement */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="bg-white text-slate-900 max-w-2xl w-full rounded-lg shadow-2xl p-8 space-y-6 relative print:p-0">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 print:hidden">
              <span className="text-sm font-bold">Settlement Disbursement Statement</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium"
                >
                  Print Statement
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSettlement(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-bold">WEEKLY SETTLEMENT VOUCHER</h1>
                  <p className="font-mono text-slate-600">Cycle: {selectedSettlement.id}</p>
                  <p className="text-slate-500">
                    Window: {new Date(selectedSettlement.cycleStart).toLocaleDateString()} to {new Date(selectedSettlement.cycleEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{currentSeller?.company}</p>
                  <p className="text-slate-500">GSTIN: {currentSeller?.gstin || "27AAACB1234F1Z5"}</p>
                  <p className="text-slate-500">Bank: {currentSeller?.bankDetails?.bankName} (••••{currentSeller?.bankDetails?.accountNumberLast4 || "8821"})</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>Gross Orders Merchandise Value:</span>
                  <span className="font-mono font-bold">₹{(selectedSettlement.grossAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Commission ({commissionRate}%):</span>
                  <span className="font-mono text-rose-600">-₹{(selectedSettlement.commissionAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Gateway Processing (2% online):</span>
                  <span className="font-mono text-rose-600">-₹{(selectedSettlement.gatewayFee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Statutory Withholding (1% TCS + 1% TDS):</span>
                  <span className="font-mono text-rose-600">-₹{(selectedSettlement.tcsTdsAmount / 100).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Net Disbursed Amount:</span>
                  <span className="font-mono">₹{(selectedSettlement.netPayout / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500">
                <p>Disbursement Ref / UTR: {selectedSettlement.utrNumber || "NEFT-IN-PROGRESS"}</p>
                <p>Celebs Alley Automated Escrow Engine (Rule 46 CGST / Section 194-O Income Tax Act).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
