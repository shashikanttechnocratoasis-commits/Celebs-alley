"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Truck,
  DollarSign,
  X,
} from "lucide-react";
import type { OrderReturn } from "@/types";

export default function CommerceRefundEscalationsPage() {
  const { returns, orders, adminApproveRefund, adminRejectRefund } = useAppStore();
  const { canEdit, canApprove } = useAdminPermission("refunds");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReturn, setSelectedReturn] = useState<OrderReturn | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchOrder = r.orderId.toLowerCase().includes(q);
        const matchReason = (r.reason || "").toLowerCase().includes(q);
        if (!matchId && !matchOrder && !matchReason) return false;
      }

      return true;
    });
  }, [returns, statusFilter, searchQuery]);

  const handleApprove = (ret: OrderReturn) => {
    if (!canApprove) return;
    adminApproveRefund(ret.orderId, ret.id, "Administrative dispute resolution clearance");
    setSelectedReturn(null);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn || !rejectReason.trim()) return;

    adminRejectRefund(selectedReturn.orderId, selectedReturn.id, rejectReason);
    setIsRejectOpen(false);
    setSelectedReturn(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Return & Refund Escalations"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/commerce/orders" },
          { label: "Refunds" },
        ]}
      />

      {/* Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search return request ID, order ID, or reason..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
        >
          <option value="all">All Dispute States</option>
          <option value="requested">Customer Requested</option>
          <option value="approved">Approved & Initiated</option>
          <option value="received">Warehouse Received</option>
          <option value="refunded">Refund Completed</option>
          <option value="rejected">Dispute Rejected</option>
        </select>
      </div>

      {/* Returns List */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Return Dispute ID</th>
                <th className="px-4 py-3.5">Linked Parent Order</th>
                <th className="px-4 py-3.5">Escalated Reason</th>
                <th className="px-4 py-3.5">Refund Valuation</th>
                <th className="px-4 py-3.5">Dispute Stage</th>
                <th className="px-4 py-3.5 text-right pr-6">Administrative Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredReturns.map((ret) => {
                const order = orders.find((o) => o.id === ret.orderId);
                const isActionable = ret.status === "pending" || (ret.status as string) === "requested";

                return (
                  <tr key={ret.id} className="transition hover:bg-zinc-900/40">
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <span className="font-mono font-bold text-white block">{ret.id}</span>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(ret.requestedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono text-amber-400 block">{ret.orderId}</span>
                      <span className="text-[11px] text-zinc-400">
                        {order?.customerName || "Customer"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-zinc-300 block max-w-xs">{ret.reason}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-white">
                        ₹{((ret.refundAmount || order?.totalAmountPaise || 0) / 100).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          ret.status === "refunded"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : ret.status === "rejected"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {isActionable ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReturn(ret);
                                setIsRejectOpen(true);
                              }}
                              disabled={!canApprove}
                              className="rounded-lg border border-red-500/30 bg-red-950/20 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
                            >
                              Reject Dispute
                            </button>
                            <button
                              onClick={() => handleApprove(ret)}
                              disabled={!canApprove}
                              className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
                            >
                              Approve Refund
                            </button>
                          </>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                    No active refund disputes in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reject Refund Escalation</h3>
            <p className="mt-1 text-xs text-zinc-400">
              State compliance reason for overriding customer dispute for order {selectedReturn.orderId}.
            </p>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Return window expired (exceeded 7 days); security seal broken..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
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
    </div>
  );
}
