"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Heart
} from "lucide-react";
import { useAppStore, HydratedCartItem } from "@/store";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/pricing";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { COMMERCE_CONFIG } from "@/config/commerce";

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    getHydratedCart,
    updateCartQuantity,
    removeFromCart,
    moveCartItemToWishlist,
    appliedCoupon,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hydratedItems = getHydratedCart();
  const itemCount = hydratedItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = hydratedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const freeShippingAway = COMMERCE_CONFIG.freeShippingThreshold - subtotal;

  return (
    <>
      {/* Backdrop */}
      {cartDrawerOpen && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
          onClick={() => setCartDrawerOpen(false)}
        />
      )}

      {/* Drawer Container (Side drawer on desktop/tablet, bottom sheet on mobile) */}
      <div
        className={`fixed z-50 bg-surface border-gold-400/20 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          cartDrawerOpen
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        } inset-x-0 bottom-0 md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-full md:max-w-md max-h-[90vh] md:max-h-full rounded-t-2xl md:rounded-none md:border-l border-t md:border-t-0`}
        aria-label="Shopping Cart Drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gold-400/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-cream-100 font-normal">
                Your Cosmeceutical Bag
              </h2>
              <p className="text-[11px] font-mono text-gold-400">
                {itemCount} {itemCount === 1 ? "Item" : "Items"} Curated
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-base/60 text-cream-400 hover:text-cream-100 flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-4 py-2.5 bg-base/60 border-b border-gold-400/10 text-xs text-cream-300 flex items-center justify-between">
          {freeShippingAway <= 0 ? (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Free Insulated Cold-Chain Delivery unlocked!
            </span>
          ) : (
            <span>
              Add <strong className="text-gold-400">{formatINR(freeShippingAway)}</strong> more for FREE delivery
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {hydratedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface border border-gold-400/20 flex items-center justify-center text-gold-400/40">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-base text-cream-100">Your bag is currently empty</p>
                <p className="text-xs text-cream-400 max-w-xs">
                  Discover cosmeceuticals clinically calibrated to your latest skin scan parameters.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="shadow-gold-glow mt-2"
                onClick={() => setCartDrawerOpen(false)}
              >
                <Link href="/app/shop?tab=for-you">
                  Browse Recommendations
                </Link>
              </Button>
            </div>
          ) : (
            hydratedItems.map((item) => (
              <div
                key={`${item.productId}-${item.sellerId}`}
                className="p-3.5 rounded-xl bg-base/50 border border-gold-400/15 flex gap-3.5 relative group"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-gold-400/20 bg-surface">
                  <ImageWithFallback
                    src={item.product.images[0] || ""}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-cream-100 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] text-cream-400 truncate mt-0.5">
                      Seller: <span className="text-cream-300 font-medium">{item.seller.company}</span>
                    </p>
                  </div>

                  {item.priceChanged && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Price updated by distributor
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-gold-400">
                        {formatINR(item.price)}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-cream-500 line-through">
                          {formatINR(item.mrp)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gold-400/25 rounded-md bg-surface/80">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-cream-300 hover:text-cream-100 text-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs text-cream-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        className="w-6 h-6 flex items-center justify-center text-cream-300 hover:text-cream-100 disabled:opacity-40 text-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions: Wishlist and Delete */}
                <div className="flex flex-col justify-between items-end pl-1">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-cream-500 hover:text-red-400 transition-colors p-1"
                    title="Remove item"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCartItemToWishlist(item.productId)}
                    className="text-cream-500 hover:text-gold-400 transition-colors p-1"
                    title="Save to wishlist"
                    aria-label={`Move ${item.product.name} to wishlist`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal & CTAs */}
        {hydratedItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gold-400/15 bg-base/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cream-300">Subtotal (Inclusive of GST)</span>
              <span className="font-mono text-base font-semibold text-cream-100">
                {formatINR(subtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                asChild
                variant="outline"
                className="w-full border-gold-400/30 text-xs"
                onClick={() => setCartDrawerOpen(false)}
              >
                <Link href="/app/cart">
                  View Full Bag
                </Link>
              </Button>
              <Button
                asChild
                className="w-full shadow-gold-glow text-xs"
                onClick={() => setCartDrawerOpen(false)}
              >
                <Link href="/app/checkout">
                  Checkout <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
