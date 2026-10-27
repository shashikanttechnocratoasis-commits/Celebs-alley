"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  Truck
} from "lucide-react";
import { useAppStore } from "@/store";
import { TiltCard } from "@/components/ui/TiltCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { formatINR } from "@/lib/pricing";
import { toast } from "sonner";
import type { ProductRecommendation } from "@/types";

interface ProductCardProps {
  recommendation: ProductRecommendation;
  onQuickView?: (product: ProductRecommendation) => void;
  showMatchScore?: boolean;
}

export function ProductCard({
  recommendation,
  onQuickView,
  showMatchScore = true,
}: ProductCardProps) {
  const { product, matchScore, reasons, bestOffer, allOffers, isSponsored, inStock } = recommendation;
  const { addToWishlist, isInWishlist, toggleWishlist, addToCart, setCartDrawerOpen } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const price = bestOffer ? bestOffer.price : Math.round(product.mrp * 0.92);
  const mrp = bestOffer ? bestOffer.mrp : product.mrp;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const sellerCount = allOffers.length;
  const availableStock = bestOffer ? bestOffer.availableStock : inStock ? 10 : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || availableStock <= 0) {
      toast.info(`We'll notify you when ${product.name} is back in stock!`);
      return;
    }

    setIsAdding(true);
    addToCart(product, 1, bestOffer?.sellerId, price);

    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${product.name} added to your bag`, {
        action: {
          label: "View Cart",
          onClick: () => setCartDrawerOpen(true),
        },
      });
    }, 400);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleWishlist(product.id);
    if (res.added) {
      toast.success(`Saved to your Wishlist`);
    } else {
      toast.info(`Removed from Wishlist`);
    }
  };

  const CardContent = (
    <div className="group relative flex flex-col h-full bg-surface/90 hover:bg-surface border border-gold-400/20 hover:border-gold-400/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-gold-glow/20">
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full bg-base/60 overflow-hidden">
        <ImageWithFallback
          src={product.images[0] || ""}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {/* Match Score Badge Ring */}
            {showMatchScore && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-base/90 border border-gold-400/40 backdrop-blur-md shadow-md">
                <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-gold-300">
                  {matchScore}% Match
                </span>
              </div>
            )}

            {/* Sponsored Badge */}
            {isSponsored && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono uppercase tracking-wider text-amber-300 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" /> Sponsored
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              inWishlist
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-base/80 border border-gold-400/25 text-cream-300 hover:text-gold-300 hover:bg-base"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Stock Badge on Image */}
        <div className="absolute bottom-2.5 left-2.5">
          {!inStock || availableStock <= 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-500/30 text-red-300 text-[10px] font-mono">
              Out of stock
            </span>
          ) : availableStock <= 4 ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
              Only {availableStock} left
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" /> In stock
            </span>
          )}
        </div>

        {/* Quick View Trigger on Hover (Desktop) */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(recommendation);
              }}
              className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-surface border border-gold-400/50 text-cream-100 text-xs font-medium hover:border-gold-300 flex items-center gap-1.5 shadow-xl transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-gold-400" /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-cream-400 font-mono uppercase tracking-wider">
            <span>{product.sku}</span>
            <div className="flex items-center gap-1 text-gold-400 font-sans">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-cream-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-sm sm:text-base text-cream-100 font-medium line-clamp-2 group-hover:text-gold-200 transition-colors">
            {product.name}
          </h3>

          {/* Top 2 Real-Data Reason Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {reasons.slice(0, 2).map((reason, idx) => (
              <span
                key={idx}
                className={`text-[10px] px-2 py-0.5 rounded-full border truncate max-w-full ${
                  reason.type === "positive"
                    ? "bg-gold-400/10 border-gold-400/25 text-gold-300"
                    : reason.type === "caution"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-surface/80 border-surface-border text-cream-400"
                }`}
                title={reason.label}
              >
                {reason.label}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gold-400/10 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-base sm:text-lg font-bold text-gold-400">
                {formatINR(price)}
              </span>
              {mrp > price && (
                <span className="text-xs text-cream-500 line-through">
                  {formatINR(mrp)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Seller count & Delivery indicator */}
          <div className="flex items-center justify-between text-[11px] text-cream-400">
            <span>
              {sellerCount > 1 ? `From ${sellerCount} sellers` : bestOffer?.company || "Authorized seller"}
            </span>
            {bestOffer && (
              <span className="flex items-center gap-1 text-[10px] text-cream-300">
                <Truck className="w-3 h-3 text-gold-400" /> {bestOffer.deliveryDays}d delivery
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || availableStock <= 0 || isAdding}
            size="sm"
            className={`w-full shadow-gold-glow text-xs ${
              !inStock || availableStock <= 0 ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isAdding ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 animate-bounce" /> Added to Bag
              </span>
            ) : !inStock || availableStock <= 0 ? (
              <span>Notify Me</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Link href={`/app/shop/${product.id}`} className="block h-full focus:outline-none">
      {/* On desktop wrap in TiltCard for luxury 3D lift */}
      <div className="hidden lg:block h-full">
        <TiltCard maxTilt={5} className="h-full">
          {CardContent}
        </TiltCard>
      </div>
      {/* On mobile and tablet render regular card */}
      <div className="block lg:hidden h-full">
        {CardContent}
      </div>
    </Link>
  );
}
