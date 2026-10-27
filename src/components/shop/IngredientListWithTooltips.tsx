"use client";

import React, { useState } from "react";
import { Info, AlertTriangle, ShieldCheck } from "lucide-react";
import ingredientsData from "@/data/ingredients.json";
import type { Ingredient } from "@/types";

interface IngredientListWithTooltipsProps {
  ingredientIds: string[];
}

export function IngredientListWithTooltips({ ingredientIds }: IngredientListWithTooltipsProps) {
  const [activeIngredient, setActiveIngredient] = useState<Ingredient | null>(null);

  const ingredientsList: Ingredient[] = ingredientIds
    .map((id) => (ingredientsData as Ingredient[]).find((ing) => ing.id === id))
    .filter(Boolean) as Ingredient[];

  if (ingredientsList.length === 0) {
    return <p className="text-xs text-cream-400">Pure clinical cosmeceutical formulation.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ingredientsList.map((ing) => {
          const hasCaution = ing.contraindications && ing.contraindications.length > 0;
          const isSelected = activeIngredient?.id === ing.id;

          return (
            <button
              key={ing.id}
              type="button"
              onClick={() => setActiveIngredient(isSelected ? null : ing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-gold-400/20 border-gold-400 text-gold-300 shadow-md"
                  : hasCaution
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/60"
                  : "bg-surface border-gold-400/20 text-cream-200 hover:border-gold-400/50"
              }`}
            >
              <span>{ing.name}</span>
              {hasCaution ? (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              ) : (
                <Info className="w-3 h-3 text-gold-400/60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Ingredient Detail Popover Card */}
      {activeIngredient && (
        <div className="p-4 rounded-xl bg-base/80 border border-gold-400/30 space-y-2.5 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-serif text-sm text-cream-100 font-medium">
                {activeIngredient.name}
              </h5>
              <p className="text-[11px] font-mono text-gold-400">
                INCI: {activeIngredient.inciName}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> Safety: {activeIngredient.safetyRating}/5
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-cream-400">Clinical Benefits:</span>
            <div className="flex flex-wrap gap-1.5">
              {(activeIngredient.benefits || []).map((b, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-surface text-[11px] text-cream-300 border border-gold-400/10">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {activeIngredient.contraindications && activeIngredient.contraindications.length > 0 && (
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Caution / Contraindication:</strong> {activeIngredient.contraindications.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
