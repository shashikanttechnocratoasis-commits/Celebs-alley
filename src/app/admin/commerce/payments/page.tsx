"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Check,
} from "lucide-react";

export default function CommercePaymentsReconciliationPage() {
  const { paymentTransactions, reconcilePayment } = useAppStore();
  const { canEdit } = useAdminPermission("payments");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reconciledFilter, setReconciledFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    return paymentTransactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (reconciledFilter === "reconciled" && !tx.isReconciled) return false;
      if (reconciledFilter === "unreconciled" && tx.isReconciled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTx = tx.transactionId.toLowerCase().includes(q);
        const matchOrder = tx.orderNumber.toLowerCase().includes(q);
        const matchCust = tx.customerName.toLowerCase().includes(q);
        if (!matchTx && !matchOrder && !matchCust) return false;
      }

      return true;
    });
  }, [paymentTransactions, statusFilter, reconciledFilter, searchQuery]);

  const metrics = useMemo(() => {
    const totalVolumePaise = paymentTransactions.reduce(
      (sum, tx) => (tx.status === "success" ? sum + tx.amountPaise : sum),
      0
    );
    const totalFeesPaise = paymentTransactions.reduce(
      (sum, tx) => sum + (tx.gatewayFeePaise || 0),
      0
    );
    const successCount = paymentTransactions.filter((t) => t.status === "success").length;
    const failedCount = paymentTransactions.filter((t) => t.status === "failed").length;
    const unreconciledCount = paymentTransactions.filter((t) => !t.isReconciled).length;

    return {
      totalVolumePaise,
      totalFeesPaise,
      successRate: Math.round((successCount / (paymentTransactions.length || 1)) * 100),
      failedCount,
      unreconciledCount,
    };
  }, [paymentTransactions]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Gateway Escrow & Payment Reconciliation"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/commerce/orders" },
          { label: "Payments" },
        ]}
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
          <span className="text-xs text-zinc-400">Total Settled Volume</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">
              ₹{(metrics.totalVolumePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Live gateway capture</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
          <span className="text-xs text-zinc-400">Payment Gateway Fees (2%)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-400">
              ₹{(metrics.totalFeesPaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Razorpay / Cashfree interchange</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
          <span className="text-xs text-zinc-400">Success Authorization Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {metrics.successRate}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {metrics.failedCount} failed attempts logged
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
          <span className="text-xs text-zinc-400">Reconciliation Mismatches</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-red-400">
              {metrics.unreconciledCount}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Escrow pending verification</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transaction ID, order number, or customer..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={reconciledFilter}
            onChange={(e) => setReconciledFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Reconciliation States</option>
            <option value="unreconciled">Action Required (Unreconciled)</option>
            <option value="reconciled">Reconciled</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Transaction Reference</th>
                <th className="px-4 py-3.5">Order & Customer</th>
                <th className="px-4 py-3.5">Settled Amount</th>
                <th className="px-4 py-3.5">Gateway Fee</th>
                <th className="px-4 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Reconciliation Status</th>
                <th className="px-4 py-3.5 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-zinc-900/40">
                  <td className="py-4 pl-6 pr-4">
                    <div>
                      <span className="font-mono font-bold text-white block">
                        {tx.transactionId}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <span className="font-medium text-white block">{tx.customerName}</span>
                      <span className="font-mono text-[11px] text-amber-400">{tx.orderNumber}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-mono font-bold text-white">
                      ₹{(tx.amountPaise / 100).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-mono text-zinc-400">
                      ₹{((tx.gatewayFeePaise || 0) / 100).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      {tx.method}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {tx.isReconciled ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> RECONCILED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        <Clock className="h-3 w-3" /> UNSETTLED ESCROW
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right pr-6">
                    {!tx.isReconciled && (
                      <button
                        onClick={() => reconcilePayment(tx.id)}
                        disabled={!canEdit}
                        className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:opacity-40"
                      >
                        Mark Reconciled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
