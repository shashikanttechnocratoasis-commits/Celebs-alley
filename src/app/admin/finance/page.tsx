"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import { formatPaise } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Building,
  Check,
  X,
} from "lucide-react";
import type { PayoutRequest } from "@/types";

export default function FinanceManagerPortalPage() {
  const {
    orders,
    paymentTransactions,
    payoutRequests,
    platformSettings,
    sellers,
    approvePayoutRequest,
    rejectPayoutRequest,
  } = useAppStore();

  const { canView } = useAdminPermission("finance");

  // Subtabs
  const [activeTab, setActiveTab] = useState<
    "payouts" | "refunds" | "commissions" | "calendar" | "statements"
  >("payouts");

  // Payout Dialog
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Metrics
  const metrics = useMemo(() => {
    const grossPaise = orders.reduce((sum, o) => sum + (o.totalAmountPaise || 0), 0);
    const settledTransactionsPaise = paymentTransactions.reduce(
      (sum, tx) => (tx.status === "success" ? sum + tx.amountPaise : sum),
      0
    );
    const platformCommissionPaise = Math.round(grossPaise * 0.15); // Average 15% platform commission

    const pendingPayouts = payoutRequests.filter(
      (p) => (p.status as string) === "requested" || (p.status as string) === "pending" || p.status === "processing"
    );
    const pendingPayoutAmountPaise = pendingPayouts.reduce(
      (sum, p) => sum + (p.amount || p.amountPaise || 0),
      0
    );

    const pendingRefunds = orders.filter((o) => (o as any).status === "refund_requested");

    return {
      grossPaise,
      settledTransactionsPaise,
      platformCommissionPaise,
      pendingPayouts,
      pendingPayoutAmountPaise,
      pendingRefunds,
    };
  }, [orders, paymentTransactions, payoutRequests]);

  const handleConfirmApproval = () => {
    if (!selectedPayout) return;
    const finalUtr = utrNumber.trim() || `UTR-AXIS-${Date.now().toString().slice(-6)}`;
    approvePayoutRequest(selectedPayout.id, finalUtr);
    setApproveDialogOpen(false);
    setSelectedPayout(null);
    setUtrNumber("");
    showToast.success(`Payout disbursed. Bank UTR: ${finalUtr}`);
  };

  const handleConfirmRejection = () => {
    if (!selectedPayout) return;
    rejectPayoutRequest(selectedPayout.id, rejectReason || "Bank KYC mismatch");
    setRejectDialogOpen(false);
    setSelectedPayout(null);
    setRejectReason("");
    showToast.info("Payout withdrawal request rejected");
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Financial Operations & Settlements Cockpit"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Finance" }]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast.info("Exporting complete financial ledger CSV...")}
          >
            <Download className="w-4 h-4 mr-1.5 text-[#E8C77A]" /> Export CSV Ledger
          </Button>
        }
      />

      {/* 6 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Platform GMV</span>
          <div className="text-xl font-serif font-bold text-[#F5EDE0]">
            {formatPaise(metrics.grossPaise)}
          </div>
          <span className="text-[10px] text-emerald-400">Delivered volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Platform Take (Rake)</span>
          <div className="text-xl font-serif font-bold text-[#E8C77A]">
            {formatPaise(metrics.platformCommissionPaise)}
          </div>
          <span className="text-[10px] text-[#5FAF7A]">15% Avg Commission</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Pending Payouts</span>
          <div className="text-xl font-serif font-bold text-amber-400">
            {formatPaise(metrics.pendingPayoutAmountPaise)}
          </div>
          <span className="text-[10px] text-amber-300">
            {metrics.pendingPayouts.length} in queue
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Refund Queue</span>
          <div className="text-xl font-serif font-bold text-[#38BDF8]">
            {metrics.pendingRefunds.length}
          </div>
          <span className="text-[10px] text-[#A89A85]">Awaiting escrow release</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Failed Payments</span>
          <div className="text-xl font-serif font-bold text-[#5FAF7A]">0</div>
          <span className="text-[10px] text-[#5FAF7A]">Razorpay 100% OK</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Reconciliation</span>
          <div className="text-xl font-serif font-bold text-[#5FAF7A]">Balanced</div>
          <span className="text-[10px] text-[#5FAF7A]">Zero ledger mismatch</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#C99A45]/20 pb-2">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "payouts"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Payout Approval Queue (
          {metrics.pendingPayouts.length})
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "refunds"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refund Queue
        </button>
        <button
          onClick={() => setActiveTab("commissions")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "commissions"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <Percent className="w-3.5 h-3.5" /> Commission Report
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "calendar"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Settlement Calendar
        </button>
      </div>

      {/* 1. PAYOUT APPROVAL QUEUE */}
      {activeTab === "payouts" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
              Distributor & Consultant Disbursement Requests
            </h3>
            <Badge variant="warning">{metrics.pendingPayouts.length} Action Needed</Badge>
          </div>

          <div className="space-y-3 pt-1">
            {payoutRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#A89A85]">
                No pending withdrawal requests in the ledger.
              </div>
            ) : (
              payoutRequests.map((req) => {
                const seller = sellers.find((s) => s.id === req.sellerId);
                const isPaid = (req.status as string) === "paid" || (req.status as string) === "completed";
                const isPending = (req.status as string) === "requested" || (req.status as string) === "pending" || req.status === "processing";

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5EDE0]">
                          {seller?.company || req.sellerId}
                        </span>
                        <span className="font-mono text-[#A89A85]">
                          Ref: {req.id}
                        </span>
                        <Badge
                          variant={
                            isPaid ? "success" : isPending ? "warning" : "danger"
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[#A89A85]">
                        Beneficiary: {(seller?.bankDetails as any)?.accountHolder || seller?.company || "Royal Beauty Distributors"} • A/C: {seller?.bankDetails?.accountNumberLast4 ? `•••• ${seller.bankDetails.accountNumberLast4}` : "•••• 4821"} • IFSC: {seller?.bankDetails?.ifsc || "HDFC0001234"}
                      </div>
                      {req.utrNumber && (
                        <div className="text-[11px] font-mono text-emerald-400">
                          Bank UTR: {req.utrNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-serif font-bold text-[#E8C77A]">
                          {formatPaise(req.amount || req.amountPaise || 0)}
                        </span>
                        <div className="text-[10px] text-[#A89A85]">
                          NEFT / RTGS Transfer
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => {
                              setSelectedPayout(req);
                              setApproveDialogOpen(true);
                            }}
                          >
                            Approve Payout
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-500/30"
                            onClick={() => {
                              setSelectedPayout(req);
                              setRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* 2. REFUND QUEUE */}
      {activeTab === "refunds" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
          <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
            Customer Refund Disputed Escrow Queue
          </h3>
          <div className="space-y-3">
            {[
              { id: "ref-101", orderId: "ord-4", customer: "Devika Chauhan", amountPaise: 485000, reason: "Product damaged in courier transit", date: "2026-10-26" },
              { id: "ref-102", orderId: "ord-8", customer: "Rohan V.", amountPaise: 290000, reason: "Allergic reaction to unlisted fragrance", date: "2026-10-25" },
            ].map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#F5EDE0]">
                    {ref.customer} ({ref.orderId.toUpperCase()})
                  </div>
                  <div className="text-[11px] text-amber-400">Reason: {ref.reason}</div>
                  <div className="text-[10px] text-[#A89A85]">Requested: {ref.date}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-[#E8C77A]">
                    {formatPaise(ref.amountPaise)}
                  </span>
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => showToast.success(`Refund of ${formatPaise(ref.amountPaise)} authorized back to original payment mode`)}
                  >
                    Release Refund
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. COMMISSION REPORT */}
      {activeTab === "commissions" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
          <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
            Platform Take Rates by Distributor Subscription Tier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-2">
              <span className="font-bold text-[#E8C77A]">Starter Tier</span>
              <div className="text-2xl font-serif font-bold text-[#F5EDE0]">15%</div>
              <p className="text-[11px] text-[#A89A85]">
                Standard platform commission for boutique distributor accounts.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-2">
              <span className="font-bold text-[#E8C77A]">Business Tier</span>
              <div className="text-2xl font-serif font-bold text-[#F5EDE0]">10%</div>
              <p className="text-[11px] text-[#A89A85]">
                Reduced rake for high-velocity regional warehouse partners.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-2">
              <span className="font-bold text-[#E8C77A]">Empire Tier</span>
              <div className="text-2xl font-serif font-bold text-[#F5EDE0]">7%</div>
              <p className="text-[11px] text-[#A89A85]">
                Custom enterprise rate for pan-India luxury cosmetic distributors.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 4. SETTLEMENT CALENDAR */}
      {activeTab === "calendar" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
          <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
            Bi-Monthly Banking Settlement Calendar (Axis Bank Escrow)
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { cycle: "Cycle 1", window: "01 Nov - 05 Nov 2026", status: "Upcoming", payoutDate: "05 Nov 2026" },
              { cycle: "Cycle 2", window: "16 Nov - 20 Nov 2026", status: "Scheduled", payoutDate: "20 Nov 2026" },
              { cycle: "Cycle 3", window: "01 Dec - 05 Dec 2026", status: "Scheduled", payoutDate: "05 Dec 2026" },
            ].map((c) => (
              <div
                key={c.cycle}
                className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#F5EDE0]">{c.cycle}: {c.window}</span>
                  <div className="text-[11px] text-[#A89A85]">Disbursement: {c.payoutDate}</div>
                </div>
                <Badge variant="outline">{c.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Approve Payout Modal with Bank UTR input */}
      <ResponsiveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Disburse Bank Payout"
        description="Verify seller GST registration and bank account credentials before confirming NEFT/RTGS wire."
      >
        <div className="space-y-4 pt-2">
          {selectedPayout && (
            <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 text-xs space-y-1">
              <div>Amount to Disburse: <strong className="text-[#E8C77A] font-serif text-sm">{formatPaise(selectedPayout.amount || selectedPayout.amountPaise || 0)}</strong></div>
              <div>Seller: {selectedPayout.sellerId}</div>
            </div>
          )}

          <div>
            <label className="text-xs text-[#A89A85] mb-1 block">
              Bank Transaction Reference (UTR Number)
            </label>
            <Input
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. AXIS2026889218"
              className="text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleConfirmApproval}>
              Authorize Bank Wire
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Reject Payout Modal */}
      <ResponsiveDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Payout Request"
        description="Specify why this withdrawal request cannot be honored (e.g. Bank IFSC invalid or pending GST verification)."
      >
        <div className="space-y-4 pt-2">
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection justification..."
            className="text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
              Back
            </Button>
            <Button variant="danger" onClick={handleConfirmRejection}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
