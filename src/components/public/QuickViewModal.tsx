"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Heart, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import type { Product } from "@/types";
import brandsData from "@/data/brands.json";
import ingredientsData from "@/data/ingredients.json";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: QuickViewModalProps) {
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isInWishlist = useAppStore((s) => s.isInWishlist);

  if (!product) return null;

  const brand = brandsData.find((b) => b.id === product.brandId);
  const wishlisted = isInWishlist(product.id);
  const discountedPrice = Math.round(product.mrp * 0.92);

  const handleWishlistClick = () => {
    const res = toggleWishlist(product.id);
    if (res.added) {
      toast.success(`${product.name} added to your wishlist.`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product.name}
      description={brand?.name || "Celebs Alley Formulation"}
      className="max-w-2xl bg-bg-surface border-gold-500/30 text-text-primary"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden border border-gold-500/20 bg-bg-elevated">
          <ImageWithFallback
            src={product.images[0] || ""}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                {brand?.name || "Luxury Cosmeceutical"}
              </span>
              <div className="flex items-center gap-1 text-xs text-gold-300 font-medium">
                <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-text-muted">({product.reviewCount})</span>
              </div>
            </div>

            <h3 className="text-lg font-heading font-bold text-text-primary mt-1">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-heading text-gold-300">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-text-muted line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                8% Off
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mt-3 line-clamp-3">
              {product.description}
            </p>

            {/* Target Parameter match indicators */}
            <div className="mt-4 pt-3 border-t border-gold-500/15">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-400 block mb-1.5">
                AI Target Parameter Synergy:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(product.targetParameters).map(([paramKey, score]) => {
                  const symbol = score === 3 ? "+++" : score === 2 ? "++" : score === 1 ? "+" : "−";
                  const isPositive = score > 0;
                  return (
                    <span
                      key={paramKey}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium capitalize border ${
                        isPositive
                          ? "bg-gold-500/15 border-gold-500/30 text-gold-300"
                          : "bg-bg-elevated border-border-subtle text-text-muted"
                      }`}
                    >
                      {paramKey.replace("_", " ")} {symbol}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Link href="/demo" className="flex-1" onClick={() => onOpenChange(false)}>
                <Button variant="gold" size="md" className="w-full justify-center text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Get My Match
                </Button>
              </Link>
              <button
                onClick={handleWishlistClick}
                aria-label="Toggle wishlist"
                className={`p-2.5 rounded-xl border transition-all ${
                  wishlisted
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                    : "bg-bg-elevated border-gold-500/30 text-gold-400 hover:bg-gold-500/15"
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>
            <Link
              href={`/shop/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="text-xs text-center block text-text-muted hover:text-gold-300 transition-colors pt-1"
            >
              View Full Product Dossier & Verified Sellers →
            </Link>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
