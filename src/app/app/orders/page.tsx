"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Calendar,
  FileText
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/pricing";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const router = useRouter();
  const { orders } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "delivered" | "cancelled" | "returns">("all");
  const [selectedOrderForTablet, setSelectedOrderForTablet] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = order.orderNumber.toLowerCase().includes(q);
        const matchesItem = order.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchesNum && !matchesItem) return false;
      }

      // Status Filter
      if (selectedFilter === "active") {
        return ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery"].includes(order.status);
      }
      if (selectedFilter === "delivered") {
        return order.status === "delivered";
      }
      if (selectedFilter === "cancelled") {
        return order.status === "cancelled";
      }
      if (selectedFilter === "returns") {
        return order.status === "refunded" || (order.shipments && order.shipments.some((s) => s.status === "return_requested" || s.status === "returned" || s.status === "refunded"));
      }

      return true;
    });
  }, [orders, searchQuery, selectedFilter]);

  const activeDetailOrder = selectedOrderForTablet || filteredOrders[0] || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="gold" size="sm" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Delivered</Badge>;
      case "shipped":
      case "out_for_delivery":
        return <Badge variant="gold" size="sm" className="bg-blue-500/20 text-blue-300 border-blue-500/30">In Transit</Badge>;
      case "processing":
      case "packed":
      case "confirmed":
        return <Badge variant="gold" size="sm">Active</Badge>;
      case "cancelled":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case "refunded":
      case "return_requested":
        return <Badge variant="gold" size="sm" className="bg-purple-500/20 text-purple-300 border-purple-500/30">Return/Refund</Badge>;
      default:
        return <Badge variant="gold" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <PageHeader
        title="My Orders & Shipments"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Orders" }]}
      />

      {/* Top Filter and Search Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: "All Orders" },
            { id: "active", label: "Active" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
            { id: "returns", label: "Returns & Refunds" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-gold-400 text-base font-bold shadow-gold-glow"
                  : "bg-surface/80 text-cream-300 hover:text-cream-100 border border-gold-400/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or product..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-surface border border-gold-400/25 rounded-lg text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-gold-400"
          />
          <Search className="w-3.5 h-3.5 text-cream-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl bg-surface/60 border-gold-400/20 max-w-md mx-auto space-y-4">
          <Package className="w-12 h-12 text-gold-400/30 mx-auto" />
          <h3 className="font-serif text-lg text-cream-100">No Orders Found</h3>
          <p className="text-xs text-cream-400">
            {searchQuery ? "No orders match your search keyword." : "You have not placed any orders yet."}
          </p>
          <Button asChild className="shadow-gold-glow text-xs">
            <Link href="/app/shop">Explore Formulations</Link>
          </Button>
        </Card>
      ) : (
        /* Responsive Orders: Desktop Table + Tablet 2-pane + Mobile Cards */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Orders Master List (7 cols on Tablet/Desktop, 12 on mobile) */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            {filteredOrders.map((order) => {
              const isSelected = activeDetailOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderForTablet(order)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 ${
                    isSelected
                      ? "bg-surface border-gold-400 shadow-gold-glow/20"
                      : "bg-surface/70 border-gold-400/20 hover:border-gold-400/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-cream-100">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-[11px] font-mono text-cream-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm sm:text-base font-bold text-gold-400">
                        {formatINR(order.total)}
                      </div>
                      <div className="text-[10px] text-cream-400">
                        {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                      </div>
                    </div>
                  </div>

                  {/* Items previews */}
                  <div className="space-y-1.5 pt-2 border-t border-gold-400/10">
                    {order.items.slice(0, 2).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-cream-300">
                        <span className="truncate max-w-xs">{it.name}</span>
                        <span className="font-mono text-cream-400">Qty: {it.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-[11px] text-gold-400 italic">
                        +{order.items.length - 2} more item(s)...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gold-400/10 text-xs">
                    <span className="text-[11px] text-cream-400 font-mono">
                      Method: {order.paymentMethod}
                    </span>
                    <Button asChild size="sm" variant="outline" className="border-gold-400/30 text-xs h-7 px-2.5">
                      <Link href={`/app/orders/${order.id}`}>
                        Track & Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side Detail Pane on Tablet & Desktop (5 cols) */}
          <div className="hidden md:block md:col-span-5 sticky top-24 space-y-4">
            {activeDetailOrder ? (
              <Card className="p-5 sm:p-6 bg-surface border-gold-400/30 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gold-400/15">
                  <div>
                    <h3 className="font-serif text-base text-cream-100 font-medium">
                      Order #{activeDetailOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] font-mono text-cream-400">
                      Placed: {new Date(activeDetailOrder.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {getStatusBadge(activeDetailOrder.status)}
                </div>

                {/* Shipments Summary */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase text-gold-400 tracking-wider">
                    Shipment Breakdown ({activeDetailOrder.shipments?.length || 1})
                  </h4>
                  {activeDetailOrder.shipments?.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-base/60 border border-gold-400/15 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-medium text-cream-100">
                        <span>{s.sellerName}</span>
                        <span className="text-[10px] font-mono text-gold-300">{s.status.toUpperCase()}</span>
                      </div>
                      <div className="text-[11px] text-cream-400 flex items-center justify-between">
                        <span>{s.courierName}</span>
                        <span className="font-mono text-[10px]">AWB: {s.trackingNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Destination */}
                <div className="space-y-1 text-xs">
                  <h4 className="font-mono uppercase text-gold-400 text-[11px]">Delivery Address</h4>
                  <p className="text-cream-300">
                    {activeDetailOrder.shippingAddress.name}
                  </p>
                  <p className="text-[11px] text-cream-400">
                    {activeDetailOrder.shippingAddress.street}, {activeDetailOrder.shippingAddress.city} - {activeDetailOrder.shippingAddress.pincode}
                  </p>
                </div>

                {/* Amount Summary */}
                <div className="space-y-1.5 pt-3 border-t border-gold-400/15 text-xs text-cream-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-cream-100">{formatINR(activeDetailOrder.subtotal)}</span>
                  </div>
                  {activeDetailOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span className="font-mono">-{formatINR(activeDetailOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-mono">{activeDetailOrder.shippingFee === 0 ? "FREE" : formatINR(activeDetailOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-2 border-t border-gold-400/10 text-gold-400">
                    <span>Total</span>
                    <span className="font-mono">{formatINR(activeDetailOrder.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild size="sm" className="shadow-gold-glow text-xs">
                    <Link href={`/app/orders/${activeDetailOrder.id}`}>
                      Full Timeline
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-gold-400/30 text-xs">
                    <Link href={`/app/orders/${activeDetailOrder.id}/invoice`}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> GST Invoice
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
