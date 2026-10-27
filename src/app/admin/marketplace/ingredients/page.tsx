"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  FlaskConical,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Package,
  X,
  Tag,
} from "lucide-react";
import type { Ingredient } from "@/types";

export default function MarketplaceIngredientsPage() {
  const { ingredients, products, addIngredient, updateIngredient, deleteIngredient } = useAppStore();
  const { canEdit, canDelete } = useAdminPermission("ingredients");

  const [searchQuery, setSearchQuery] = useState("");
  const [cautionFilter, setCautionFilter] = useState<"all" | "flagged" | "safe">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formInciName, setFormInciName] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formContraindications, setFormContraindications] = useState("");
  const [formConcernTags, setFormConcernTags] = useState("");
  const [formSafetyRating, setFormSafetyRating] = useState(1);
  const [formError, setFormError] = useState("");

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const hasCaution = ing.contraindications && ing.contraindications.length > 0;
      if (cautionFilter === "flagged" && !hasCaution) return false;
      if (cautionFilter === "safe" && hasCaution) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ing.name.toLowerCase().includes(q) ||
          ing.inciName.toLowerCase().includes(q) ||
          (ing.benefits || []).some((b) => b.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [ingredients, cautionFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setFormName("");
    setFormInciName("");
    setFormBenefits("");
    setFormContraindications("");
    setFormConcernTags("");
    setFormSafetyRating(1);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setFormName(ing.name);
    setFormInciName(ing.inciName);
    setFormBenefits((ing.benefits || []).join(", "));
    setFormContraindications((ing.contraindications || []).join(", "));
    setFormConcernTags((ing.concernTags || []).join(", "));
    setFormSafetyRating(ing.safetyRating ?? 1);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formInciName.trim()) {
      setFormError("Ingredient name and INCI nomenclature are required.");
      return;
    }

    const benefitsArray = formBenefits
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    const contraArray = formContraindications
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const concernArray = formConcernTags
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (editingIngredient) {
      updateIngredient(editingIngredient.id, {
        name: formName,
        inciName: formInciName,
        benefits: benefitsArray,
        contraindications: contraArray,
        concernTags: concernArray,
        safetyRating: formSafetyRating,
      });
    } else {
      addIngredient({
        name: formName,
        inciName: formInciName,
        benefits: benefitsArray,
        contraindications: contraArray,
        concernTags: concernArray,
        safetyRating: formSafetyRating,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (ingId: string) => {
    const res = deleteIngredient(ingId);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="INCI Ingredient Safety & Contraindications"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketplace", href: "/admin/marketplace/products" },
          { label: "Ingredients" },
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
            placeholder="Search active ingredient, INCI name, or benefit..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={cautionFilter}
            onChange={(e) => setCautionFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Formulations</option>
            <option value="flagged">Flagged Contraindications</option>
            <option value="safe">Zero Contraindications</option>
          </select>

          <button
            onClick={handleOpenAdd}
            disabled={!canEdit}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add INCI Molecule
          </button>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Ingredient & INCI Nomenclature</th>
                <th className="px-4 py-3.5">EWG / Safety Score</th>
                <th className="px-4 py-3.5">Clinical Benefits</th>
                <th className="px-4 py-3.5">Contraindication Flags (Allergy Guard)</th>
                <th className="px-4 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredIngredients.map((ing) => {
                const linkedCount = products.filter((p) =>
                  p.ingredients.some(
                    (i) => i.toLowerCase() === ing.name.toLowerCase() || i === ing.id
                  )
                ).length;
                const hasContra = ing.contraindications && ing.contraindications.length > 0;

                return (
                  <tr key={ing.id} className="transition hover:bg-zinc-900/40">
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <span className="font-semibold text-white block">{ing.name}</span>
                        <span className="font-mono text-[11px] text-amber-400 italic">
                          {ing.inciName}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 block">{ing.id}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3" /> Grade {ing.safetyRating || 1}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(ing.benefits || []).map((b, i) => (
                          <span
                            key={i}
                            className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {hasContra ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ing.contraindications.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30"
                            >
                              <AlertTriangle className="h-2.5 w-2.5" /> {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          Universal biocompatible tolerance
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(ing)}
                          disabled={!canEdit}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ing.id)}
                          disabled={!canDelete}
                          title={
                            linkedCount > 0
                              ? "Blocked: Referenced by catalogue SKUs"
                              : "Delete Ingredient"
                          }
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-white">
                {editingIngredient ? "Edit INCI Molecule" : "Add Active Ingredient"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Common Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Niacinamide"
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Official INCI Name</label>
                  <input
                    type="text"
                    required
                    value={formInciName}
                    onChange={(e) => setFormInciName(e.target.value)}
                    placeholder="e.g., Nicotinamide"
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Clinical Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="e.g., Sebum regulation, Barrier strengthening, Pore tightening"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Contraindication Flags (comma-separated - feeds allergy guards)
                </label>
                <input
                  type="text"
                  value={formContraindications}
                  onChange={(e) => setFormContraindications(e.target.value)}
                  placeholder="e.g., Vitamin C high-dose conflict, Reactive flushing"
                  className="mt-1 w-full rounded-xl border border-red-500/30 bg-zinc-900 px-3 py-2 text-xs text-red-300 focus:border-red-500 focus:outline-none"
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
                  Save Molecule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
