"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  XCircle,
  ShieldCheck,
  Star,
  Camera,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { formatINR } from "@/lib/pricing";
import { ReturnRequestFormSchema, ReviewFormSchema } from "@/lib/schemas";
import { toast } from "sonner";
import type { Order, Shipment, OrderItem } from "@/types";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const ORDER_STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const {
    orders,
    updateShipmentStatus,
    cancelOrder,
    requestReturn,
    simulateReturnApproval,
    addReview,
    addToCart,
    setCartDrawerOpen,
  } = useAppStore();

  const order = orders.find((o) => o.id === id);

  // Demo tool collapsibles
  const [demoToolsOpen, setDemoToolsOpen] = useState(true);

  // Cancel dialog
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Found better alternative");

  // Return dialog
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnShipmentId, setReturnShipmentId] = useState("");
  const [returnProductId, setReturnProductId] = useState("");
  const [returnProductName, setReturnProductName] = useState("");
  const [returnReason, setReturnReason] = useState("Skin redness / sensitivity reaction");
  const [returnComments, setReturnComments] = useState("Experienced mild erythema after patch testing.");

  // Review dialog
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("Exceptional formulation");
  const [reviewComment, setReviewComment] = useState("Absorbed immediately without clogging pores. Highly recommended.");

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-serif text-2xl text-cream-100">Order Not Found</h2>
        <p className="text-xs text-cream-400">Order #{id} could not be located in your history.</p>
        <Button asChild variant="outline" className="border-gold-400/30 text-xs">
          <Link href="/app/orders">View All Orders</Link>
        </Button>
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isRefunded = order.status === "refunded";
  const canCancel = ["pending", "confirmed", "processing", "packed"].includes(order.status) && !isCancelled;

  // Handle Cancel Order
  const handleConfirmCancel = () => {
    const res = cancelOrder(order.id, cancelReason);
    if (res.success) {
      toast.success(res.message);
      setCancelModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Handle Reorder
  const handleReorder = () => {
    order.items.forEach((it) => {
      addToCart(
        {
          id: it.productId,
          name: it.name,
          mrp: it.unitPrice,
          images: it.image ? [it.image] : [],
          targetParameters: {},
          suitableSkinTypes: [],
          concernTags: [],
          contraindications: [],
          usage: "",
          rating: 4.8,
          reviewCount: 10,
          sku: "CA-REORDER",
          brandId: "brand-1",
          categoryId: "cat-1",
          description: "",
          ingredients: [],
          status: "active",
        },
        it.quantity,
        order.sellerId,
        it.unitPrice
      );
    });
    toast.success("Items from order re-added to your bag");
    setCartDrawerOpen(true);
  };

  // Handle Return Submission
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const parse = ReturnRequestFormSchema.safeParse({
      reason: returnReason,
      comments: returnComments,
      productId: returnProductId,
    });

    if (!parse.success) {
      toast.error(parse.error.issues[0]?.message || "Please complete all return fields.");
      return;
    }

    const item = order.items.find((it) => it.productId === returnProductId);
    const refundAmount = item ? item.total : order.total;

    requestReturn({
      orderId: order.id,
      shipmentId: returnShipmentId,
      productId: returnProductId,
      productName: returnProductName,
      reason: returnReason,
      comments: returnComments,
      refundAmount,
      refundMethod: order.paymentMethod,
    });

    toast.success("Return request submitted for clinical review.");
    setReturnModalOpen(false);
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const parse = ReviewFormSchema.safeParse({
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });

    if (!parse.success) {
      toast.error(parse.error.issues[0]?.message || "Invalid review inputs");
      return;
    }

    addReview({
      productId: reviewProductId,
      customerId: order.customerId,
      customerName: order.customerName,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      verifiedPurchase: true,
    });

    toast.success("Thank you! Your product review has been published.");
    setReviewModalOpen(false);
  };

  // Simulate Next Status per Shipment (DEMO CONTROL)
  const handleSimulateNextStatus = (shipment: Shipment) => {
    const sequence: Array<Shipment["status"]> = [
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];

    const currentIndex = sequence.indexOf(shipment.status);
    if (currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      updateShipmentStatus(order.id, shipment.id, nextStatus);
      toast.success(`Shipment advanced to: ${nextStatus.toUpperCase()}`);
    } else {
      toast.info("Shipment has already arrived at Delivered status.");
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/app/orders"
            className="inline-flex items-center gap-1.5 text-xs text-cream-400 hover:text-gold-300 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-cream-100 font-normal">
              Order #{order.orderNumber}
            </h1>
            <Badge variant="gold" size="sm" className="font-mono text-xs uppercase">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-cream-400 font-mono mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Global Order Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="border-red-500/40 text-red-300 hover:bg-red-950/20 text-xs"
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleReorder}
            className="border-gold-400/30 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reorder Items
          </Button>

          <Button
            asChild
            size="sm"
            className="shadow-gold-glow text-xs"
          >
            <Link href={`/app/orders/${order.id}/invoice`}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> View GST Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* DEMO TOOL: WALK SHIPMENT & SIMULATE APPROVAL */}
      <Card className="p-4 rounded-2xl bg-amber-950/20 border-amber-500/30 space-y-3">
        <button
          type="button"
          onClick={() => setDemoToolsOpen(!demoToolsOpen)}
          className="w-full flex items-center justify-between text-left text-xs text-amber-300 font-mono font-semibold uppercase tracking-wider"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Phase 4 Demo Sandbox Controls (Simulate Seller / Courier Transition)
          </span>
          {demoToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {demoToolsOpen && (
          <div className="pt-2 border-t border-amber-500/20 space-y-2.5 text-xs text-cream-200">
            <p className="text-[11px] text-cream-300/80 leading-relaxed">
              Because the multi-tenant seller portal is scheduled for Phase 5, use these demo triggers to walk order status through courier dispatch stages and return approvals. All changes persist to the global inventory and order slices.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {order.shipments?.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  onClick={() => handleSimulateNextStatus(s)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs"
                >
                  Advance {s.sellerName} (Now: {s.status.toUpperCase()}) →
                </Button>
              ))}

              {order.shipments?.some((s) => s.returnRequest?.status === "pending") && (
                <Button
                  size="sm"
                  onClick={() => {
                    const ret = order.shipments?.find((s) => s.returnRequest?.status === "pending")?.returnRequest;
                    if (ret) simulateReturnApproval(ret.id);
                  }}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs"
                >
                  Simulate Return Approval & Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Main Grid: Shipments, Timelines, Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipments & Tracking Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Per-Seller Shipments */}
          {order.shipments?.map((shipment, sIdx) => {
            const currentStepIdx = ORDER_STEPS.findIndex((st) => st.key === shipment.status);

            return (
              <Card
                key={shipment.id}
                className="p-5 sm:p-6 bg-surface/80 border-gold-400/25 shadow-xl space-y-6"
              >
                {/* Shipment Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gold-400/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-cream-100 font-medium">
                        Shipment {sIdx + 1}: {shipment.sellerName}
                      </span>
                      <Badge variant="gold" size="sm" className="font-mono text-[10px]">
                        {shipment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[11px] font-mono text-cream-400 flex items-center gap-3 pt-0.5">
                      <span>Courier: {shipment.courierName}</span>
                      <span>•</span>
                      <span className="text-gold-300">AWB Tracking: {shipment.trackingNumber}</span>
                    </div>
                  </div>

                  {/* Return Button if Delivered */}
                  {shipment.status === "delivered" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const firstProd = shipment.items[0];
                          setReturnShipmentId(shipment.id);
                          setReturnProductId(firstProd.productId);
                          setReturnProductName(firstProd.name);
                          setReturnModalOpen(true);
                        }}
                        className="border-gold-400/30 text-xs h-8"
                      >
                        Request Return / Refund
                      </Button>
                    </div>
                  )}
                </div>

                {/* Animated Status Stepper Progress */}
                {!["cancelled", "refunded", "return_requested"].includes(shipment.status) ? (
                  <div className="py-2">
                    <div className="flex items-center justify-between max-w-xl mx-auto px-2">
                      {ORDER_STEPS.map((st, i) => {
                        const isDone = currentStepIdx >= i;
                        const isCurrent = currentStepIdx === i;

                        return (
                          <div key={st.key} className="flex flex-col items-center flex-1 relative">
                            {/* Line connecting to next */}
                            {i < ORDER_STEPS.length - 1 && (
                              <div
                                className={`absolute top-3 left-1/2 right-[-50%] h-[2px] z-0 ${
                                  currentStepIdx > i ? "bg-emerald-400" : "bg-gold-400/20"
                                }`}
                              />
                            )}

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold z-10 transition-all ${
                                isDone
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-base border border-gold-400/20 text-cream-500"
                              } ${isCurrent ? "ring-2 ring-gold-400 scale-110 shadow-gold-glow" : ""}`}
                            >
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            <span
                              className={`text-[10px] font-mono mt-1 text-center hidden sm:block ${
                                isCurrent ? "text-gold-300 font-bold" : isDone ? "text-cream-200" : "text-cream-500"
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Branch Status Banner */
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Status Branch: {shipment.status.replace("_", " ").toUpperCase()}</span>
                  </div>
                )}

                {/* Items in this Shipment */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase text-cream-400 tracking-wider">
                    Packaged Formulations ({shipment.items.length})
                  </h4>
                  <div className="divide-y divide-gold-400/10">
                    {shipment.items.map((it) => (
                      <div
                        key={it.productId}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {it.image && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gold-400/20 bg-base shrink-0">
                              <ImageWithFallback
                                src={it.image}
                                alt={it.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-medium text-cream-100 truncate block">
                              {it.name}
                            </span>
                            <span className="text-[11px] text-cream-400 font-mono">
                              Qty: {it.quantity} × {formatINR(it.unitPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-gold-400">
                            {formatINR(it.total)}
                          </span>

                          {/* Rate Product if Delivered */}
                          {shipment.status === "delivered" && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewProductId(it.productId);
                                setReviewProductName(it.name);
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-gold-400/30 text-gold-400 hover:text-gold-200 text-[11px] font-mono flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" /> Rate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipment Timeline Log */}
                <div className="pt-3 border-t border-gold-400/15 space-y-2.5">
                  <h4 className="text-xs font-mono uppercase text-gold-400 tracking-wider">
                    Chronological Courier Events
                  </h4>
                  <div className="space-y-2 text-xs">
                    {shipment.timeline.map((ev, eIdx) => (
                      <div key={eIdx} className="flex items-start gap-2.5 text-cream-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-cream-100">{ev.label}</span>
                            <span className="text-[10px] text-cream-500 font-mono">
                              {new Date(ev.timestamp).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {ev.note && <p className="text-[11px] text-cream-400">{ev.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Address, Payment, Price Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address Card */}
          <Card className="p-5 bg-surface/80 border-gold-400/25 shadow-xl space-y-2.5 text-xs">
            <h3 className="font-serif text-sm font-semibold text-cream-100 flex items-center gap-1.5">
              <span>Delivery Destination</span>
            </h3>
            <div className="space-y-0.5 text-cream-300">
              <p className="font-medium text-cream-100">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p className="font-mono text-[11px] text-cream-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.mobile && (
                <p className="font-mono text-[11px] text-cream-400">
                  Contact: +91 {order.shippingAddress.mobile}
                </p>
              )}
            </div>
          </Card>

          {/* Payment Snapshot Card */}
          <Card className="p-5 bg-surface/80 border-gold-400/25 shadow-xl space-y-2.5 text-xs">
            <h3 className="font-serif text-sm font-semibold text-cream-100 flex items-center justify-between">
              <span>Payment Details</span>
              <span className="font-mono text-[10px] text-emerald-400 uppercase">
                {order.paymentStatus}
              </span>
            </h3>
            <div className="space-y-1 text-cream-300">
              <p>Method: <strong className="text-cream-100">{order.paymentMethod}</strong></p>
              {order.payment?.transactionId && (
                <p className="font-mono text-[11px] text-cream-400">
                  Ref: {order.payment.transactionId}
                </p>
              )}
              {order.payment?.cardLast4 && (
                <p className="font-mono text-[11px] text-cream-400">
                  Card: Visa •••• {order.payment.cardLast4}
                </p>
              )}
            </div>
          </Card>

          {/* Price Breakdown */}
          <Card className="p-5 bg-surface/80 border-gold-400/25 shadow-xl space-y-3 text-xs">
            <h3 className="font-serif text-sm font-semibold text-cream-100 pb-2 border-b border-gold-400/15">
              Price Breakdown
            </h3>
            <div className="space-y-2 text-cream-300">
              <div className="flex justify-between">
                <span>Subtotal (Inclusive of GST)</span>
                <span className="font-mono text-cream-100">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({order.couponCode || "PROMO"})</span>
                  <span className="font-mono">-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-mono">{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
              </div>
              {order.codFee && order.codFee > 0 ? (
                <div className="flex justify-between">
                  <span>COD Convenience Fee</span>
                  <span className="font-mono">{formatINR(order.codFee)}</span>
                </div>
              ) : null}

              {/* GST split */}
              <div className="pt-2 border-t border-gold-400/10 space-y-1 text-[11px] text-cream-400 font-mono">
                {order.igst && order.igst > 0 ? (
                  <div className="flex justify-between">
                    <span>IGST (Integrated Tax)</span>
                    <span>{formatINR(order.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (Central Tax)</span>
                      <span>{formatINR(order.cgst || Math.round((order.tax || 0) / 2))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (State Tax)</span>
                      <span>{formatINR(order.sgst || (order.tax || 0) - Math.round((order.tax || 0) / 2))}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-gold-400/20 flex justify-between font-bold text-sm text-gold-400">
                <span>Paid Total</span>
                <span className="font-mono">{formatINR(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <ResponsiveDialog
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title="Cancel Order"
        description={`Are you sure you want to cancel order #${order.orderNumber}?`}
      >
        <div className="space-y-4 py-2 text-xs">
          <p className="text-cream-300">
            Cancellation is only permitted prior to courier dispatch. Reserved formulation stock will be returned to the distributor inventory.
          </p>

          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Reason for Cancellation</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full h-10 px-3 bg-base border border-gold-400/30 rounded-xl text-cream-100"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better alternative">Found better alternative</option>
              <option value="Need to change delivery address">Need to change delivery address</option>
              <option value="Delivery timeframe too long">Delivery timeframe too long</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="border-gold-400/30 text-xs"
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              className="text-xs"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Return Request Dialog */}
      <ResponsiveDialog
        open={returnModalOpen}
        onOpenChange={setReturnModalOpen}
        title="Return & Refund Request"
        description={`Initiate clinical return for ${returnProductName}`}
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4 py-2 text-xs">
          <p className="text-cream-300">
            Returns must be requested within 7 days of verified delivery.
          </p>

          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Return Reason</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full h-10 px-3 bg-base border border-gold-400/30 rounded-xl text-cream-100"
            >
              <option value="Skin redness / sensitivity reaction">Skin redness / sensitivity reaction</option>
              <option value="Damaged cold-chain seal or jar">Damaged cold-chain seal or jar</option>
              <option value="Incorrect formulation received">Incorrect formulation received</option>
              <option value="Texture or scent inconsistency">Texture or scent inconsistency</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Description / Clinical Observation</label>
            <textarea
              rows={3}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              className="w-full p-3 bg-base border border-gold-400/30 rounded-xl text-cream-100 resize-none"
              placeholder="Describe what occurred after application..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReturnModalOpen(false)}
              className="border-gold-400/30 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="shadow-gold-glow text-xs">
              Submit Return Request
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* Review Dialog */}
      <ResponsiveDialog
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        title="Rate & Review Formulation"
        description={`Share your clinical feedback for ${reviewProductName}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 py-2 text-xs">
          {/* Stars Picker */}
          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-gold-400 hover:scale-110 transition-transform"
                >
                  <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-current" : "opacity-30"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Headline</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full h-10 px-3 bg-base border border-gold-400/30 rounded-xl text-cream-100"
              placeholder="e.g. Noticeable improvement in hydration"
            />
          </div>

          <div className="space-y-1">
            <label className="text-cream-400 font-mono">Detailed Clinical Experience</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-3 bg-base border border-gold-400/30 rounded-xl text-cream-100 resize-none"
              placeholder="How did this product perform on your skin biomarkers?"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewModalOpen(false)}
              className="border-gold-400/30 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="shadow-gold-glow text-xs">
              Publish Review
            </Button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
}
