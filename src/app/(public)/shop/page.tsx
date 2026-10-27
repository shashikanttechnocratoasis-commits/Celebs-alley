"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Heart,
  Sparkles,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { QuickViewModal } from "@/components/public/QuickViewModal";
import { PublicAddToCartButton } from "@/components/shop/PublicAddToCartButton";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import type { Product } from "@/types";

// Data
import productsData from "@/data/products.json";
import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";
import inventoryData from "@/data/inventory.json";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const initialCategory = searchParams.get("category") || "All";
  const initialBrand = searchParams.get("brand") || "All";
  const initialSort = searchParams.get("sort") || "relevance";
  const initialSearch = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedSkinType, setSelectedSkinType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Quick view modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Store wishlist
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isInWishlist = useAppStore((s) => s.isInWishlist);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedBrand !== "All") params.set("brand", selectedBrand);
    if (selectedSort !== "relevance") params.set("sort", selectedSort);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    const queryString = params.toString();
    router.replace(queryString ? `/shop?${queryString}` : "/shop", { scroll: false });
  }, [selectedCategory, selectedBrand, selectedSort, searchQuery, router]);

  // Distinct concern tags & skin types
  const skinTypes = ["All", "Dry", "Oily", "Combination", "Sensitive", "Mature"];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = (productsData as unknown as Product[]).filter((p) => {
      if (selectedCategory !== "All" && p.categoryId !== selectedCategory) return false;
      if (selectedBrand !== "All" && p.brandId !== selectedBrand) return false;
      if (selectedSkinType !== "All" && !p.suitableSkinTypes.includes(selectedSkinType) && !p.suitableSkinTypes.includes("All")) {
        return false;
      }
      if (p.mrp > maxPrice) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.concernTags.some((c) => c.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });

    // Sorting
    if (selectedSort === "price-asc") {
      list.sort((a, b) => a.mrp - b.mrp);
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => b.mrp - a.mrp);
    } else if (selectedSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [selectedCategory, selectedBrand, selectedSkinType, maxPrice, searchQuery, selectedSort]);

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleWishlist(product.id);
    if (res.added) {
      toast.success(`${product.name} added to your wishlist.`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedSkinType("All");
    setMaxPrice(10000);
    setSearchQuery("");
    setSelectedSort("relevance");
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <SectionHeading
            label="Cosmeceutical Dispensary"
            title="Clinically Active Formulations & Curated Elixirs"
            accentWord="Apothecary"
          />
          <p className="text-xs sm:text-sm text-text-secondary">
            Every product is indexed across our 8 AI skin parameters. Authorized multi-distributor sourcing ensures fresh compounding and batch authenticity.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface border border-gold-500/20">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations, actives, concerns..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/25 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-bg-elevated border border-gold-500/30 text-xs font-semibold text-gold-300 flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted hidden sm:inline">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="h-10 px-3 rounded-xl bg-bg-elevated border border-gold-500/25 text-xs text-text-primary focus:outline-none focus:border-gold-400"
              >
                <option value="relevance">Relevance & Match</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 p-6 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400">
                Filter Formulations
              </span>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-text-muted hover:text-gold-300 transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-text-primary block">Category</span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === "All"
                      ? "text-gold-300 font-semibold bg-gold-500/15"
                      : "text-text-secondary hover:text-gold-300"
                  }`}
                >
                  <span>All Categories</span>
                  <span>{productsData.length}</span>
                </button>
                {categoriesData.map((cat) => {
                  const count = productsData.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? "text-gold-300 font-semibold bg-gold-500/15"
                          : "text-text-secondary hover:text-gold-300"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-text-muted">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5 pt-3 border-t border-gold-500/15">
              <span className="text-xs font-semibold text-text-primary block">Brand / House</span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedBrand("All")}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedBrand === "All"
                      ? "text-gold-300 font-semibold bg-gold-500/15"
                      : "text-text-secondary hover:text-gold-300"
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {brandsData.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedBrand === b.id
                        ? "text-gold-300 font-semibold bg-gold-500/15"
                        : "text-text-secondary hover:text-gold-300"
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div className="space-y-2.5 pt-3 border-t border-gold-500/15">
              <span className="text-xs font-semibold text-text-primary block">Skin Type</span>
              <div className="flex flex-wrap gap-1.5">
                {skinTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSkinType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      selectedSkinType === type
                        ? "bg-gold-500/20 border-gold-400 text-gold-300"
                        : "bg-bg-elevated border-gold-500/15 text-text-muted hover:text-gold-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2.5 pt-3 border-t border-gold-500/15">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Max Price</span>
                <span className="text-gold-300 font-bold font-mono">₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Showing {filteredProducts.length} formulations</span>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const brand = brandsData.find((b) => b.id === product.brandId);
                  const wishlisted = isInWishlist(product.id);
                  const discountedPrice = Math.round(product.mrp * 0.92);

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="group rounded-2xl bg-bg-surface border border-gold-500/25 overflow-hidden flex flex-col justify-between hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                        <ImageWithFallback
                          src={product.images[0] || ""}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => handleWishlist(e, product)}
                          aria-label="Toggle wishlist"
                          className="absolute top-3 right-3 p-2 rounded-full bg-bg-base/80 backdrop-blur-md border border-gold-500/30 text-gold-400 hover:text-rose-400 transition-colors z-10"
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300">
                          {brand?.name || "Luxury Cosmeceutical"}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                              {product.concernTags[0]}
                            </span>
                            <div className="flex items-center gap-1 text-gold-300">
                              <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                              <span>{product.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <Link href={`/shop/${product.id}`}>
                            <h4 className="text-sm font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors line-clamp-1">
                              {product.name}
                            </h4>
                          </Link>
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gold-500/15 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-base font-bold font-heading text-gold-300">
                              ₹{discountedPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-text-muted line-through ml-1.5">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickView(product)}
                              className="text-xs text-gold-400 hover:text-gold-200 font-medium underline"
                            >
                              Quick View
                            </button>
                            <PublicAddToCartButton
                              product={product}
                              price={discountedPrice}
                              size="sm"
                              className="text-[11px] px-2.5 py-1 h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-bg-surface rounded-2xl border border-gold-500/20 space-y-3">
                <p className="text-base text-text-secondary">No products match your selected filters.</p>
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="border-gold-500/30 text-gold-300">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold-400">Loading Shop Dispensary...</div>}>
      <ShopContent />
    </Suspense>
  );
}
