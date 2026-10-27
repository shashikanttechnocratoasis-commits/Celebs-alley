"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  DollarSign,
  User,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { Order, Shipment } from "@/types";

export default function GlobalOrdersCommercePage() {
  const {
    orders,
    sellers,
    adminForceCancelOrder,
    addAdminNote,
    adminNotes,
  } = useAppStore();

  const { canEdit, canApprove } = useAdminPermission("orders");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");

  // Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Force Cancel Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Internal Note
  const [newOrderNote, setNewOrderNote] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      if (sellerFilter !== "all") {
        const hasSeller = o.shipments?.some((sh) => sh.sellerId === sellerFilter);
        if (!hasSeller) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = (o.orderNumber || o.id).toLowerCase().includes(q);
        const matchCust = (o.customerName || "").toLowerCase().includes(q);
        if (!matchNumber && !matchCust) return false;
      }

      return true;
    });
  }, [orders, statusFilter, sellerFilter, searchQuery]);

  const handleForceCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !cancelReason.trim()) return;

    adminForceCancelOrder(selectedOrder.id, cancelReason);
    setIsCancelModalOpen(false);
    setCancelReason("");
    // Refresh selectedOrder
    const updated = orders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  };

  const handleAddNote = () => {
    if (!selectedOrder || !newOrderNote.trim()) return;
    addAdminNote("order", selectedOrder.id, newOrderNote);
    setNewOrderNote("");
  };

  const currentNotes = useMemo(() => {
    if (!selectedOrder) return [];
    return adminNotes.filter((n) => n.entityId === selectedOrder.id);
  }, [adminNotes, selectedOrder]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Omni-Marketplace Orders & Shipments"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/commerce/orders" },
          { label: "Orders" },
        ]}
      />

      {/* Filter and Overview Cockpit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number or customer name..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="shipped">In Transit (Shipped)</option>
            <option value="packed">Packed</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Sellers</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Order Identifier</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Total Settlement</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Order Status</th>
                <th className="px-4 py-3.5">Split Shipments</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredOrders.map((order) => {
                const totalPaise = order.totalAmountPaise || 0;
                const shipmentsCount = order.shipments?.length || 1;

                return (
                  <tr key={order.id} className="transition hover:bg-zinc-900/40">
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {order.orderNumber || order.id}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white block">
                          {order.customerName || "Customer"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">{order.customerId}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-amber-400">
                        ₹{(totalPaise / 100).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{order.paymentMethod || "UPI"}</span>
                        {order.paymentLast4 && (
                          <span className="font-mono text-[10px] text-zinc-500">
                            (..{order.paymentLast4})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          order.status === "delivered"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : order.status === "shipped"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : order.status === "cancelled"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono text-zinc-400">
                        {shipmentsCount} {shipmentsCount === 1 ? "Package" : "Packages"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/40 hover:bg-zinc-700 hover:text-white"
                      >
                        Inspect Ledger
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                  Order Dossier
                </span>
                <h3 className="text-base font-semibold text-white">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {selectedOrder.status !== "cancelled" && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={!canEdit}
                  className="rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
                >
                  Force Cancel Order
                </button>
              )}
            </div>

            {/* Shipments Breakdown */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Multi-Seller Shipment Splits
              </h4>

              <div className="space-y-3">
                {selectedOrder.shipments?.map((shipment) => {
                  const seller = sellers.find((s) => s.id === shipment.sellerId);
                  return (
                    <div
                      key={shipment.id}
                      className="rounded-xl border border-zinc-850 bg-zinc-950 p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <span className="font-semibold text-white">
                          Fulfillment Hub: {seller?.company || shipment.sellerId}
                        </span>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                          {shipment.status}
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-900">
                        {shipment.items?.map((item, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between">
                            <span className="text-zinc-300">
                              {item.quantity}x {item.productName || item.productId}
                            </span>
                            <span className="font-mono text-zinc-400">
                              ₹{((((item.price ?? item.unitPrice ?? 0) * item.quantity)) / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Internal Audit Notes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-300 text-xs flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-amber-400" /> Order Governance Notes
              </h4>

              <div className="space-y-2">
                {currentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-semibold text-amber-300">{note.authorName}</span>
                      <span className="font-mono text-zinc-500">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newOrderNote}
                  onChange={(e) => setNewOrderNote(e.target.value)}
                  placeholder="Record an internal order resolution note..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={handleAddNote}
                  className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Post Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Force Cancel Modal */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Administrative Force Cancel</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Provide a verified administrative reason for overriding seller dispatch queues.
            </p>

            <form onSubmit={handleForceCancel} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Suspected fraudulent payment; out of stock across all certified hubs..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-500 px-5 py-2 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Confirm Force Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
