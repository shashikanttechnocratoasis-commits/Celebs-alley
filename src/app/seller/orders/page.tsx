"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  FileText,
  DollarSign,
  Phone,
  MapPin,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { formatINR } from "@/lib/pricing";
import { usePermission } from "@/lib/rbac";
import type { Order, Shipment, ReturnRequest } from "@/types";

type OrderTab = "all" | "new" | "to_pack" | "to_ship" | "in_transit" | "delivered" | "cancelled" | "returns";

export default function SellerOrdersPage() {
  const {
    currentUser,
    currentRole,
    sellers,
    orders,
    couriers,
    returns,
    acceptShipment,
    rejectShipment,
    packShipment,
    shipShipment,
    deliverShipment,
    decideReturn,
  } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";

  // RBAC checks
  const canEditOrders = usePermission("orders", "edit");
  const canViewOrders = usePermission("orders", "view");
  const canEditReturns = usePermission("returns", "edit");

  // State
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7d" | "30d">("all");
  const [selectedShipmentKey, setSelectedShipmentKey] = useState<string | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);

  // Dialog states
  const [rejectModal, setRejectModal] = useState<{ orderId: string; shipmentId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [packModal, setPackModal] = useState<{ orderId: string; shipmentId: string; orderNumber: string } | null>(null);
  const [packChecklist, setPackChecklist] = useState({
    sealVerified: false,
    batchVerified: false,
    coldShieldSecured: false,
    notes: "",
  });
  const [shipModal, setShipModal] = useState<{ orderId: string; shipmentId: string; orderNumber: string } | null>(null);
  const [shipForm, setShipForm] = useState({
    courierName: couriers[0]?.name || "Blue Dart Express",
    trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
    estDays: 2,
  });
  const [deliverModal, setDeliverModal] = useState<{ orderId: string; shipmentId: string; isCod: boolean; codAmount: number } | null>(null);
  const [codCollected, setCodCollected] = useState(false);

  // Return Decision state
  const [returnDecisionModal, setReturnDecisionModal] = useState<{
    orderId: string;
    returnId: string;
    productName: string;
  } | null>(null);
  const [returnRejectReason, setReturnRejectReason] = useState("");
  const [returnRestock, setReturnRestock] = useState(true);

  // Printable Modal (Packing slip / Invoice)
  const [printModal, setPrintModal] = useState<{
    type: "packing_slip" | "invoice" | "bulk_slips";
    order?: Order;
    shipment?: Shipment;
    bulkList?: Array<{ order: Order; shipment: Shipment }>;
  } | null>(null);

  // Filter shipments strictly for this tenant
  const tenantShipments = useMemo(() => {
    const list: Array<{
      key: string;
      order: Order;
      shipment: Shipment;
    }> = [];

    orders.forEach((ord) => {
      if (ord.shipments && ord.shipments.length > 0) {
        ord.shipments.forEach((sh) => {
          if (sh.sellerId === sellerId) {
            list.push({
              key: `${ord.id}___${sh.id}`,
              order: ord,
              shipment: sh,
            });
          }
        });
      } else if (ord.sellerId === sellerId) {
        // Fallback for flat order
        const fallbackSh: Shipment = {
          id: `sh-${ord.id}`,
          orderId: ord.id,
          sellerId,
          sellerName: currentSeller?.company || "Distributor",
          sellerState: currentSeller?.state || "Maharashtra",
          status: ord.status as any,
          items: ord.items || [],
          subtotal: ord.subtotal || ord.total * 0.82,
          discount: ord.discount || 0,
          tax: ord.tax || ord.total * 0.18,
          cgst: (ord.tax || ord.total * 0.18) / 2,
          sgst: (ord.tax || ord.total * 0.18) / 2,
          igst: 0,
          shippingFee: ord.shippingFee || 0,
          total: ord.total,
          timeline: ord.timeline || [],
        };
        list.push({
          key: `${ord.id}___${fallbackSh.id}`,
          order: ord,
          shipment: fallbackSh,
        });
      }
    });

    return list;
  }, [orders, sellerId, currentSeller]);

  // SLA calculations (order placed within 24h needs acceptance; ship within handling time)
  const now = new Date("2026-10-10T12:00:00Z");
  const getSlaStatus = (createdAt: string, status: string) => {
    const createdTime = new Date(createdAt).getTime();
    const elapsedHours = (now.getTime() - createdTime) / (1000 * 60 * 60);

    if (status === "pending") {
      const remainingHours = Math.max(0, 24 - elapsedHours);
      const isOverdue = elapsedHours > 24;
      return {
        isOverdue,
        label: isOverdue ? "Acceptance SLA Breached" : `${Math.round(remainingHours)}h left to accept`,
        urgent: remainingHours < 4,
      };
    }
    if (status === "packed" || status === "processing") {
      const remainingHours = Math.max(0, 48 - elapsedHours);
      const isOverdue = elapsedHours > 48;
      return {
        isOverdue,
        label: isOverdue ? "Dispatch SLA Breached" : `${Math.round(remainingHours)}h to dispatch`,
        urgent: remainingHours < 8,
      };
    }
    return null;
  };

  // Filter by Tab and Search
  const filteredShipments = useMemo(() => {
    return tenantShipments.filter(({ order, shipment }) => {
      // Tab filter
      if (activeTab === "new") {
        if (shipment.status !== "pending") return false;
      } else if (activeTab === "to_pack") {
        if (shipment.status !== "processing") return false;
      } else if (activeTab === "to_ship") {
        if (shipment.status !== "packed") return false;
      } else if (activeTab === "in_transit") {
        if (shipment.status !== "shipped" && (shipment.status as string) !== "in_transit") return false;
      } else if (activeTab === "delivered") {
        if (shipment.status !== "delivered") return false;
      } else if (activeTab === "cancelled") {
        if (shipment.status !== "cancelled") return false;
      } else if (activeTab === "returns") {
        const hasReturn = !!shipment.returnRequest || shipment.status === "returned";
        if (!hasReturn) return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt).getTime();
        const diffDays = (now.getTime() - orderDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today" && diffDays > 1) return false;
        if (dateFilter === "7d" && diffDays > 7) return false;
        if (dateFilter === "30d" && diffDays > 30) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = (order.shippingAddress?.name || "").toLowerCase().includes(q);
        const matchesItem = shipment.items?.some((it) => (it.productName || it.name || "").toLowerCase().includes(q));
        if (!matchesNumber && !matchesCustomer && !matchesItem) return false;
      }

      return true;
    });
  }, [tenantShipments, activeTab, searchQuery, dateFilter]);

  // Selected item detail
  const activeSelection = useMemo(() => {
    if (!selectedShipmentKey && filteredShipments.length > 0) {
      return filteredShipments[0];
    }
    return tenantShipments.find((s) => s.key === selectedShipmentKey) || filteredShipments[0] || null;
  }, [selectedShipmentKey, filteredShipments, tenantShipments]);

  // Handlers for workflow
  const handleAccept = (orderId: string, shipmentId: string) => {
    if (!canEditOrders) return;
    acceptShipment(orderId, shipmentId);
  };

  const handleOpenReject = (orderId: string, shipmentId: string) => {
    if (!canEditOrders) return;
    setRejectModal({ orderId, shipmentId });
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectShipment(rejectModal.orderId, rejectModal.shipmentId, rejectReason);
    setRejectModal(null);
  };

  const handleOpenPack = (orderId: string, shipmentId: string, orderNumber: string) => {
    if (!canEditOrders) return;
    setPackModal({ orderId, shipmentId, orderNumber });
    setPackChecklist({ sealVerified: true, batchVerified: true, coldShieldSecured: true, notes: "" });
  };

  const handleConfirmPack = () => {
    if (!packModal) return;
    packShipment(packModal.orderId, packModal.shipmentId, packChecklist.notes || "Inspected & sealed in security container");
    setPackModal(null);
  };

  const handleOpenShip = (orderId: string, shipmentId: string, orderNumber: string) => {
    if (!canEditOrders) return;
    const selectedCourier = couriers[0]?.name || "Blue Dart Express";
    const prefix = couriers[0]?.trackingPrefix || "BD";
    setShipModal({ orderId, shipmentId, orderNumber });
    setShipForm({
      courierName: selectedCourier,
      trackingNumber: `${prefix}-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estDays: 2,
    });
  };

  const handleConfirmShip = () => {
    if (!shipModal) return;
    shipShipment(shipModal.orderId, shipModal.shipmentId, shipForm.courierName, shipForm.trackingNumber, shipForm.estDays);
    setShipModal(null);
  };

  const handleOpenDeliver = (orderId: string, shipmentId: string, isCod: boolean, codAmount: number) => {
    if (!canEditOrders) return;
    setDeliverModal({ orderId, shipmentId, isCod, codAmount });
    setCodCollected(isCod);
  };

  const handleConfirmDeliver = () => {
    if (!deliverModal) return;
    deliverShipment(deliverModal.orderId, deliverModal.shipmentId, deliverModal.isCod && codCollected);
    setDeliverModal(null);
  };

  const handleReturnDecision = (decision: "approved" | "rejected") => {
    if (!returnDecisionModal) return;
    if (decision === "rejected" && !returnRejectReason.trim()) return;
    decideReturn(
      returnDecisionModal.orderId,
      returnDecisionModal.returnId,
      decision,
      returnRejectReason,
      decision === "approved" ? returnRestock : false
    );
    setReturnDecisionModal(null);
  };

  // Bulk actions
  const handleBulkSelectToggle = (key: string) => {
    setSelectedForBulk((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleBulkAccept = () => {
    if (!canEditOrders) return;
    selectedForBulk.forEach((key) => {
      const match = tenantShipments.find((s) => s.key === key);
      if (match && match.shipment.status === "pending") {
        acceptShipment(match.order.id, match.shipment.id);
      }
    });
    setSelectedForBulk([]);
  };

  const handleBulkPrintSlips = () => {
    const listToPrint = tenantShipments.filter((s) => selectedForBulk.includes(s.key));
    if (listToPrint.length === 0) return;
    setPrintModal({
      type: "bulk_slips",
      bulkList: listToPrint,
    });
  };

  // Masking helpers
  const maskPhone = (phone?: string) => {
    if (!phone) return "••••••••••";
    return phone.slice(0, 4) + "••••" + phone.slice(-2);
  };

  const maskAddress = (address?: string) => {
    if (!address) return "••••••••••••••••";
    return "•••••••••• (Hidden until accepted)";
  };

  if (!canViewOrders) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view distributor order fulfillments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Orders & Fulfillment"
          description={`Real-time tenant fulfillment queue for ${currentSeller?.company}. Only orders routed to your warehouse appear here.`}
          breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Orders" }]}
        />

        {selectedForBulk.length > 0 && (
          <div className="flex items-center gap-3 bg-obsidian-900 border border-gold-500/30 px-4 py-2 rounded-xl">
            <span className="text-xs text-gold-300 font-medium">
              {selectedForBulk.length} selected
            </span>
            {canEditOrders && (
              <Button size="sm" variant="gold" onClick={handleBulkAccept}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Selected
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleBulkPrintSlips}>
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Packing Slips
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-obsidian-800 scrollbar-none">
        {[
          { id: "all", label: "All Orders", count: tenantShipments.length },
          { id: "new", label: "New (Awaiting Acceptance)", count: tenantShipments.filter((s) => s.shipment.status === "pending").length },
          { id: "to_pack", label: "To Pack", count: tenantShipments.filter((s) => s.shipment.status === "processing").length },
          { id: "to_ship", label: "To Ship", count: tenantShipments.filter((s) => s.shipment.status === "packed").length },
          { id: "in_transit", label: "In Transit", count: tenantShipments.filter((s) => s.shipment.status === "shipped" || (s.shipment.status as string) === "in_transit").length },
          { id: "delivered", label: "Delivered", count: tenantShipments.filter((s) => s.shipment.status === "delivered").length },
          { id: "cancelled", label: "Cancelled", count: tenantShipments.filter((s) => s.shipment.status === "cancelled").length },
          { id: "returns", label: "Returns", count: tenantShipments.filter((s) => !!s.shipment.returnRequest || s.shipment.status === "returned").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as OrderTab);
              setSelectedForBulk([]);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-gold-500/10 text-gold-300 border border-gold-500/30"
                : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.id ? "bg-gold-500/20 text-gold-200" : "bg-obsidian-800 text-cream-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer, item..."
            className="pl-9 h-9 text-xs bg-obsidian-950 border-obsidian-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-obsidian-950 border border-obsidian-800 rounded-lg px-3 py-1.5 text-xs text-cream-200 focus:outline-none focus:border-gold-500/40"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Shipments list (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredShipments.length === 0 ? (
            <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl">
              <Package className="w-8 h-8 text-cream-500 mx-auto mb-2 opacity-40" />
              <p className="text-xs text-cream-400">No shipments found in this view.</p>
            </div>
          ) : (
            filteredShipments.map(({ key, order, shipment }) => {
              const isSelected = activeSelection?.key === key;
              const sla = getSlaStatus(order.createdAt, shipment.status);
              const isBulkChecked = selectedForBulk.includes(key);

              return (
                <div
                  key={key}
                  onClick={() => setSelectedShipmentKey(key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-obsidian-900 border-gold-500/40 shadow-lg shadow-gold-500/5 ring-1 ring-gold-500/30"
                      : "bg-obsidian-950/70 border-obsidian-800 hover:border-obsidian-700 hover:bg-obsidian-900/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkSelectToggle(key);
                        }}
                        className="text-cream-400 hover:text-gold-300"
                      >
                        {isBulkChecked ? (
                          <CheckSquare className="w-4 h-4 text-gold-400" />
                        ) : (
                          <Square className="w-4 h-4 text-cream-500" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs font-mono font-bold text-cream-100">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-cream-500 block">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        shipment.status === "delivered"
                          ? "success"
                          : shipment.status === "cancelled"
                          ? "danger"
                          : shipment.status === "pending"
                          ? "warning"
                          : "outline"
                      }
                      size="sm"
                    >
                      {shipment.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Customer and Items Summary */}
                  <div className="mt-3 text-xs text-cream-300 flex items-center justify-between">
                    <span className="font-medium text-cream-200">
                      {order.shippingAddress?.name || "Customer"}
                    </span>
                    <span className="text-gold-300 font-mono font-semibold">
                      {formatINR(shipment.total)}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-cream-400 line-clamp-1">
                    {shipment.items?.map((it) => `${it.productName} (x${it.quantity})`).join(", ")}
                  </div>

                  {/* SLA Tag & COD Chip */}
                  <div className="mt-3 pt-2 border-t border-obsidian-850 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {order.paymentMethod === "cod" ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                          COD
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                          PAID
                        </span>
                      )}
                      <span className="text-cream-500">
                        {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                      </span>
                    </div>

                    {sla && (
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          sla.isOverdue
                            ? "text-rose-400 font-semibold"
                            : sla.urgent
                            ? "text-amber-400"
                            : "text-cream-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" /> {sla.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right pane: Detailed Shipment Workspace (7 cols on lg) */}
        <div className="lg:col-span-7">
          {activeSelection ? (
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 md:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-obsidian-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-serif font-bold text-cream-100">
                      Order #{activeSelection.order.orderNumber}
                    </h2>
                    <Badge
                      variant={
                        activeSelection.shipment.status === "delivered"
                          ? "success"
                          : activeSelection.shipment.status === "cancelled"
                          ? "danger"
                          : "outline"
                      }
                    >
                      {activeSelection.shipment.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-cream-400 mt-1">
                    Shipment ID: <span className="font-mono text-cream-300">{activeSelection.shipment.id}</span>
                  </p>
                </div>

                {/* Printables dropdown / quick actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPrintModal({
                        type: "packing_slip",
                        order: activeSelection.order,
                        shipment: activeSelection.shipment,
                      })
                    }
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Packing Slip
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setPrintModal({
                        type: "invoice",
                        order: activeSelection.order,
                        shipment: activeSelection.shipment,
                      })
                    }
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> Tax Invoice
                  </Button>
                </div>
              </div>

              {/* Action Workflow Bar based on status */}
              <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-gold-300 uppercase tracking-wider block">
                    Fulfillment Workflow Stage
                  </span>
                  <span className="text-xs text-cream-200 font-medium">
                    {activeSelection.shipment.status === "pending" && "New order waiting for inventory acceptance"}
                    {activeSelection.shipment.status === "processing" && "Accepted! Ready for quality pack & label"}
                    {activeSelection.shipment.status === "packed" && "Packed! Waiting for courier handover"}
                    {activeSelection.shipment.status === "shipped" && "Dispatched & in transit with courier"}
                    {activeSelection.shipment.status === "delivered" && "Delivered safely to recipient"}
                    {activeSelection.shipment.status === "cancelled" && "Shipment cancelled / rejected"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Step 1: Accept or Reject */}
                  {activeSelection.shipment.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={!canEditOrders}
                        title={!canEditOrders ? "Your role cannot reject orders" : ""}
                        onClick={() => handleOpenReject(activeSelection.order.id, activeSelection.shipment.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="gold"
                        disabled={!canEditOrders}
                        title={!canEditOrders ? "Your role cannot accept orders" : ""}
                        onClick={() => handleAccept(activeSelection.order.id, activeSelection.shipment.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Order
                      </Button>
                    </>
                  )}

                  {/* Step 2: Pack */}
                  {activeSelection.shipment.status === "processing" && (
                    <Button
                      size="sm"
                      variant="gold"
                      disabled={!canEditOrders}
                      title={!canEditOrders ? "Your role cannot pack orders" : ""}
                      onClick={() =>
                        handleOpenPack(
                          activeSelection.order.id,
                          activeSelection.shipment.id,
                          activeSelection.order.orderNumber
                        )
                      }
                    >
                      <Package className="w-3.5 h-3.5 mr-1" /> Start Packing
                    </Button>
                  )}

                  {/* Step 3: Ship */}
                  {activeSelection.shipment.status === "packed" && (
                    <Button
                      size="sm"
                      variant="gold"
                      disabled={!canEditOrders}
                      title={!canEditOrders ? "Your role cannot dispatch orders" : ""}
                      onClick={() =>
                        handleOpenShip(
                          activeSelection.order.id,
                          activeSelection.shipment.id,
                          activeSelection.order.orderNumber
                        )
                      }
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" /> Dispatch Courier
                    </Button>
                  )}

                  {/* Step 4: Deliver (Simulated handover) */}
                  {(activeSelection.shipment.status === "shipped" || (activeSelection.shipment.status as string) === "in_transit") && (
                    <Button
                      size="sm"
                      variant="gold"
                      disabled={!canEditOrders}
                      onClick={() =>
                        handleOpenDeliver(
                          activeSelection.order.id,
                          activeSelection.shipment.id,
                          activeSelection.order.paymentMethod === "cod",
                          activeSelection.shipment.total
                        )
                      }
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Delivered (Demo)
                    </Button>
                  )}
                </div>
              </div>

              {/* Items in this shipment */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-cream-200 uppercase tracking-wider">
                  Shipment Items ({activeSelection.shipment.items?.length || 0})
                </h3>
                <div className="divide-y divide-obsidian-800 bg-obsidian-950 rounded-xl border border-obsidian-800">
                  {activeSelection.shipment.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-obsidian-900 border border-obsidian-800 overflow-hidden relative flex-shrink-0">
                          <ImageWithFallback
                            src={item.image || "/images/gold-fallback.png"}
                            alt={item.productName || item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-cream-100">{item.productName || item.name}</p>
                          <p className="text-[11px] text-cream-400">
                            Qty: <span className="text-cream-200 font-mono font-bold">{item.quantity}</span> × {formatINR(item.price || item.unitPrice || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-gold-300">
                          {formatINR((item.price || item.unitPrice || 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details (Privacy Masking before acceptance) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" /> Customer Privacy
                    </span>
                    {activeSelection.shipment.status === "pending" ? (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Masked
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-cream-100">
                    {activeSelection.order.shippingAddress?.name || "Customer"}
                  </p>
                  <p className="text-xs text-cream-400 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-cream-500" />
                    {activeSelection.shipment.status === "pending"
                      ? maskPhone(activeSelection.order.shippingAddress?.phone)
                      : activeSelection.order.shippingAddress?.phone || "+91 98200 12345"}
                  </p>
                </div>

                <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-2">
                  <span className="text-[10px] font-semibold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Delivery Address
                  </span>
                  <p className="text-xs text-cream-300">
                    {activeSelection.shipment.status === "pending"
                      ? maskAddress(activeSelection.order.shippingAddress?.addressLine1)
                      : activeSelection.order.shippingAddress?.addressLine1 || "701, Raheja Towers, Bandra Kurla Complex"}
                  </p>
                  <p className="text-xs text-cream-400">
                    {activeSelection.order.shippingAddress?.city}, {activeSelection.order.shippingAddress?.state} -{" "}
                    <span className="font-mono text-cream-200 font-semibold">
                      {activeSelection.order.shippingAddress?.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Payment & Settlement Summary */}
              <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-cream-400 uppercase tracking-wider block">
                    Payment Method
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={activeSelection.order.paymentMethod === "cod" ? "warning" : "success"} size="sm">
                      {activeSelection.order.paymentMethod.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-cream-200">
                      Status: <span className="capitalize">{activeSelection.order.paymentStatus}</span>
                    </span>
                  </div>
                  {activeSelection.order.paymentMethod === "cod" && (
                    <p className="text-[11px] text-amber-300 mt-1">
                      ⚠️ Collect {formatINR(activeSelection.shipment.total)} cash upon delivery.
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-cream-400 uppercase tracking-wider block">
                    Shipment Value (incl. GST)
                  </span>
                  <span className="text-base font-mono font-bold text-gold-300">
                    {formatINR(activeSelection.shipment.total)}
                  </span>
                </div>
              </div>

              {/* Return Request Case if exists */}
              {activeSelection.shipment.returnRequest && (
                <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                        Customer Return Request ({activeSelection.shipment.returnRequest.status.toUpperCase()})
                      </h4>
                    </div>
                    <span className="text-[10px] text-cream-400">
                      Requested: {new Date(activeSelection.shipment.returnRequest.requestedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-cream-200">
                    <span className="font-semibold text-rose-300">Reason:</span> {activeSelection.shipment.returnRequest.reason}
                  </p>
                  {activeSelection.shipment.returnRequest.comments && (
                    <p className="text-xs text-cream-400 italic">
                      "{activeSelection.shipment.returnRequest.comments}"
                    </p>
                  )}

                  {activeSelection.shipment.returnRequest.status === "pending" && (
                    <div className="pt-2 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={!canEditReturns}
                        onClick={() => {
                          setReturnDecisionModal({
                            orderId: activeSelection.order.id,
                            returnId: activeSelection.shipment.returnRequest!.id,
                            productName: activeSelection.shipment.items?.[0]?.productName || "Product",
                          });
                          setReturnRejectReason("");
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Review & Decide
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Shipment Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-cream-200 uppercase tracking-wider">
                  Shipment Activity Timeline
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-obsidian-800">
                  {activeSelection.shipment.timeline?.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-gold-400 ring-4 ring-obsidian-950" />
                      <p className="text-xs font-semibold text-cream-100">{evt.label}</p>
                      <p className="text-[11px] text-cream-400">{evt.note}</p>
                      <span className="text-[10px] text-cream-500 font-mono block mt-0.5">
                        {new Date(evt.timestamp).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* MODAL: Reject Reason */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              Reject Shipment Order
            </h3>
            <p className="text-xs text-cream-400">
              Rejecting will automatically release the reserved stock back into available inventory, alert the customer, and simulate a refund if prepaid.
            </p>
            <div>
              <label className="text-xs text-cream-300 font-medium block mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Stock batch damaged during transit / Item out of physical stock"
                rows={3}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-rose-500/40"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={!rejectReason.trim()}
                onClick={handleConfirmReject}
              >
                Confirm Rejection & Release Stock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Packing Checklist */}
      {packModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-5">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Quality Packing Checklist
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Order #{packModal.orderNumber}. Ensure luxury dispatch protocols before sealing.
              </p>
            </div>

            <div className="space-y-3 bg-obsidian-950 p-4 rounded-xl border border-obsidian-800">
              <label className="flex items-center gap-2.5 text-xs text-cream-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packChecklist.sealVerified}
                  onChange={(e) => setPackChecklist((p) => ({ ...p, sealVerified: e.target.checked }))}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                />
                <span>Holographic tamper-evident seal inspected</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-cream-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packChecklist.batchVerified}
                  onChange={(e) => setPackChecklist((p) => ({ ...p, batchVerified: e.target.checked }))}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                />
                <span>Batch expiry verified (&gt; 12 months shelf life)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-cream-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packChecklist.coldShieldSecured}
                  onChange={(e) => setPackChecklist((p) => ({ ...p, coldShieldSecured: e.target.checked }))}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                />
                <span>Cold-shield luxury temperature insulation placed</span>
              </label>
            </div>

            <div>
              <label className="text-xs text-cream-300 font-medium block mb-1">
                Packer Notes / Batch Identifier (Optional)
              </label>
              <Input
                value={packChecklist.notes}
                onChange={(e) => setPackChecklist((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Packed at Mumbai Hub, Bay 3"
                className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setPackModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="gold"
                disabled={!packChecklist.sealVerified || !packChecklist.batchVerified || !packChecklist.coldShieldSecured}
                onClick={handleConfirmPack}
              >
                Mark as Packed
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ship Dispatch */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Dispatch Courier Handover
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Assign logistic provider and Airway Bill (AWB) for Order #{shipModal.orderNumber}.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Courier Partner
                </label>
                <select
                  value={shipForm.courierName}
                  onChange={(e) => {
                    const c = couriers.find((x) => x.name === e.target.value);
                    setShipForm({
                      courierName: e.target.value,
                      trackingNumber: `${c?.trackingPrefix || "AWB"}-${Math.floor(100000000 + Math.random() * 900000000)}`,
                      estDays: c?.avgDeliveryDays || 3,
                    });
                  }}
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-gold-500/40"
                >
                  {couriers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.avgDeliveryDays} days avg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Airway Bill (AWB) / Tracking Number
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shipForm.trackingNumber}
                    onChange={(e) => setShipForm((s) => ({ ...s, trackingNumber: e.target.value }))}
                    className="h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      const c = couriers.find((x) => x.name === shipForm.courierName);
                      setShipForm((s) => ({
                        ...s,
                        trackingNumber: `${c?.trackingPrefix || "AWB"}-${Math.floor(100000000 + Math.random() * 900000000)}`,
                      }));
                    }}
                  >
                    Regen
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Estimated Transit Time (Days)
                </label>
                <Input
                  type="number"
                  value={shipForm.estDays}
                  onChange={(e) => setShipForm((s) => ({ ...s, estDays: parseInt(e.target.value) || 2 }))}
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                  min={1}
                  max={14}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShipModal(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="gold" onClick={handleConfirmShip}>
                Handover to Courier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Deliver Demo Handover */}
      {deliverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Confirm Package Delivery (Simulated)
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Because this demo runs locally without live courier webhooks, simulate delivery completion here.
              </p>
            </div>

            {deliverModal.isCod && (
              <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-amber-300 block">
                  Cash on Delivery Collection
                </span>
                <label className="flex items-center gap-2.5 text-xs text-cream-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codCollected}
                    onChange={(e) => setCodCollected(e.target.checked)}
                    className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                  />
                  <span>
                    Collected full cash amount of <strong className="text-gold-300 font-mono">{formatINR(deliverModal.codAmount)}</strong>
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setDeliverModal(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="gold" onClick={handleConfirmDeliver}>
                Confirm Handed Over
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Return Decision */}
      {returnDecisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Return Adjudication
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Decide on the return request for "{returnDecisionModal.productName}".
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-cream-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnRestock}
                  onChange={(e) => setReturnRestock(e.target.checked)}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                />
                <span>Automatically Restock 1 item into inventory if approved</span>
              </label>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Reason (Required if declining)
                </label>
                <textarea
                  value={returnRejectReason}
                  onChange={(e) => setReturnRejectReason(e.target.value)}
                  placeholder="e.g. Seal has been tampered with or product opened."
                  rows={2}
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-rose-500/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setReturnDecisionModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={!returnRejectReason.trim()}
                onClick={() => handleReturnDecision("rejected")}
              >
                Decline Return
              </Button>
              <Button
                size="sm"
                variant="gold"
                onClick={() => handleReturnDecision("approved")}
              >
                Approve & Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VIEW MODAL */}
      {printModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="bg-white text-slate-900 max-w-3xl w-full rounded-lg shadow-2xl p-8 space-y-6 relative print:p-0 print:shadow-none print:w-full">
            {/* Print toolbar (hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-slate-700" />
                <span className="text-sm font-bold text-slate-800">
                  {printModal.type === "packing_slip"
                    ? "Distributor Packing Slip Preview"
                    : printModal.type === "invoice"
                    ? "GST Tax Invoice Preview"
                    : `Bulk Packing Slips (${printModal.bulkList?.length || 0})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
                >
                  Print Document
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModal(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Content */}
            {printModal.type === "bulk_slips" ? (
              <div className="space-y-8 divide-y divide-slate-300">
                {printModal.bulkList?.map(({ order, shipment }, i) => (
                  <div key={i} className="pt-6 first:pt-0 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold">PACKING SLIP</h2>
                        <p className="text-xs text-slate-600">Order #{order.orderNumber}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-bold">{currentSeller?.company}</p>
                        <p className="text-slate-500">GSTIN: {currentSeller?.gstin || "27AAACB1234F1Z5"}</p>
                      </div>
                    </div>
                    <div className="text-xs bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="font-semibold text-slate-700">Deliver To:</p>
                      <p>{order.shippingAddress?.name}</p>
                      <p>{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p>
                      <p>Phone: {order.shippingAddress?.phone}</p>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-300">
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipment.items?.map((it, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-2 font-medium">{it.productName}</td>
                            <td className="py-2 text-center">{it.quantity}</td>
                            <td className="py-2 text-right">₹{it.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : printModal.type === "packing_slip" && printModal.order && printModal.shipment ? (
              <div className="space-y-6 text-slate-800">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">CELEBS ALLEY DISPATCH SLIP</h1>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Order: #{printModal.order.orderNumber} | Shipment: {printModal.shipment.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{currentSeller?.company}</p>
                    <p className="text-[11px] text-slate-500">GSTIN: {currentSeller?.gstin || "27AAACB1234F1Z5"}</p>
                    <p className="text-[11px] text-slate-500">Hub: Primary Warehouse</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Shipping Destination
                    </p>
                    <p className="font-semibold text-slate-900">{printModal.order.shippingAddress?.name}</p>
                    <p className="text-slate-600">
                      {printModal.order.shippingAddress?.addressLine1},{" "}
                      {printModal.order.shippingAddress?.city} - {printModal.order.shippingAddress?.pincode}
                    </p>
                    <p className="text-slate-600">Phone: {printModal.order.shippingAddress?.phone}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Logistics Details
                    </p>
                    <p className="text-slate-800">
                      Carrier: <strong className="font-semibold">{printModal.shipment.courierName || "Blue Dart Express"}</strong>
                    </p>
                    <p className="text-slate-800">
                      AWB / Tracking: <strong className="font-mono">{printModal.shipment.trackingNumber || "PENDING"}</strong>
                    </p>
                    <p className="text-slate-800">
                      Payment: <strong className="uppercase">{printModal.order.paymentMethod}</strong> (
                      {printModal.order.paymentMethod === "cod" ? `Collect ₹${printModal.shipment.total}` : "Prepaid"}
                      )
                    </p>
                  </div>
                </div>

                <div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100">
                        <th className="p-2">#</th>
                        <th className="p-2">SKU / Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {printModal.shipment.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-medium">{it.productName || it.name}</td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right">₹{it.price || it.unitPrice || 0}</td>
                          <td className="p-2 text-right font-semibold">₹{(it.price || it.unitPrice || 0) * it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold">
                        <td colSpan={4} className="p-2 text-right">Shipment Total:</td>
                        <td className="p-2 text-right">₹{printModal.shipment.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 flex justify-between">
                  <span>Packed with Cold-Shield Luxury Cosmeceutical Protection.</span>
                  <span>Celebs Alley Verified Marketplace</span>
                </div>
              </div>
            ) : printModal.type === "invoice" && printModal.order && printModal.shipment ? (
              <div className="space-y-6 text-slate-800">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">TAX INVOICE</h1>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Invoice No: INV-SELLER-{printModal.order.orderNumber.replace("CA-ORD-", "")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Date: {new Date(printModal.order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{currentSeller?.company}</p>
                    <p className="text-xs text-slate-600">GSTIN: {currentSeller?.gstin || "27AAACB1234F1Z5"}</p>
                    <p className="text-xs text-slate-600">PAN: {currentSeller?.pan || "AAACB1234F"}</p>
                    <p className="text-[11px] text-slate-500">{currentSeller?.city}, {currentSeller?.state}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Billed To:</p>
                    <p className="font-semibold">{printModal.order.shippingAddress?.name}</p>
                    <p>{printModal.order.shippingAddress?.addressLine1}, {printModal.order.shippingAddress?.city} - {printModal.order.shippingAddress?.pincode}</p>
                    <p>State: {printModal.order.shippingAddress?.state} | Code: 27</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Supply Details:</p>
                    <p>Place of Supply: {printModal.order.shippingAddress?.state}</p>
                    <p>Payment: {printModal.order.paymentMethod.toUpperCase()} ({printModal.order.paymentStatus})</p>
                    <p>Reverse Charge: No</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="p-2">Item Description</th>
                      <th className="p-2">HSN</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Taxable Value</th>
                      <th className="p-2 text-right">GST (18%)</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printModal.shipment.items?.map((it, idx) => {
                      const itemTotal = (it.price || it.unitPrice || 0) * it.quantity;
                      const taxable = Math.round((itemTotal / 1.18) * 100) / 100;
                      const gst = Math.round((itemTotal - taxable) * 100) / 100;
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.productName || it.name}</td>
                          <td className="p-2 font-mono text-slate-600">330499</td>
                          <td className="p-2 text-center">{it.quantity}</td>
                          <td className="p-2 text-right">₹{taxable.toFixed(2)}</td>
                          <td className="p-2 text-right">₹{gst.toFixed(2)}</td>
                          <td className="p-2 text-right font-semibold">₹{itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-bold">
                      <td colSpan={5} className="p-2 text-right">Grand Total:</td>
                      <td className="p-2 text-right">₹{printModal.shipment.total}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500">
                  <p>This is a computer-generated GST invoice issued under Rule 46 of the CGST Rules, 2017.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
