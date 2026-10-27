"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Sparkles, 
  Camera, 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Check, 
  ShoppingBag,
  Layers,
  HeartHandshake
} from "lucide-react";
import { useAppStore } from "@/store";
import { generateRecommendations } from "@/lib/recommendEngine";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { QuickViewModal } from "@/components/public/QuickViewModal";
import categoriesData from "@/data/categories.json";
import brandsData from "@/data/brands.json";
import type { ProductRecommendation } from "@/types";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    scans,
    currentScan,
    customerProfile,
    parameters,
    sellers,
    inventory,
  } = useAppStore();

  const initialProducts = useMemo(() => {
    // Read from products.json
    return require("@/data/products.json");
  }, []);

  // Determine latest scan
  const latestScan = scans && scans.length > 0 ? scans[0] : currentScan;
  const hasScan = Boolean(latestScan);

  // Tab: "for-you" or "all"
  const defaultTab = hasScan ? "for-you" : "all";
  const activeTab = searchParams.get("tab") || defaultTab;

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [selectedSkinType, setSelectedSkinType] = useState(searchParams.get("skinType") || "");
  const [selectedMinRating, setSelectedMinRating] = useState<number>(
    Number(searchParams.get("rating")) || 0
  );
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "match");
  const [avoidSectionOpen, setAvoidSectionOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductRecommendation | null>(null);

  // Debounced search sync to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set("q", searchQuery);
      else params.delete("q");

      if (selectedCategory) params.set("category", selectedCategory);
      else params.delete("category");

      if (selectedBrand) params.set("brand", selectedBrand);
      else params.delete("brand");

      if (selectedSkinType) params.set("skinType", selectedSkinType);
      else params.delete("skinType");

      if (selectedMinRating > 0) params.set("rating", String(selectedMinRating));
      else params.delete("rating");

      if (inStockOnly) params.set("inStock", "true");
      else params.delete("inStock");

      if (sortBy && sortBy !== "match") params.set("sort", sortBy);
      else params.delete("sort");

      params.set("tab", activeTab);

      router.replace(`/app/shop?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedSkinType,
    selectedMinRating,
    inStockOnly,
    sortBy,
    activeTab,
  ]);

  // Compute recommendations dynamically
  const recommendations = useMemo(() => {
    return generateRecommendations({
      scan: latestScan,
      questionnaire: customerProfile?.questionnaire,
      parameters,
      products: initialProducts,
      sellers,
      inventory,
    });
  }, [
    latestScan,
    customerProfile?.questionnaire,
    parameters,
    initialProducts,
    sellers,
    inventory,
  ]);

  // All products ranked list for filtering
  const filteredAllProducts = useMemo(() => {
    let list = [...recommendations.topPicks, ...recommendations.avoidForYou];
    // Remove duplicates
    const seen = new Set<string>();
    list = list.filter((item) => {
      if (seen.has(item.productId)) return false;
      seen.add(item.productId);
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (it) =>
          it.product.name.toLowerCase().includes(q) ||
          it.product.description.toLowerCase().includes(q) ||
          it.product.sku.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((it) => it.product.categoryId === selectedCategory);
    }

    if (selectedBrand) {
      list = list.filter((it) => it.product.brandId === selectedBrand);
    }

    if (selectedSkinType) {
      list = list.filter((it) =>
        it.product.suitableSkinTypes.some((st) =>
          st.toLowerCase().includes(selectedSkinType.toLowerCase()) || st === "All"
        )
      );
    }

    if (selectedMinRating > 0) {
      list = list.filter((it) => it.product.rating >= selectedMinRating);
    }

    if (inStockOnly) {
      list = list.filter((it) => it.inStock);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "price_asc") {
        const pA = a.bestOffer?.price || 999999;
        const pB = b.bestOffer?.price || 999999;
        return pA - pB;
      }
      if (sortBy === "price_desc") {
        const pA = a.bestOffer?.price || 0;
        const pB = b.bestOffer?.price || 0;
        return pB - pA;
      }
      if (sortBy === "rating") {
        return b.product.rating - a.product.rating;
      }
      // default: match score
      return b.matchScore - a.matchScore;
    });

    return list;
  }, [
    recommendations,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedSkinType,
    selectedMinRating,
    inStockOnly,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSkinType("");
    setSelectedMinRating(0);
    setInStockOnly(false);
    setSortBy("match");
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedBrand ||
    selectedSkinType ||
    selectedMinRating > 0 ||
    inStockOnly ||
    sortBy !== "match"
  );

  // Formatted scan date
  const scanDateFormatted = latestScan
    ? new Date(latestScan.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Personalized Cosmeceutical Boutique"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Shop" }]}
      />

      {/* Top Hero Strip: Latest Diagnostic Summary */}
      {hasScan ? (
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-surface via-surface/90 to-base border-gold-400/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-gold-400 font-semibold uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Recommended For You
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-cream-100 font-normal">
                Calibrated to your Scan of {scanDateFormatted}
              </h2>
              <p className="text-xs sm:text-sm text-cream-300/80 leading-relaxed">
                Formulations matched against your 8 cellular skin parameters with verified clinical compatibility.
              </p>

              {/* Top 3 Concerns as Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-cream-400">Targeting:</span>
                {latestScan?.topConcerns.slice(0, 3).map((concern, idx) => (
                  <span
                    key={concern.parameterId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-xs font-medium text-gold-300"
                  >
                    <span>#{idx + 1} {concern.name}</span>
                    <span className="font-mono text-[10px] text-cream-400">({concern.score}/100)</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild size="sm" variant="outline" className="border-gold-400/30 text-xs">
                <Link href={`/app/results/${latestScan?.id}`}>
                  View Diagnostic Report
                </Link>
              </Button>
              <Button asChild size="sm" className="shadow-gold-glow text-xs">
                <Link href="/app/scan">
                  <Camera className="w-3.5 h-3.5 mr-1.5" /> Retake Face Scan
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Fallback Banner for customer without scan */
        <Card className="p-6 bg-gradient-to-r from-surface via-surface/95 to-base border-gold-400/30 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 text-xs font-mono text-gold-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Unlock Personalized Precision
            </div>
            <h3 className="font-serif text-xl text-cream-100 font-normal">
              Take an AI Skin Diagnostic Scan for Custom Formulations
            </h3>
            <p className="text-xs sm:text-sm text-cream-300/80 max-w-xl">
              You are currently browsing the general catalog. Complete a 30-second 8-parameter facial analysis to see precision compatibility scores and ingredient warnings.
            </p>
          </div>
          <Button asChild className="shrink-0 shadow-gold-glow text-xs">
            <Link href="/app/scan">
              <Camera className="w-3.5 h-3.5 mr-1.5" /> Start Free Skin Scan
            </Link>
          </Button>
        </Card>
      )}

      {/* Tabs Header: For You vs All Products */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-3">
        <div className="flex items-center gap-2">
          {hasScan && (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", "for-you");
                router.replace(`/app/shop?${params.toString()}`);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "for-you"
                  ? "bg-gold-400 text-base font-semibold shadow-gold-glow"
                  : "bg-surface/80 text-cream-300 hover:text-cream-100 border border-gold-400/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" /> For You (Diagnostic Regimen)
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("tab", "all");
              router.replace(`/app/shop?${params.toString()}`);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-gold-400 text-base font-semibold shadow-gold-glow"
                : "bg-surface/80 text-cream-300 hover:text-cream-100 border border-gold-400/20"
            }`}
          >
            All Cosmeceuticals ({initialProducts.length})
          </button>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-gold-400/30 text-xs flex items-center justify-center gap-1.5"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter className="w-3.5 h-3.5" /> Filters & Sort {hasActiveFilters && "•"}
          </Button>
        </div>
      </div>

      {/* Main Layout Container */}
      {activeTab === "for-you" ? (
        /* FOR YOU PERSONALIZED VIEW */
        <div className="space-y-12">
          {/* 1. Top Picks For You */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-cream-100 font-normal">
                  Top Picks For Your Biometrics
                </h3>
                <p className="text-xs text-cream-400">
                  Highest compatibility cosmeceuticals targeting your deficient parameters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommendations.topPicks.map((rec) => (
                <ProductCard
                  key={rec.productId}
                  recommendation={rec}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </section>

          {/* 2. Build Your Routine (5 Steps: Cleanser, Serum, Moisturizer, Sunscreen, Treatment) */}
          <section className="space-y-5 p-6 rounded-2xl bg-surface/70 border border-gold-400/20 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-gold-400 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" /> Curated 5-Step Routine
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-cream-100 font-normal mt-0.5">
                  Build Your Daily Circadian Regimen
                </h3>
                <p className="text-xs text-cream-400">
                  One clinical product selected per step to complete your synergistic daily regimen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(
                [
                  { step: "Cleanser", key: "cleanser", rec: recommendations.routine.cleanser },
                  { step: "Serum", key: "serum", rec: recommendations.routine.serum },
                  { step: "Moisturizer", key: "moisturizer", rec: recommendations.routine.moisturizer },
                  { step: "Sunscreen", key: "sunscreen", rec: recommendations.routine.sunscreen },
                  { step: "Treatment", key: "treatment", rec: recommendations.routine.treatment },
                ] as const
              ).map(({ step, key, rec }) => (
                <div key={key} className="space-y-2 flex flex-col">
                  <div className="px-3 py-1 rounded-lg bg-base border border-gold-400/20 text-center font-mono text-xs text-gold-300 font-semibold uppercase tracking-wider">
                    {step}
                  </div>
                  {rec ? (
                    <div className="flex-1">
                      <ProductCard
                        recommendation={rec}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-base/50 border border-gold-400/10 text-center text-xs text-cream-500 h-full flex items-center justify-center">
                      Step formulation optional
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Targets Your Top Concerns (One row per top concern) */}
          {recommendations.concernTargets.map((concernGroup) => (
            <section key={concernGroup.parameterId} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-cream-100 font-normal flex items-center gap-2">
                    <span>Targeting: {concernGroup.concernName}</span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-gold-400/15 text-gold-300 border border-gold-400/30">
                      Score: {concernGroup.userScore}/100
                    </span>
                  </h3>
                  <p className="text-xs text-cream-400">
                    Formulations with active ingredients clinically calibrated for this biomarker.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {concernGroup.products.map((rec) => (
                  <ProductCard
                    key={rec.productId}
                    recommendation={rec}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* 4. Avoid For You (Hard Excluded, shown collapsed) */}
          {recommendations.avoidForYou.length > 0 && (
            <section className="rounded-2xl border border-red-500/30 bg-red-950/10 p-5 space-y-4">
              <button
                type="button"
                onClick={() => setAvoidSectionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <div>
                    <h4 className="font-serif text-base text-cream-100 font-medium">
                      Formulations Excluded For You ({recommendations.avoidForYou.length})
                    </h4>
                    <p className="text-xs text-cream-400">
                      Excluded due to noted sensitivities, contraindications, or pregnancy guidelines.
                    </p>
                  </div>
                </div>
                {avoidSectionOpen ? (
                  <ChevronUp className="w-5 h-5 text-cream-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cream-400" />
                )}
              </button>

              {avoidSectionOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-red-500/20">
                  {recommendations.avoidForYou.map((rec) => (
                    <div
                      key={rec.productId}
                      className="p-4 rounded-xl bg-base border border-red-500/20 space-y-2 text-xs"
                    >
                      <h5 className="font-medium text-cream-100 truncate">{rec.product.name}</h5>
                      <p className="text-[11px] text-red-300 bg-red-950/40 p-2 rounded border border-red-500/20">
                        {rec.exclusionReason || "Contraindicated for your diagnostic profile"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        /* ALL PRODUCTS VIEW WITH RESPONSIVE FILTERS */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar (1 col) */}
          <div className="hidden lg:block space-y-6">
            <div className="p-5 rounded-2xl bg-surface/80 border border-gold-400/20 space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-gold-400/15">
                <span className="font-serif text-base text-cream-100 font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gold-400" /> Catalog Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-mono text-gold-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-cream-400 uppercase">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ingredients, name..."
                    className="w-full h-9 pl-8 pr-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                  <Search className="w-3.5 h-3.5 text-cream-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-cream-400 uppercase">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100 focus:outline-none focus:border-gold-400"
                >
                  <option value="">All Categories</option>
                  {(categoriesData as any[]).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-cream-400 uppercase">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100 focus:outline-none focus:border-gold-400"
                >
                  <option value="">All Brands</option>
                  {(brandsData as any[]).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skin Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-cream-400 uppercase">Skin Type</label>
                <select
                  value={selectedSkinType}
                  onChange={(e) => setSelectedSkinType(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100 focus:outline-none focus:border-gold-400"
                >
                  <option value="">Any Skin Type</option>
                  <option value="Dry">Dry</option>
                  <option value="Combination">Combination</option>
                  <option value="Oily">Oily</option>
                  <option value="Sensitive">Sensitive</option>
                  <option value="Mature">Mature</option>
                </select>
              </div>

              {/* In Stock Only Checkbox */}
              <label className="flex items-center gap-2 text-xs text-cream-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-gold-400 w-3.5 h-3.5 rounded"
                />
                <span>In-Stock Only</span>
              </label>

              {/* Sort By */}
              <div className="space-y-1.5 pt-2 border-t border-gold-400/15">
                <label className="text-[11px] font-mono text-cream-400 uppercase">Sort Order</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100 focus:outline-none focus:border-gold-400"
                >
                  <option value="match">Best Clinical Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid Area (3 cols desktop, 2 tablet, 1 mobile) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center justify-between text-xs text-cream-400">
              <span>
                Showing <strong>{filteredAllProducts.length}</strong> cosmeceuticals
              </span>
            </div>

            {filteredAllProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-surface/50 border border-gold-400/15 space-y-3">
                <ShoppingBag className="w-12 h-12 text-gold-400/30 mx-auto" />
                <h4 className="font-serif text-lg text-cream-100">No products match your criteria</h4>
                <p className="text-xs text-cream-400">Try adjusting your filters or search keywords.</p>
                <Button size="sm" variant="outline" onClick={clearFilters} className="border-gold-400/30 text-xs">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAllProducts.map((rec) => (
                  <ProductCard
                    key={rec.productId}
                    recommendation={rec}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filter Responsive Bottom Sheet */}
      <ResponsiveDialog
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        title="Filter & Sort"
        description="Filter products by formulation, price and availability"
      >
        <div className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs text-cream-400 font-mono">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100"
            >
              <option value="">All Categories</option>
              {(categoriesData as any[]).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-xs text-cream-400 font-mono">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-base border border-gold-400/25 rounded-lg text-cream-100"
            >
              <option value="match">Best Clinical Match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-cream-200">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-gold-400 w-4 h-4 rounded"
            />
            <span>In-Stock Only</span>
          </label>

          <div className="pt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-gold-400/30 text-xs"
              onClick={() => {
                clearFilters();
                setMobileFilterOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              className="flex-1 shadow-gold-glow text-xs"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct.product}
          open={Boolean(quickViewProduct)}
          onOpenChange={(op) => !op && setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function LuxuryBoutiqueShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-gold-400 animate-pulse">Loading Curated Cosmeceutical Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
