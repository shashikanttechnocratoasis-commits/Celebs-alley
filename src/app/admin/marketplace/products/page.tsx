"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Edit2,
  Eye,
  Download,
  Tag,
  Star,
  Check,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { Product } from "@/types";

export default function MarketplaceProductsPage() {
  const {
    products,
    categories,
    brands,
    ingredients,
    parameters,
    approveProduct,
    rejectProduct,
    setProductSponsored,
  } = useAppStore();

  const { canEdit, canApprove } = useAdminPermission("products");

  // Tabs
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "sponsored">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  // Selected Product for Side-by-Side Review Drawer
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);

  // Reject Modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Sponsored Flag Modal
  const [sponsoredModalProduct, setSponsoredModalProduct] = useState<Product | null>(null);
  const [sponsorName, setSponsorName] = useState("");

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab === "pending" && p.status !== "pending_approval") return false;
      if (activeTab === "sponsored" && !p.sponsored) return false;

      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (brandFilter !== "all" && p.brandId !== brandFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      return true;
    });
  }, [products, activeTab, categoryFilter, brandFilter, searchQuery]);

  // Handle Approve
  const handleApprove = (productId: string) => {
    if (!canApprove) return;
    approveProduct(productId);
    if (reviewProduct?.id === productId) {
      setReviewProduct(null);
    }
  };

  // Handle Reject
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct || !rejectReason.trim()) return;

    rejectProduct(reviewProduct.id, rejectReason);
    setIsRejectOpen(false);
    setReviewProduct(null);
    setRejectReason("");
  };

  // Handle Sponsored Toggle
  const handleToggleSponsored = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsoredModalProduct) return;

    const willBeSponsored = !sponsoredModalProduct.sponsored;
    setProductSponsored(
      sponsoredModalProduct.id,
      willBeSponsored,
      willBeSponsored ? sponsorName || "Brand Partner" : undefined
    );
    setSponsoredModalProduct(null);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ["ID", "Name", "SKU", "MRP (₹)", "Status", "Sponsored", "Category", "Brand"];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      (p.mrp / 100).toFixed(2),
      p.status,
      p.sponsored ? "YES" : "NO",
      `"${categories.find((c) => c.id === p.categoryId)?.name || "N/A"}"`,
      `"${brands.find((b) => b.id === p.brandId)?.name || "N/A"}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catalogue_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Catalogue Governance & Moderation"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketplace", href: "/admin/marketplace/products" },
          { label: "Products" },
        ]}
      />

      {/* Top Filter and Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            All Catalogue ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Pending Approvals (
            {products.filter((p) => p.status === "pending_approval").length})
          </button>
          <button
            onClick={() => setActiveTab("sponsored")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "sponsored"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            Sponsored Placements ({products.filter((p) => p.sponsored).length})
          </button>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-850 hover:text-white"
        >
          <Download className="h-3.5 w-3.5 text-amber-400" /> Export Catalogue CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulation name, SKU, or active ingredients..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Product Formulation</th>
                <th className="px-4 py-3.5">Brand & Category</th>
                <th className="px-4 py-3.5">MRP / Valuation</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">AI Engine Mapping</th>
                <th className="px-4 py-3.5 text-right pr-6">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredProducts.map((product) => {
                const brand = brands.find((b) => b.id === product.brandId);
                const category = categories.find((c) => c.id === product.categoryId);
                const isPending = product.status === "pending_approval";
                const isSponsored = !!product.sponsored;

                return (
                  <tr
                    key={product.id}
                    className={`transition hover:bg-zinc-900/40 ${
                      isPending ? "bg-amber-950/10" : ""
                    }`}
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0] || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80"}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-zinc-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white block">{product.name}</span>
                            {isSponsored && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                SPONSORED
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">{product.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-white block">{brand?.name || "Global"}</span>
                        <span className="text-[11px] text-zinc-400">{category?.name || "Skincare"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-amber-400">
                        ₹{(product.mrp / 100).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          <Clock className="h-3 w-3" /> PENDING APPROVAL
                        </span>
                      ) : product.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> ACTIVE LIVE
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {product.status.toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product.targetParameters)
                          .filter(([_, weight]) => weight > 0)
                          .slice(0, 2)
                          .map(([paramKey, weight]) => {
                            const param = parameters.find(
                              (p) => p.slug === paramKey || p.id === paramKey
                            );
                            return (
                              <span
                                key={paramKey}
                                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300"
                              >
                                {param?.name || paramKey}: +{weight}
                              </span>
                            );
                          })}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReviewProduct(product)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:border-amber-500/40 hover:bg-zinc-700 hover:text-white"
                        >
                          Review Dossier
                        </button>

                        <button
                          onClick={() => {
                            setSponsoredModalProduct(product);
                            setSponsorName(product.sponsored ? "" : brand?.name || "Official Partner");
                          }}
                          disabled={!canEdit}
                          title={isSponsored ? "Remove Sponsored Flag" : "Flag as Sponsored Placement"}
                          className={`rounded-lg p-1.5 transition ${
                            isSponsored
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                          } disabled:opacity-40`}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleApprove(product.id)}
                            disabled={!canApprove}
                            className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:opacity-40"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                    No products matched the current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dossier Side-by-Side Drawer */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={reviewProduct.images[0] || ""}
                  alt={reviewProduct.name}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-800"
                />
                <div>
                  <h3 className="text-base font-semibold text-white">{reviewProduct.name}</h3>
                  <span className="text-xs font-mono text-zinc-400">{reviewProduct.sku}</span>
                </div>
              </div>
              <button
                onClick={() => setReviewProduct(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Decision Bar for Pending Products */}
            {reviewProduct.status === "pending_approval" && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-amber-300 block">
                    Seller Submission Awaiting Approval
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Approval makes this formulation immediately discoverable in public shops and patient regimen matching.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRejectOpen(true)}
                    className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(reviewProduct.id)}
                    className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
                  >
                    Approve Listing
                  </button>
                </div>
              </div>
            )}

            {/* AI Diagnostics Correlation Matrix */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Engine Scoring Matrix (-1 to +3)
              </h4>
              <p className="text-[11px] text-zinc-400">
                Calibrated impact weightings that drive the clinical recommendation algorithm for this SKU.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {parameters.map((param) => {
                  const weight =
                    reviewProduct.targetParameters[param.slug] ??
                    reviewProduct.targetParameters[param.id] ??
                    0;
                  return (
                    <div
                      key={param.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-950 p-2 border border-zinc-850"
                    >
                      <span className="text-zinc-300">{param.name}</span>
                      <span
                        className={`font-mono font-bold ${
                          weight > 0
                            ? "text-emerald-400"
                            : weight < 0
                            ? "text-red-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {weight > 0 ? `+${weight}` : weight}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INCI Ingredients & Caution Flags */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> Formulation Ingredients & Allergen Profile
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {reviewProduct.ingredients.map((ingName) => {
                  const matchedIng = ingredients.find(
                    (i) => i.name.toLowerCase() === ingName.toLowerCase() || i.id === ingName
                  );
                  const hasCaution = matchedIng && matchedIng.contraindications.length > 0;

                  return (
                    <span
                      key={ingName}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-mono border ${
                        hasCaution
                          ? "border-red-500/30 bg-red-950/20 text-red-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-300"
                      }`}
                    >
                      {hasCaution && <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />}
                      {matchedIng?.name || ingName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Description & Clinical Usage */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2 text-xs">
              <span className="text-zinc-400 font-medium block">Clinical Description</span>
              <p className="text-zinc-300 leading-relaxed">{reviewProduct.description}</p>

              <span className="text-zinc-400 font-medium block pt-2">Recommended Application Protocol</span>
              <p className="text-zinc-300 leading-relaxed">{reviewProduct.usage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reject Listing Application</h3>
            <p className="mt-1 text-xs text-zinc-400">
              State compliance or mapping reasons for rejecting this SKU.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Target parameter benefits lack clinical justification; contraindication missing..."
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

      {/* Sponsored Placement Modal */}
      {sponsoredModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {sponsoredModalProduct.sponsored ? "Remove Sponsored Flag" : "Configure Sponsored Placement"}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              All sponsored placements MUST remain clearly labelled across customer and diagnosis views.
            </p>

            <form onSubmit={handleToggleSponsored} className="mt-4 space-y-4">
              {!sponsoredModalProduct.sponsored && (
                <div>
                  <label className="text-xs font-medium text-zinc-300">Sponsor / Brand Partner Label</label>
                  <input
                    type="text"
                    required
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g., Dr. Meera Labs Official"
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSponsoredModalProduct(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  {sponsoredModalProduct.sponsored ? "Remove Flag" : "Apply Sponsored Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
