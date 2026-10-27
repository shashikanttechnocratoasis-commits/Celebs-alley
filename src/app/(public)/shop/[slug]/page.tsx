import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { PublicAddToCartButton } from "@/components/shop/PublicAddToCartButton";
import productsData from "@/data/products.json";
import brandsData from "@/data/brands.json";
import inventoryData from "@/data/inventory.json";
import sellersData from "@/data/sellers.json";
import ingredientsData from "@/data/ingredients.json";

export async function generateStaticParams() {
  return productsData.map((product) => ({
    slug: product.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.id === slug);
  if (!product) return { title: "Product Not Found | Celebs Alley" };

  return {
    title: `${product.name} | Celebs Alley Luxury Formulations`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productsData.find((p) => p.id === slug);

  if (!product) {
    notFound();
  }

  const brand = brandsData.find((b) => b.id === product.brandId);
  const discountedPrice = Math.round(product.mrp * 0.92);

  // Filter sellers that carry this product from inventoryData
  const productInventory = inventoryData.filter((inv) => inv.productId === product.id);
  const sellerList = productInventory.map((inv) => {
    const s = sellersData.find((seller) => seller.id === inv.sellerId);
    return {
      sellerName: s?.company || "Authorized Cosmeceutical Stockist",
      city: s?.city || "Jaipur",
      price: inv.price,
      stock: inv.stock,
      deliveryDays: "2-3 business days",
    };
  });

  // Matched ingredients
  const matchedIngredients = ingredientsData.filter((ing) =>
    product.ingredients.includes(ing.id)
  );

  // Related products
  const relatedProducts = productsData
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <Link href="/shop" className="hover:text-gold-300">Dispensary</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-gold-300 font-medium">{product.name}</span>
        </div>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gold-500/30 bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              <ImageWithFallback
                src={product.images[0] || ""}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Product Overview (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                  {brand?.name || "Celebs Alley House Line"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gold-300">
                  <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-text-muted">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price Row */}
            <div className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 flex items-baseline gap-3">
              <span className="text-3xl font-heading font-bold text-gold-300">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-text-muted line-through">
                MRP: ₹{product.mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full ml-auto">
                Authorized Seller Pricing
              </span>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {product.description}
            </p>

            {/* AI Target Parameter Synergy Matrix */}
            <div className="p-5 rounded-2xl bg-bg-surface border border-gold-500/25 space-y-3">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-gold-400 block">
                AI Target Parameter Synergy Matrix:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(product.targetParameters).map(([key, score]) => {
                  const symbol = score === 3 ? "+++" : score === 2 ? "++" : score === 1 ? "+" : "−";
                  const isPositive = score > 0;
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                        isPositive
                          ? "bg-gold-500/10 border-gold-500/30 text-gold-300"
                          : "bg-bg-elevated border-gold-500/10 text-text-muted"
                      }`}
                    >
                      <span className="capitalize">{key.replace("_", " ")}</span>
                      <span className="font-bold font-mono">{symbol}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <PublicAddToCartButton
                  product={product as any}
                  price={discountedPrice}
                  size="lg"
                  className="w-full sm:flex-1 py-4 text-xs font-semibold uppercase tracking-widest"
                />
                <Link href="/demo" className="w-full sm:flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-center text-xs font-semibold uppercase tracking-widest py-4 border-gold-500/40 text-gold-300"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get My Match Score
                  </Button>
                </Link>
                <Link href="/book" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-gold-500/40 text-text-muted hover:text-gold-300"
                  >
                    Consult Expert
                  </Button>
                </Link>
              </div>
              <p className="text-[11px] text-text-muted text-center sm:text-left">
                Direct commerce is fulfilled by licensed regional cosmeceutical distributors.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Dossier Sections: Ingredients, How to Use, Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gold-500/20">
          {/* Main Info Columns (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Ingredients */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
              <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-gold-400" />
                Key Botanical & Clinical Actives
              </h3>
              <div className="space-y-3">
                {matchedIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-4 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gold-300">{ing.name}</span>
                      <span className="text-[11px] text-text-muted font-mono italic">
                        {ing.inciName}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Benefits: {ing.benefits.join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use Protocol */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-3">
              <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-400" />
                Application Protocol & Usage
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {product.usage}
              </p>
            </div>
          </div>

          {/* Available Sellers Box (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-bg-surface border border-gold-500/30 space-y-4">
              <div className="flex items-center gap-2 text-gold-300 pb-2 border-b border-gold-500/20">
                <Store className="w-4 h-4" />
                <h4 className="text-xs font-heading font-semibold uppercase tracking-wider">
                  Available from {sellerList.length || 1} Authorized Sellers
                </h4>
              </div>

              <div className="space-y-3">
                {sellerList.length > 0 ? (
                  sellerList.map((s, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-text-primary">{s.sellerName}</span>
                        <span className="font-mono text-gold-300 font-semibold">
                          ₹{s.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>Dispatch from {s.city}</span>
                        <span className="text-emerald-400">In Stock ({s.stock})</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 text-xs text-text-secondary">
                    <span>Authorized Central Warehouse • ₹{discountedPrice.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Formulations Strip */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-gold-500/20 space-y-6">
            <h3 className="text-xl font-heading font-bold text-text-primary">
              Complementary Formulations in This Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/shop/${rel.id}`}
                  className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all flex items-center gap-4 group"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bg-elevated shrink-0">
                    <ImageWithFallback
                      src={rel.images[0] || ""}
                      alt={rel.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors line-clamp-1">
                      {rel.name}
                    </h4>
                    <span className="text-xs font-semibold text-gold-400 mt-1 block">
                      ₹{rel.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
