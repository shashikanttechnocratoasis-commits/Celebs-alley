"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  Percent,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Ticket,
} from "lucide-react";
import type { Coupon } from "@/types";

export default function CommerceCouponsPage() {
  const { coupons, categories, createCoupon, updateCoupon, deleteCoupon } = useAppStore();
  const { canEdit, canDelete } = useAdminPermission("coupons");

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("percentage");
  const [formValue, setFormValue] = useState(15);
  const [formMinOrder, setFormMinOrder] = useState(999);
  const [formMaxDiscount, setFormMaxDiscount] = useState(500);
  const [formUsageLimit, setFormUsageLimit] = useState(500);
  const [formCategory, setFormCategory] = useState("all");
  const [formValidUntil, setFormValidUntil] = useState("2028-12-31");
  const [formError, setFormError] = useState("");

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [coupons, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormType("percentage");
    setFormValue(15);
    setFormMinOrder(999);
    setFormMaxDiscount(500);
    setFormUsageLimit(500);
    setFormCategory("all");
    setFormValidUntil("2028-12-31");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormType(c.discountType);
    setFormValue(c.discountValue);
    setFormMinOrder(c.minOrderValue / 100);
    setFormMaxDiscount(c.maxDiscount ? c.maxDiscount / 100 : 500);
    setFormUsageLimit(c.usageLimit);
    setFormCategory(c.applicableCategory || "all");
    setFormValidUntil(c.validUntil);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError("Voucher code is required.");
      return;
    }

    const payload = {
      code: formCode.toUpperCase().trim(),
      discountType: formType,
      discountValue: formValue,
      minOrderValue: formMinOrder * 100, // convert to paise
      maxDiscount: formMaxDiscount * 100,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: formValidUntil,
      usageLimit: formUsageLimit,
      status: "active" as const,
      applicableCategory: formCategory === "all" ? undefined : formCategory,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, payload);
    } else {
      createCoupon(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Promotional Vouchers & Checkout Coupons"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/commerce/orders" },
          { label: "Coupons" },
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
            placeholder="Search coupon promo code..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={!canEdit}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Create Voucher
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md flex flex-col justify-between transition hover:border-zinc-700 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-amber-400 tracking-wider">
                  {coupon.code}
                </span>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {coupon.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Discount Value</span>
                  <span className="font-semibold text-white font-mono">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} FLAT`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Min Basket Value</span>
                  <span className="font-mono text-zinc-300">
                    ₹{(coupon.minOrderValue / 100).toFixed(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Max Benefit Cap</span>
                  <span className="font-mono text-zinc-300">
                    ₹{coupon.maxDiscount ? (coupon.maxDiscount / 100).toFixed(0) : "No Cap"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Usage Redemption</span>
                  <span className="font-mono text-amber-300">
                    {coupon.usageCount || 0} / {coupon.usageLimit} Redeemed
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-850 pt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="h-3 w-3" /> Valid to {coupon.validUntil}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(coupon)}
                  disabled={!canEdit}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  disabled={!canDelete}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-white">
                {editingCoupon ? "Edit Voucher Code" : "Create New Promotional Voucher"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300">Voucher Promo Code</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g., FESTIVE25"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono font-bold text-amber-400 uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Discount Model</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Discount Value</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Min Cart Total (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
