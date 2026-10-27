"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ChevronRight,
  Truck,
  Store,
  Clock,
  Layers,
  Award,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Check
} from "lucide-react";
import { useAppStore } from "@/store";
import { generateRecommendations } from "@/lib/recommendEngine";
import { SellerComparisonTable } from "@/components/shop/SellerComparisonTable";
import { RecommendationBreakdown } from "@/components/shop/RecommendationBreakdown";
import { IngredientListWithTooltips } from "@/components/shop/IngredientListWithTooltips";
import { PincodeChecker } from "@/components/shop/PincodeChecker";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatINR } from "@/lib/pricing";
import { toast } from "sonner";
import categoriesData from "@/data/categories.json";
import brandsData from "@/data/brands.json";
import type { ProductRecommendation, Offer } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CustomerProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const {
    scans,
    currentScan,
    customerProfile,
    parameters,
    sellers,
    inventory,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setCartDrawerOpen,
    reviews,
  } = useAppStore();

  const productsData = useMemo(() => {
    return require("@/data/products.json");
  }, []);

  const product = productsData.find((p: any) => p.id === slug);

  const latestScan = scans && scans.length > 0 ? scans[0] : currentScan;

  // Run recommendation engine for this product
  const productRecommendation = useMemo<ProductRecommendation | null>(() => {
    if (!product) return null;
    const recs = generateRecommendations({
      scan: latestScan,
      questionnaire: customerProfile?.questionnaire,
      parameters,
      products: [product],
      sellers,
      inventory,
    });
    return recs.topPicks[0] || recs.avoidForYou[0] || null;
  }, [product, latestScan, customerProfile, parameters, sellers, inventory]);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Offers & Seller selection
  const offers = productRecommendation?.allOffers || [];
  const defaultSellerId = productRecommendation?.bestOffer?.sellerId || (offers[0]?.sellerId ?? "seller-1");
  const [selectedSellerId, setSelectedSellerId] = useState(defaultSellerId);

  const currentOffer = offers.find((o) => o.sellerId === selectedSellerId) || productRecommendation?.bestOffer || offers[0];

  const price = currentOffer ? currentOffer.price : Math.round((product?.mrp || 4500) * 0.92);
  const mrp = currentOffer ? currentOffer.mrp : product?.mrp || 4500;
  const availableStock = currentOffer ? currentOffer.availableStock : 10;
  const inStock = availableStock > 0;

  // Quantity Stepper
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Product reviews
  const productReviews = useMemo(() => {
    return reviews.filter((r) => r.productId === slug);
  }, [reviews, slug]);

  if (!product) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="font-serif text-2xl text-cream-100">Product Not Found</h2>
        <Button asChild variant="outline" className="border-gold-400/30">
          <Link href="/app/shop">Return to Boutique</Link>
        </Button>
      </div>
    );
  }

  const brand = brandsData.find((b: any) => b.id === product.brandId);
  const category = categoriesData.find((c: any) => c.id === product.categoryId);

  const handleAddToCart = () => {
    if (!inStock) {
      toast.info(`We will notify you when ${product.name} is back in stock!`);
      return;
    }

    setIsAdding(true);
    addToCart(product, quantity, currentOffer?.sellerId, price);

    setTimeout(() => {
      setIsAdding(false);
      toast.success(`Added ${quantity} × ${product.name} to your bag`, {
        action: {
          label: "View Cart",
          onClick: () => setCartDrawerOpen(true),
        },
      });
    }, 350);
  };

  const handleWishlistToggle = () => {
    const res = toggleWishlist(product.id);
    if (res.added) {
      toast.success("Saved to your Wishlist");
    } else {
      toast.info("Removed from Wishlist");
    }
  };

  return (
    <div className="space-y-8 pb-24 md:pb-16 max-w-7xl mx-auto">
      {/* Breadcrumbs & Back link */}
      <div className="flex items-center justify-between text-xs text-cream-400">
        <Link
          href="/app/shop"
          className="inline-flex items-center gap-1.5 text-cream-300 hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Boutique Recommendations
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 font-mono">
          <span>Shop</span>
          <ChevronRight className="w-3 h-3 text-gold-400/40" />
          <span className="text-gold-400">{category?.name || "Formulation"}</span>
        </div>
      </div>

      {/* Top Main Section: Gallery + Product Summary & Sticky Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4 h-fit">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-base/80 border border-gold-400/25 shadow-2xl">
            <ImageWithFallback
              src={product.images[selectedImageIndex] || product.images[0] || ""}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
            {productRecommendation && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-base/90 border border-gold-400/40 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-gold-300">
                  {productRecommendation.matchScore}% Clinical Match
                </span>
              </div>
            )}
            {product.sponsored && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                Sponsored
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-gold-400 scale-105 shadow-md"
                      : "border-gold-400/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Pincode Checker */}
          <PincodeChecker deliveryDays={currentOffer?.deliveryDays || 3} />
        </div>

        {/* Center: Details & Clinical Rationale (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider">
              <span>{brand?.name || "Haute Cosmeceutical"}</span>
              <span>•</span>
              <span>SKU: {product.sku}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-cream-100 font-normal leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1 text-gold-400 text-xs">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-cream-500">•</span>
              <span className="text-xs text-cream-400">
                {product.reviewCount} Clinical Ratings
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-cream-300/90 leading-relaxed">
            {product.description}
          </p>

          {/* Routine Step Badge */}
          {product.routineStep && (
            <div className="p-3 rounded-xl bg-base/60 border border-gold-400/20 text-xs flex items-center justify-between">
              <span className="text-cream-400 font-mono">Routine Position:</span>
              <span className="font-semibold text-gold-300 px-2.5 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/30">
                {product.routineStep}
              </span>
            </div>
          )}

          {/* Clinical Compatibility Breakdown */}
          {productRecommendation && (
            <RecommendationBreakdown
              matchScore={productRecommendation.matchScore}
              reasons={productRecommendation.reasons}
              parameterBreakdown={productRecommendation.parameterBreakdown}
            />
          )}

          {/* Ingredients with interactive tooltips */}
          <div className="space-y-2 pt-2">
            <h4 className="font-serif text-base text-cream-100 font-normal">
              Active Molecular Ingredients
            </h4>
            <IngredientListWithTooltips ingredientIds={product.ingredients} />
          </div>

          {/* Usage Instructions */}
          <div className="p-4 rounded-xl bg-surface/60 border border-gold-400/20 space-y-1.5 text-xs">
            <h5 className="font-mono text-gold-400 uppercase tracking-wider font-semibold">
              Clinical Usage Protocol
            </h5>
            <p className="text-cream-300 leading-relaxed">
              {product.usage}
            </p>
          </div>
        </div>

        {/* Right: Sticky Buy Box on Desktop (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <Card className="p-5 sm:p-6 bg-surface border-gold-400/30 shadow-2xl space-y-5">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-cream-400 uppercase">
                Selected Authorized Offer
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-gold-400">
                  {formatINR(price)}
                </span>
                {mrp > price && (
                  <span className="text-sm text-cream-500 line-through">
                    {formatINR(mrp)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-cream-400 flex items-center gap-1">
                <span>Inclusive of all GST taxes</span>
              </div>
            </div>

            {/* Seller snapshot */}
            <div className="p-3 rounded-xl bg-base/60 border border-gold-400/15 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-cream-400 shrink-0">Dispatched By:</span>
                <span className="font-medium text-cream-100 text-right truncate">{currentOffer?.company}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-cream-400 shrink-0">Transit Estimate:</span>
                <span className="text-gold-300 font-mono text-right">{currentOffer?.deliveryDays} business days</span>
              </div>
            </div>

            {/* Quantity Stepper limited by available stock */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-cream-400">
                <span>Quantity</span>
                <span className="text-[11px] font-mono">
                  {availableStock > 0 ? `${availableStock} available` : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center justify-between border border-gold-400/25 rounded-xl bg-base px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="w-8 h-8 flex items-center justify-center text-cream-300 hover:text-cream-100 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm font-semibold text-cream-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock || !inStock}
                  className="w-8 h-8 flex items-center justify-center text-cream-300 hover:text-cream-100 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || isAdding}
                className="w-full shadow-gold-glow text-xs"
              >
                {isAdding ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Added to Bag
                  </span>
                ) : !inStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleWishlistToggle}
                className="w-full border-gold-400/30 text-xs"
              >
                <Heart className={`w-3.5 h-3.5 mr-1.5 ${inWishlist ? "fill-current text-red-400" : ""}`} />
                {inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Seller Comparison Section */}
      <section className="pt-6 border-t border-gold-400/20">
        <SellerComparisonTable
          offers={offers}
          selectedSellerId={selectedSellerId}
          onSelectSeller={(id) => {
            setSelectedSellerId(id);
            toast.info("Selected distributor offer updated.");
          }}
        />
      </section>

      {/* Verified Reviews Section */}
      <section className="space-y-4 pt-6 border-t border-gold-400/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-cream-100 font-normal">
              Verified Client Clinical Reviews ({productReviews.length})
            </h3>
            <p className="text-xs text-cream-400">
              Evaluated by real clients following diagnostic formulation routines.
            </p>
          </div>
        </div>

        {productReviews.length === 0 ? (
          <div className="p-6 rounded-xl bg-base/50 border border-gold-400/15 text-center text-xs text-cream-400">
            No client reviews posted yet. Once delivered, you can rate this product.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-surface/70 border border-gold-400/15 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-cream-500 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
                <h5 className="font-medium text-cream-100 text-sm">{rev.title}</h5>
                <p className="text-cream-300 leading-relaxed">{rev.comment}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-cream-400">
                  <span className="font-medium text-cream-200">{rev.customerName}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sticky Bottom Bar on Mobile (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-gold-400/30 p-3 flex items-center justify-between gap-3 shadow-2xl safe-bottom">
        <div>
          <div className="text-[10px] text-cream-400 font-mono">Total Price</div>
          <div className="font-mono text-base font-bold text-gold-400">
            {formatINR(price * quantity)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleWishlistToggle}
            className="border-gold-400/30 px-3"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current text-red-400" : ""}`} />
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className="shadow-gold-glow text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" />
            {isAdding ? "Added" : inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
