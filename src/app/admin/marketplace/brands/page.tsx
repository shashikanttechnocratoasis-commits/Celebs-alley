"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Building,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Globe,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import type { Brand } from "@/types";

export default function MarketplaceBrandsPage() {
  const { brands, products, addBrand, updateBrand, deleteBrand } = useAppStore();
  const { canEdit, canDelete } = useAdminPermission("brands");

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formOrigin, setFormOrigin] = useState("India");
  const [formDescription, setFormDescription] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive" | "archived">("active");
  const [formError, setFormError] = useState("");

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.origin.toLowerCase().includes(q);
      }
      return true;
    });
  }, [brands, searchQuery]);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormName("");
    setFormOrigin("India");
    setFormDescription("");
    setFormLogo("");
    setFormStatus("active");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormOrigin(brand.origin);
    setFormDescription(brand.description || "");
    setFormLogo(brand.logo || "");
    setFormStatus(brand.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Brand name is required.");
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: formName,
        origin: formOrigin,
        description: formDescription,
        logo: formLogo || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
        status: formStatus,
      });
    } else {
      addBrand({
        name: formName,
        origin: formOrigin,
        description: formDescription,
        logo: formLogo || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
        status: formStatus,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (brandId: string) => {
    const res = deleteBrand(brandId);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Beauty Brands Directory"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketplace", href: "/admin/marketplace/products" },
          { label: "Brands" },
        ]}
      />

      {/* Top Filter and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand name or origin country..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={!canEdit}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBrands.map((brand) => {
          const linkedCount = products.filter((p) => p.brandId === brand.id).length;
          return (
            <div
              key={brand.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md flex flex-col justify-between transition hover:border-zinc-700"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={brand.logo || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80"}
                      alt={brand.name}
                      className="h-12 w-12 rounded-xl object-cover border border-zinc-800"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{brand.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Globe className="h-3 w-3 text-zinc-500" /> {brand.origin}
                      </span>
                    </div>
                  </div>

                  {brand.status === "active" ? (
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      INACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">{brand.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-850 pt-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-mono">
                  <Package className="h-3.5 w-3.5 text-zinc-500" /> {linkedCount} Active Formulations
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    disabled={!canEdit}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    disabled={!canDelete}
                    title={linkedCount > 0 ? "Blocked: Referenced by active SKUs" : "Delete Brand"}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-white">
                {editingBrand ? "Edit Brand Record" : "Add Brand Record"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300">Brand Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Clinical Biome Labs"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Country of Origin</label>
                  <input
                    type="text"
                    required
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    placeholder="e.g., France, India, Korea"
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brand positioning and clinical ethos..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Brand Logo URL</label>
                <input
                  type="text"
                  value={formLogo}
                  onChange={(e) => setFormLogo(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
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
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
