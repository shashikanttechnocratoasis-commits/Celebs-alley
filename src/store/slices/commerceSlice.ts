import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { PlatformSettings, PaymentTransaction, Coupon } from "@/types";
import initialPlatformSettings from "@/data/platformSettings.json";
import initialPaymentTransactions from "@/data/paymentTransactions.json";
import initialCoupons from "@/data/coupons.json";
import { formatINR } from "@/lib/pricing";

export interface CommerceSlice {
  platformSettings: PlatformSettings;
  updatePlatformSettings: (patch: Partial<PlatformSettings>) => void;

  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string, reason: string) => void;
  setProductSponsored: (productId: string, sponsored: boolean, sponsorName?: string) => void;

  adminForceCancelOrder: (orderId: string, reason: string) => void;
  adminApproveRefund: (orderId: string, refundId: string, reason?: string) => void;
  adminRejectRefund: (orderId: string, refundId: string, reason: string) => void;

  paymentTransactions: PaymentTransaction[];
  reconcilePayment: (transactionId: string) => void;

  approvePayoutRequest: (payoutId: string, utrNumber: string) => void;
  rejectPayoutRequest: (payoutId: string, reason: string) => void;

  coupons: Coupon[];
  createCoupon: (coupon: Omit<Coupon, "id" | "usedCount" | "usageCount">) => Coupon;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
}

export const createCommerceSlice: StateCreator<AppState, [], [], CommerceSlice> = (set, get) => ({
  platformSettings: initialPlatformSettings as unknown as PlatformSettings,
  updatePlatformSettings: (patch) => {
    set((state) => ({
      platformSettings: {
        ...state.platformSettings,
        ...patch,
      },
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "update_platform_settings",
          resource: "commissions",
          details: `Updated platform settings: ${Object.keys(patch).join(", ")}`,
        },
        ...state.auditLogs,
      ],
    }));
  },

  approveProduct: (productId) => {
    const state = get();
    set({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, status: "active" as const, isApproved: true } : p
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Product Manager",
          action: "approve_product",
          resource: "products",
          details: `Approved product formulation ${productId} for marketplace display`,
        },
        ...state.auditLogs,
      ],
    });
  },

  rejectProduct: (productId, reason) => {
    const state = get();
    set({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, status: "rejected" as const, isApproved: false } : p
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Product Manager",
          action: "reject_product",
          resource: "products",
          details: `Rejected product ${productId}. Reason: ${reason}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  setProductSponsored: (productId, sponsored, sponsorName) => {
    const state = get();
    set({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, sponsored: sponsored ? true : undefined, sponsorName: sponsored ? sponsorName : undefined }
          : p
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Product Manager",
          action: sponsored ? "sponsor_product" : "unsponsor_product",
          resource: "products",
          details: `${sponsored ? "Sponsored" : "Removed sponsorship for"} product ${productId}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  adminForceCancelOrder: (orderId, reason) => {
    const state = get();
    set({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "cancelled",
          timeline: [
            ...(o.timeline || []),
            {
              status: "cancelled",
              label: "Cancelled by Platform Governance",
              timestamp: new Date().toISOString(),
              note: reason,
            },
          ],
        };
      }),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "admin_force_cancel_order",
          resource: "orders",
          details: `Force cancelled order ${orderId}. Reason: ${reason}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  adminApproveRefund: (orderId, refundId, reason) => {
    const state = get();
    set({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          payment: o.payment
            ? {
                ...o.payment,
                status: "refunded" as const,
              }
            : undefined,
          timeline: [
            ...(o.timeline || []),
            {
              status: "refunded",
              label: "Refund Approved & Processed by Platform",
              timestamp: new Date().toISOString(),
              note: reason || "Refund processed to original payment method.",
            },
          ],
        };
      }),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Finance Manager",
          action: "admin_approve_refund",
          resource: "refunds",
          details: `Approved and processed refund for order ${orderId}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  adminRejectRefund: (orderId, refundId, reason) => {
    const state = get();
    set({
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Finance Manager",
          action: "admin_reject_refund",
          resource: "refunds",
          details: `Rejected refund escalation for order ${orderId}. Reason: ${reason}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  paymentTransactions: initialPaymentTransactions as unknown as PaymentTransaction[],
  reconcilePayment: (transactionId) => {
    const state = get();
    set({
      paymentTransactions: state.paymentTransactions.map((t) =>
        t.id === transactionId ? { ...t, isReconciled: true } : t
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Finance Manager",
          action: "reconcile_payment",
          resource: "payments",
          details: `Marked transaction ${transactionId} reconciled with bank settlement`,
        },
        ...state.auditLogs,
      ],
    });
  },

  approvePayoutRequest: (payoutId, utrNumber) => {
    const state = get();
    const req = state.payoutRequests.find((p) => p.id === payoutId);
    set({
      payoutRequests: state.payoutRequests.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: "paid" as const,
              processedAt: new Date().toISOString(),
              utrNumber: utrNumber || `UTR-${Date.now()}`,
            }
          : p
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Finance Manager",
          action: "approve_payout_disbursement",
          resource: "finance",
          details: `Disbursed payout ${payoutId} for seller ${req?.sellerId} with UTR ${utrNumber}`,
        },
        ...state.auditLogs,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: "Payout Disbursed",
          message: `Your withdrawal of ${req?.amount ? formatINR(req.amount / 100) : "funds"} has been paid via NEFT. UTR: ${utrNumber}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "system",
        },
        ...state.notifications,
      ],
    });
  },

  rejectPayoutRequest: (payoutId, reason) => {
    const state = get();
    set({
      payoutRequests: state.payoutRequests.map((p) =>
        p.id === payoutId ? { ...p, status: "rejected" as const, rejectionReason: reason } : p
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Finance Manager",
          action: "reject_payout_request",
          resource: "finance",
          details: `Rejected payout request ${payoutId}. Reason: ${reason}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  coupons: initialCoupons as unknown as Coupon[],
  createCoupon: (coupon) => {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      usageCount: 0,
      usedCount: 0,
      ...coupon,
    };
    set((state) => ({
      coupons: [newCoupon, ...state.coupons],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Admin",
          action: "create_coupon",
          resource: "coupons",
          details: `Created promotional promo code ${newCoupon.code}`,
        },
        ...state.auditLogs,
      ],
    }));
    return newCoupon;
  },

  updateCoupon: (id, patch) => {
    set((state) => ({
      coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  deleteCoupon: (id) => {
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== id),
    }));
  },
});
