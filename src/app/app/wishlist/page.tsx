"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { formatINR } from "@/lib/pricing";
import { toast } from "sonner";
import productsData from "@/data/products.json";
import type { Product } from "@/types";

export default function SavedRegimensWishlistPage() {
  const { wishlist, toggleWishlist, addToCart, setCartDrawerOpen, inventory } = useAppStore();

  const wishlistedProducts = useMemo(() => {
    return (productsData as unknown as Product[]).filter((p) => wishlist.includes(p.id));
  }, [wishlist]);

  const handleMoveToCart = (product: Product) => {
    // Check best offer in inventory
    const offers = inventory.filter((inv) => inv.productId === product.id && inv.stock > 0);
    const sellerId = offers[0]?.sellerId || "seller-1";
    const price = offers[0]?.price || Math.round(product.mrp * 0.92);

    addToCart(product, 1, sellerId, price);
    toggleWishlist(product.id);
    toast.success(`Moved ${product.name} to your bag`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
  };

  const handleShareWishlist = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Wishlist link copied to clipboard!");
    } else {
      toast.info("Share feature link copied");
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Saved Regimens & Wishlist"
          breadcrumbs={[{ label: "App", href: "/app" }, { label: "Wishlist" }]}
        />

        {wishlistedProducts.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareWishlist}
            className="border-gold-400/30 text-xs w-fit"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Wishlist
          </Button>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl bg-surface/60 border-gold-400/20 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/30 mx-auto flex items-center justify-center text-gold-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg text-cream-100 font-normal">
            Your Wishlist Is Empty
          </h3>
          <p className="text-xs text-cream-400 leading-relaxed">
            Save clinical cosmeceuticals to your wishlist while reviewing diagnostic scans.
          </p>
          <Button asChild className="shadow-gold-glow text-xs">
            <Link href="/app/shop?tab=for-you">Browse Recommendations</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => {
            const price = Math.round(product.mrp * 0.92);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between bg-surface/80 border border-gold-400/20 hover:border-gold-400/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg"
              >
                <div>
                  <div className="relative aspect-square w-full bg-base/60 overflow-hidden">
                    <ImageWithFallback
                      src={product.images[0] || ""}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-base/80 border border-gold-400/30 text-cream-300 hover:text-red-400 flex items-center justify-center transition-colors"
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cream-400">
                      <span>{product.sku}</span>
                      <div className="flex items-center gap-1 text-gold-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/app/shop/${product.id}`}
                      className="font-serif text-sm font-medium text-cream-100 hover:text-gold-300 transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>

                    <p className="text-xs text-cream-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between pt-2 border-t border-gold-400/10">
                    <span className="font-mono text-base font-bold text-gold-400">
                      {formatINR(price)}
                    </span>
                    <span className="text-xs text-cream-500 line-through">
                      {formatINR(product.mrp)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleMoveToCart(product)}
                    className="w-full shadow-gold-glow text-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Move to Bag
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
