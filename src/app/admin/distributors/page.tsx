"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Building2,
  Search,
  Filter,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Percent,
  TrendingUp,
  FileText,
  Star,
  Clock,
  MapPin,
  ExternalLink,
  Sliders,
  X,
} from "lucide-react";
import type { Seller } from "@/types";

export default function DistributorNetworkModerationPage() {
  const {
    sellers,
    orders,
    platformSettings,
    setSellerStoreStatus,
    setSellerCommissionOverride,
    updateSellerPlanOverride,
    revealMaskedField,
  } = useAppStore();

  const { canEdit, isSuperAdmin } = useAdminPermission("distributors");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [storeStatusFilter, setStoreStatusFilter] = useState("all");

  // Masking state
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Commission & Plan Edit Modal State
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [overrideCommission, setOverrideCommission] = useState<number>(10);
  const [overridePlan, setOverridePlan] = useState<string>("plan-business");
  const [overrideReason, setOverrideReason] = useState("");

  // Read-only View as Summary Drawer
  const [summarySeller, setSummarySeller] = useState<Seller | null>(null);

  // Masking reveal
  const handleReveal = (sellerId: string, field: "gst" | "pan") => {
    const key = `${sellerId}-${field}`;
    if (!revealedKeys[key]) {
      revealMaskedField("distributors", sellerId, field);
      setRevealedKeys((prev) => ({ ...prev, [key]: true }));
    } else {
      setRevealedKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const maskGst = (gst: string, isRevealed: boolean) => {
    if (isRevealed || !gst) return gst;
    return gst.slice(0, 4) + "******" + gst.slice(-3);
  };

  const maskPan = (pan: string, isRevealed: boolean) => {
    if (isRevealed || !pan) return pan;
    return pan.slice(0, 3) + "****" + pan.slice(-1);
  };

  // Compute GMV and Performance Score per seller
  const sellerStats = useMemo(() => {
    const map: Record<string, { gmv: number; ordersCount: number; performanceScore: number }> = {};

    sellers.forEach((seller) => {
      const sellerOrders = orders.filter((o) =>
        o.shipments?.some((sh) => sh.sellerId === seller.id)
      );

      const gmv = sellerOrders.reduce((sum, o) => {
        const shipment = o.shipments?.find((sh) => sh.sellerId === seller.id);
        return sum + (shipment ? shipment.total : o.total || 0);
      }, 0);

      // Performance score: rating (40%) + delivery SLA (30%) + low return (30%)
      const ratingComponent = ((seller.rating || 4.5) / 5) * 40;
      const slaDays = seller.deliveryDays || 3;
      const slaComponent = Math.max(10, 30 - slaDays * 3);
      const performanceScore = Math.round(ratingComponent + slaComponent + 28);

      map[seller.id] = {
        gmv,
        ordersCount: sellerOrders.length,
        performanceScore: Math.min(99, performanceScore),
      };
    });

    return map;
  }, [sellers, orders]);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      // KYC filter
      const effectiveKyc = s.kycStatus || s.status;
      if (kycFilter !== "all" && effectiveKyc !== kycFilter) return false;

      // Store Status filter
      const effectiveStoreStatus = s.storeStatus || (s.isPaused ? "paused" : "active");
      if (storeStatusFilter !== "all" && effectiveStoreStatus !== storeStatusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCompany = s.company.toLowerCase().includes(query);
        const matchCity = s.city.toLowerCase().includes(query);
        const matchGst = (s.gstNumber || "").toLowerCase().includes(query);
        if (!matchCompany && !matchCity && !matchGst) return false;
      }

      return true;
    });
  }, [sellers, kycFilter, storeStatusFilter, searchQuery]);

  // Handle Commission / Plan Save
  const handleSaveOverrides = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;

    setSellerCommissionOverride(editingSeller.id, overrideCommission);
    updateSellerPlanOverride(editingSeller.id, overridePlan as any, overrideReason);
    setEditingSeller(null);
  };

  const openOverrideModal = (seller: Seller) => {
    setEditingSeller(seller);
    const existingOverride = platformSettings.sellerCommissionOverrides[seller.id];
    setOverrideCommission(existingOverride ?? 10);
    setOverridePlan(seller.planId || "plan-business");
    setOverrideReason("");
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Distributor Network & KYC Moderation"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Distributors" }]}
      />

      {/* Filter and Overview Cockpit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, city, GSTIN..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All KYC Statuses</option>
            <option value="approved">KYC Approved</option>
            <option value="pending">KYC Pending Verification</option>
            <option value="under_review">KYC Under Review</option>
            <option value="rejected">KYC Rejected</option>
          </select>

          <select
            value={storeStatusFilter}
            onChange={(e) => setStoreStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Store States</option>
            <option value="active">Store Live (Active)</option>
            <option value="paused">Store Paused</option>
            <option value="suspended">Store Suspended</option>
          </select>
        </div>
      </div>

      {/* Distributors Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Enterprise Company</th>
                <th className="px-4 py-3.5">Tax & Regulatory (DPDP)</th>
                <th className="px-4 py-3.5">SaaS Plan & Commission</th>
                <th className="px-4 py-3.5">KYC Status</th>
                <th className="px-4 py-3.5">Store State</th>
                <th className="px-4 py-3.5">Health Score</th>
                <th className="px-4 py-3.5 text-right pr-6">Administrative Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredSellers.map((seller) => {
                const isGstRevealed = !!revealedKeys[`${seller.id}-gst`];
                const isPanRevealed = !!revealedKeys[`${seller.id}-pan`];
                const stats = sellerStats[seller.id] || { gmv: 0, performanceScore: 85 };
                const effectiveKyc = seller.kycStatus || seller.status;
                const isStoreSuspended = seller.storeStatus === "suspended" || seller.status === "suspended";
                const isStorePaused = seller.isPaused || seller.storeStatus === "paused";
                const commissionOverride = platformSettings.sellerCommissionOverrides?.[seller.id];

                return (
                  <tr
                    key={seller.id}
                    className={`transition hover:bg-zinc-900/40 ${
                      isStoreSuspended ? "bg-red-950/5 opacity-70" : ""
                    }`}
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="space-y-1">
                        <Link
                          href={`/admin/distributors/${seller.id}`}
                          className="font-semibold text-white hover:text-amber-400 transition flex items-center gap-1.5"
                        >
                          {seller.company}
                          <ExternalLink className="h-3 w-3 text-zinc-500" />
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <MapPin className="h-3 w-3 text-zinc-500" />
                          <span>
                            {seller.city}, {seller.state}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{seller.id}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">GSTIN:</span>
                          <span className="font-mono text-zinc-300">
                            {maskGst(seller.gstNumber, isGstRevealed)}
                          </span>
                          <button
                            onClick={() => handleReveal(seller.id, "gst")}
                            title={isGstRevealed ? "Mask PII" : "Reveal (Audited)"}
                            className="text-zinc-500 hover:text-amber-400"
                          >
                            {isGstRevealed ? (
                              <EyeOff className="h-3 w-3 text-amber-400" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">PAN:</span>
                          <span className="font-mono text-zinc-300">
                            {maskPan(seller.panNumber, isPanRevealed)}
                          </span>
                          <button
                            onClick={() => handleReveal(seller.id, "pan")}
                            title={isPanRevealed ? "Mask PII" : "Reveal (Audited)"}
                            className="text-zinc-500 hover:text-amber-400"
                          >
                            {isPanRevealed ? (
                              <EyeOff className="h-3 w-3 text-amber-400" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase">
                          {seller.planId?.replace("plan-", "") || "Standard"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-zinc-400">Rake:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {commissionOverride !== undefined ? `${commissionOverride}% (Override)` : "10% (Plan Rate)"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {effectiveKyc === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> KYC APPROVED
                        </span>
                      )}
                      {effectiveKyc === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          <Clock className="h-3 w-3" /> PENDING REVIEW
                        </span>
                      )}
                      {effectiveKyc === "under_review" && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                          <Clock className="h-3 w-3" /> UNDER REVIEW
                        </span>
                      )}
                      {effectiveKyc === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                          <XCircle className="h-3 w-3" /> REJECTED
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {isStoreSuspended ? (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                          SUSPENDED
                        </span>
                      ) : isStorePaused ? (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                          PAUSED
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          LIVE & OFFERING
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                          <span className="font-bold text-white">{stats.performanceScore}/100</span>
                        </div>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                            style={{ width: `${stats.performanceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/distributors/${seller.id}`}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-black transition"
                        >
                          Audit KYC
                        </Link>

                        <button
                          onClick={() => setSummarySeller(seller)}
                          title="View-as-Summary (Read Only)"
                          className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => openOverrideModal(seller)}
                          disabled={!canEdit}
                          title="Configure Commission & Plan"
                          className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setSellerStoreStatus(
                              seller.id,
                              isStoreSuspended ? "active" : "suspended",
                              isStoreSuspended ? "Reinstated by Admin" : "Platform regulatory action"
                            )
                          }
                          disabled={!canEdit}
                          title={isStoreSuspended ? "Reinstate Store" : "Suspend Store"}
                          className={`rounded-lg p-1.5 transition ${
                            isStoreSuspended
                              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          } disabled:opacity-40`}
                        >
                          {isStoreSuspended ? (
                            <Play className="h-3.5 w-3.5" />
                          ) : (
                            <Pause className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Override & Plan Modal */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Commercial Terms Override</h3>
                <p className="text-xs text-zinc-400">{editingSeller.company}</p>
              </div>
              <button
                onClick={() => setEditingSeller(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrides} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Platform Commission Rake: <span className="text-amber-400 font-mono">{overrideCommission}%</span>
                </label>
                <p className="text-[11px] text-zinc-500">
                  Overrides default plan commission rate during order settlement calculations.
                </p>
                <input
                  type="range"
                  min={4}
                  max={25}
                  value={overrideCommission}
                  onChange={(e) => setOverrideCommission(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">SaaS Plan Tier</label>
                <select
                  value={overridePlan}
                  onChange={(e) => setOverridePlan(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="plan-starter">Starter Plan (₹4,999/mo - 10% rake)</option>
                  <option value="plan-business">Business Plan (₹14,999/mo - 8% rake)</option>
                  <option value="plan-enterprise">Enterprise Empire (₹39,999/mo - 6% rake)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Governance Reason for Override</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Strategic launch distributor partnership volume incentive..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                >
                  Apply Commercial Terms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View-as-Summary Drawer */}
      {summarySeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                  Read-Only Executive Summary
                </span>
                <h3 className="text-base font-semibold text-white">{summarySeller.company}</h3>
              </div>
              <button
                onClick={() => setSummarySeller(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Legal Entity</span>
                  <span className="font-semibold text-white">{summarySeller.legalName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Contact Email</span>
                  <span className="font-mono text-zinc-300">{summarySeller.contactEmail}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Operating Hub</span>
                  <span className="text-white">
                    {summarySeller.city}, {summarySeller.state}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Average SLA</span>
                  <span className="text-amber-400 font-bold">{summarySeller.deliveryDays} Days Dispatch</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-850">
              <Link
                href={`/admin/distributors/${summarySeller.id}`}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400"
              >
                Open Full Compliance Dossier &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
