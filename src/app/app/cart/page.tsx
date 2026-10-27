"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Store,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useAppStore, HydratedCartItem } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import {
  formatINR,
  calculateShippingFee,
  calculateCouponDiscount,
  calculateItemTax,
} from "@/lib/pricing";
import { COMMERCE_CONFIG } from "@/config/commerce";
import { toast } from "sonner";
import couponsData from "@/data/coupons.json";
import type { Coupon } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    getHydratedCart,
    updateCartQuantity,
    removeFromCart,
    moveCartItemToWishlist,
    changeSellerInCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    inventory,
    sellers,
    scans,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [changeSellerItem, setChangeSellerItem] = useState<HydratedCartItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hydratedItems = useMemo(() => {
    return mounted ? getHydratedCart() : [];
  }, [mounted, cart, getHydratedCart]);

  // Group items by Seller (Marketplace grouping)
  const itemsBySeller = useMemo(() => {
    const map = new Map<string, { seller: any; items: HydratedCartItem[] }>();
    hydratedItems.forEach((item) => {
      const existing = map.get(item.sellerId) || { seller: item.seller, items: [] };
      existing.items.push(item);
      map.set(item.sellerId, existing);
    });
    return Array.from(map.values());
  }, [hydratedItems]);

  // Totals calculations
  const rawSubtotal = hydratedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Validate coupon against subtotal
  const couponResult = calculateCouponDiscount(appliedCoupon, rawSubtotal);
  const discountAmount = couponResult.discount;

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const shippingFee = calculateShippingFee(subtotalAfterDiscount);

  // Tax calculation (Inclusive)
  let totalTax = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  hydratedItems.forEach((it) => {
    const itemTotal = it.price * it.quantity;
    const tax = calculateItemTax(itemTotal, it.taxRate, false);
    totalTax += tax.totalTax;
    totalCgst += tax.cgst;
    totalSgst += tax.sgst;
  });

  const finalTotal = subtotalAfterDiscount + shippingFee;
  const freeShippingAway = COMMERCE_CONFIG.freeShippingThreshold - subtotalAfterDiscount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);

    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    // Check against seed coupons
    const match = (couponsData as Coupon[]).find(
      (c) => c.code.toUpperCase() === code
    );

    if (!match) {
      setCouponError("Invalid coupon code. Try LUXEGOLD20 or FIRST500");
      return;
    }

    if (match.status !== "active") {
      setCouponError(`Coupon ${code} has expired.`);
      return;
    }

    if (rawSubtotal < match.minOrderValue) {
      setCouponError(
        `Minimum order of ${formatINR(match.minOrderValue)} required to apply ${code}.`
      );
      return;
    }

    const res = applyCoupon(code);
    if (res.success) {
      toast.success(res.message);
      setCouponCodeInput("");
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed");
  };

  if (!mounted) {
    return (
      <div className="py-20 text-center text-xs font-mono text-gold-400 animate-pulse">
        Hydrating Luxury Bag...
      </div>
    );
  }

  // Available alternative offers for Change Seller modal
  const alternativeOffers = changeSellerItem
    ? inventory
        .filter((inv) => inv.productId === changeSellerItem.productId)
        .map((inv) => {
          const seller = sellers.find((s) => s.id === inv.sellerId);
          return {
            sellerId: inv.sellerId,
            sellerName: seller?.company || "Distributor",
            price: inv.price,
            stock: inv.stock - (inv.reserved || 0),
            deliveryDays: seller?.deliveryDays || 3,
            city: seller?.city || "Mumbai",
          };
        })
    : [];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <PageHeader
        title="Your Curated Shopping Bag"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Cart" }]}
      />

      {hydratedItems.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center rounded-2xl bg-surface/70 border-gold-400/20 max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-full bg-gold-400/10 border border-gold-400/30 mx-auto flex items-center justify-center text-gold-400 shadow-gold-glow">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-cream-100 font-normal">
              Your Shopping Bag Is Empty
            </h2>
            <p className="text-xs sm:text-sm text-cream-300/80 leading-relaxed">
              Explore cosmeceuticals tailored to your skin score, or browse our luxury formulations.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button asChild className="shadow-gold-glow text-xs">
              <Link href="/app/shop?tab=for-you">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Recommended For You
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gold-400/30 text-xs">
              <Link href="/app/shop?tab=all">Browse All Products</Link>
            </Button>
          </div>
        </Card>
      ) : (
        /* Populated Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Items grouped by Seller (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Alert Banner */}
            <div className="p-4 rounded-xl bg-surface/90 border border-gold-400/20 text-xs flex items-center justify-between">
              {freeShippingAway <= 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Free temperature-controlled insulated courier delivery unlocked!</span>
                </div>
              ) : (
                <div className="text-cream-300">
                  Add <strong className="text-gold-400">{formatINR(freeShippingAway)}</strong> more for <strong>FREE Insulated Delivery</strong>
                </div>
              )}
              <span className="font-mono text-[11px] text-cream-400 hidden sm:inline">
                Threshold: {formatINR(COMMERCE_CONFIG.freeShippingThreshold)}
              </span>
            </div>

            {/* Seller Grouped Cards */}
            {itemsBySeller.map(({ seller, items }) => (
              <Card
                key={seller.id}
                className="p-5 sm:p-6 bg-surface/80 border-gold-400/20 shadow-xl space-y-5"
              >
                {/* Seller Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gold-400/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm sm:text-base text-cream-100 font-medium">
                        Shipment from {seller.company}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-cream-400 font-mono">
                        <span>Dispatch from {seller.city}, {seller.state}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gold-400">
                          <Truck className="w-3 h-3" /> {seller.deliveryDays} Days Transit
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-base/60 text-[10px] font-mono text-cream-400 border border-gold-400/15">
                    Authorized Seller
                  </span>
                </div>

                {/* Seller Items */}
                <div className="divide-y divide-gold-400/10">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gold-400/20 bg-base">
                          <ImageWithFallback
                            src={item.product.images[0] || ""}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <Link
                            href={`/app/shop/${item.product.id}`}
                            className="text-xs sm:text-sm font-medium text-cream-100 hover:text-gold-300 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-cream-400">
                            <span>SKU: {item.product.sku}</span>
                            {item.priceChanged && (
                              <span className="text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Price Updated
                              </span>
                            )}
                          </div>

                          {/* Change Seller Button */}
                          <button
                            type="button"
                            onClick={() => setChangeSellerItem(item)}
                            className="text-[11px] text-gold-400 hover:underline flex items-center gap-1 pt-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Change Seller Offer
                          </button>
                        </div>
                      </div>

                      {/* Quantity & Price Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gold-400/10">
                        {/* Stepper */}
                        <div className="flex items-center border border-gold-400/25 rounded-lg bg-base">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-cream-300 hover:text-cream-100 text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-semibold text-cream-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            className="w-7 h-7 flex items-center justify-center text-cream-300 hover:text-cream-100 disabled:opacity-30 text-xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-mono text-sm sm:text-base font-bold text-gold-400">
                            {formatINR(item.price * item.quantity)}
                          </div>
                          {item.mrp > item.price && (
                            <div className="text-[11px] text-cream-500 line-through">
                              {formatINR(item.mrp * item.quantity)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 pl-2">
                          <button
                            type="button"
                            onClick={() => moveCartItemToWishlist(item.productId)}
                            className="p-1.5 rounded-lg hover:bg-base text-cream-400 hover:text-gold-400 transition-colors"
                            title="Move to Wishlist"
                            aria-label="Save to wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="p-1.5 rounded-lg hover:bg-base text-cream-400 hover:text-red-400 transition-colors"
                            title="Remove Item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button asChild variant="outline" size="sm" className="border-gold-400/30 text-xs">
                <Link href="/app/shop">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Coupon Box & Order Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Box Card */}
            <Card className="p-5 bg-surface/90 border-gold-400/25 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cream-300">
                <Tag className="w-3.5 h-3.5 text-gold-400" />
                <span>Luxury Privilege Coupon</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-400/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gold-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{appliedCoupon.code}</span>
                    </div>
                    <p className="text-[11px] text-emerald-400">
                      Savings applied: {formatINR(discountAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-cream-400 hover:text-red-400 font-mono underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="e.g. LUXEGOLD20"
                      className="flex-1 h-9 px-3 text-xs uppercase bg-base border border-gold-400/25 rounded-lg text-cream-100 placeholder:text-cream-500 font-mono focus:outline-none focus:border-gold-400"
                    />
                    <Button type="submit" size="sm" className="h-9 px-4 text-xs shadow-gold-glow">
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 pt-0.5">
                      <AlertTriangle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  <p className="text-[10px] text-cream-400">
                    Try <strong>LUXEGOLD20</strong> (20% off over ₹5,000) or <strong>FIRST500</strong> (₹500 off)
                  </p>
                </form>
              )}
            </Card>

            {/* Price Summary Breakdown Card */}
            <Card className="p-5 sm:p-6 bg-surface border-gold-400/30 shadow-2xl space-y-4">
              <h3 className="font-serif text-lg text-cream-100 font-normal pb-3 border-b border-gold-400/15">
                Summary & Taxes
              </h3>

              <div className="space-y-2.5 text-xs text-cream-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal (MRP inclusive)</span>
                  <span className="font-mono text-cream-100">{formatINR(rawSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Coupon Savings</span>
                    <span className="font-mono">-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Insulated Cold-Chain Delivery</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-400">FREE</strong>
                    ) : (
                      formatINR(shippingFee)
                    )}
                  </span>
                </div>

                {/* GST Itemized Breakdown */}
                <div className="pt-2 border-t border-gold-400/10 space-y-1 text-[11px] text-cream-400">
                  <div className="flex items-center justify-between">
                    <span>Estimated CGST (Central Tax)</span>
                    <span className="font-mono">{formatINR(totalCgst)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated SGST (State Tax)</span>
                    <span className="font-mono">{formatINR(totalSgst)}</span>
                  </div>
                  <p className="text-[10px] text-cream-500 italic pt-0.5">
                    *GST included in product retail price. Demo computation.
                  </p>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-gold-400/20 flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-base text-cream-100 font-medium">Grand Total</span>
                  <div className="text-[10px] font-mono text-cream-400">Inclusive of all duties</div>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-gold-400">
                  {formatINR(finalTotal)}
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Button asChild size="lg" className="w-full shadow-gold-glow text-xs uppercase tracking-wider py-4 mt-2">
                <Link href="/app/checkout">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Change Seller Modal */}
      {changeSellerItem && (
        <ResponsiveDialog
          open={Boolean(changeSellerItem)}
          onOpenChange={(open) => !open && setChangeSellerItem(null)}
          title="Select Authorized Distributor"
          description={`Choose a different seller for ${changeSellerItem.product.name}`}
        >
          <div className="space-y-3 py-2">
            {alternativeOffers.map((offer) => {
              const isCurrent = offer.sellerId === changeSellerItem.sellerId;
              const hasStock = offer.stock > 0;

              return (
                <div
                  key={offer.sellerId}
                  onClick={() => {
                    if (hasStock) {
                      changeSellerInCart(changeSellerItem.productId, offer.sellerId);
                      setChangeSellerItem(null);
                      toast.success(`Seller switched to ${offer.sellerName}`);
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isCurrent
                      ? "bg-gold-400/10 border-gold-400 text-cream-100"
                      : hasStock
                      ? "bg-base/60 border-gold-400/20 hover:border-gold-400/40 text-cream-200"
                      : "opacity-40 border-gold-400/10 cursor-not-allowed"
                  }`}
                >
                  <div className="space-y-0.5 text-xs">
                    <div className="font-medium text-cream-100 flex items-center gap-1.5">
                      <span>{offer.sellerName}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gold-400 text-base font-bold">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-cream-400">
                      Location: {offer.city} • Delivery: {offer.deliveryDays} business days
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-mono text-sm font-semibold text-gold-400">
                      {formatINR(offer.price)}
                    </div>
                    <div className={`text-[10px] font-mono ${hasStock ? "text-emerald-400" : "text-red-400"}`}>
                      {hasStock ? `${offer.stock} in stock` : "Out of stock"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ResponsiveDialog>
      )}
    </div>
  );
}
