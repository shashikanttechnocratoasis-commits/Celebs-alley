"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Sparkles,
  Download,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart2,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/pricing";
import { usePermission } from "@/lib/rbac";
import salesHistoryData from "@/data/salesHistory.json";

type AnalyticsTab = "sales" | "products" | "customers" | "ai_insights";

const CATEGORY_COLORS = ["#d4af37", "#f3e5ab", "#a38027", "#8b5cf6", "#10b981", "#3b82f6"];

export default function SellerAnalyticsPage() {
  const { currentUser, currentRole, sellers, orders, products, inventory } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";

  // RBAC checks
  const canViewRevenue = usePermission("analytics_revenue", "view");

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("sales");
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [comparePrevious, setComparePrevious] = useState(true);

  // 1. Combine salesHistory with live orders for this seller
  const chartData = useMemo(() => {
    const historical = salesHistoryData
      .filter((h: any) => h.sellerId === sellerId)
      .slice(-rangeDays)
      .map((h: any) => ({
        date: h.date.slice(5),
        revenue: h.revenue,
        orders: h.orders,
        fullDate: h.date,
      }));

    // Add any today live orders
    let todayOrdersCount = 0;
    let todayRevenue = 0;
    orders.forEach((ord) => {
      const matchShipment = ord.shipments?.find((s) => s.sellerId === sellerId);
      if (matchShipment) {
        todayOrdersCount += 1;
        todayRevenue += matchShipment.total;
      }
    });

    if (historical.length > 0 && todayOrdersCount > 0) {
      const last = historical[historical.length - 1];
      last.revenue += todayRevenue;
      last.orders += todayOrdersCount;
    }

    return historical;
  }, [sellerId, rangeDays, orders]);

  // Aggregate stats
  const totalRevenue = useMemo(() => chartData.reduce((acc, d) => acc + d.revenue, 0), [chartData]);
  const totalOrders = useMemo(() => chartData.reduce((acc, d) => acc + d.orders, 0), [chartData]);
  const aov = useMemo(() => (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0), [totalRevenue, totalOrders]);

  // 2. Category Breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    const sellerOffers = inventory.filter((inv) => inv.sellerId === sellerId);
    sellerOffers.forEach((inv) => {
      const prod = products.find((p) => p.id === inv.productId);
      const cat = prod?.category || "Cosmeceuticals";
      map.set(cat, (map.get(cat) || 0) + (inv.stock || 1));
    });

    const entries = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return entries.length > 0
      ? entries
      : [
          { name: "Serums", value: 45 },
          { name: "Moisturizers", value: 30 },
          { name: "Sun Protection", value: 15 },
          { name: "Cleanse & Tone", value: 10 },
        ];
  }, [inventory, products, sellerId]);

  // 3. Top 5 & Bottom 5 Products
  const { topProducts, bottomProducts } = useMemo(() => {
    const sellerOffers = inventory.filter((inv) => inv.sellerId === sellerId);
    const scored = sellerOffers.map((inv, idx) => {
      const prod = products.find((p) => p.id === inv.productId);
      const unitsSold = 18 + (idx * 7) % 65;
      const revenue = unitsSold * (inv.price || 1800);
      const returnRate = (1.2 + (idx * 0.8) % 4).toFixed(1);
      return {
        id: inv.id,
        name: prod?.name || `Product SKU-${inv.id}`,
        category: prod?.category || "Skincare",
        unitsSold,
        revenue,
        returnRate,
        stock: inv.stock,
      };
    });

    scored.sort((a, b) => b.unitsSold - a.unitsSold);
    return {
      topProducts: scored.slice(0, 5),
      bottomProducts: [...scored].reverse().slice(0, 5),
    };
  }, [inventory, products, sellerId]);

  // 4. Regional Geography
  const stateDistribution = useMemo(() => {
    return [
      { state: "Maharashtra", orders: 142, pct: 38 },
      { state: "Karnataka", orders: 86, pct: 23 },
      { state: "Delhi NCR", orders: 62, pct: 17 },
      { state: "Gujarat", orders: 48, pct: 13 },
      { state: "Telangana", orders: 34, pct: 9 },
    ];
  }, []);

  // 5. Conversion Funnel
  const funnelData = useMemo(() => {
    return [
      { stage: "Catalog & Scan Product Views", count: 18420, rate: "100%" },
      { stage: "Added to Luxury Cart", count: 2940, rate: "16.0%" },
      { stage: "Checkout Initiated", count: 1220, rate: "6.6%" },
      { stage: "Successful Dispatches", count: totalOrders || 412, rate: "2.8%" },
    ];
  }, [totalOrders]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Date", "Orders"];
    if (canViewRevenue) headers.push("Revenue (INR)");
    const rows = chartData.map((d) => {
      const r = [d.fullDate, d.orders];
      if (canViewRevenue) r.push(d.revenue);
      return r.join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `analytics_${sellerId}_${rangeDays}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Sales & Business Intelligence"
          description={`Telemetry and consumer demand analytics for ${currentSeller?.company}.`}
          breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Analytics" }]}
        />

        <div className="flex items-center gap-2">
          {/* Range Picker */}
          <div className="flex items-center bg-obsidian-900 border border-obsidian-800 rounded-lg p-0.5">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRangeDays(d as any)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  rangeDays === d ? "bg-gold-500/20 text-gold-300" : "text-cream-400 hover:text-cream-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-obsidian-800 pb-2">
        {[
          { id: "sales", label: "Sales & Revenue", icon: TrendingUp },
          { id: "products", label: "Catalog Performance", icon: Package },
          { id: "customers", label: "Conversion Funnel", icon: Users },
          { id: "ai_insights", label: "AI Diagnostic Insights", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
                  : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SALES & REVENUE */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 relative overflow-hidden">
              <span className="text-[10px] text-cream-400 uppercase tracking-wider font-medium">
                Gross Revenue ({rangeDays} Days)
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                {canViewRevenue ? (
                  <span className="text-2xl font-bold font-mono text-gold-300">
                    {formatINR(totalRevenue)}
                  </span>
                ) : (
                  <span className="text-xl text-cream-500 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> ••••••••
                  </span>
                )}
                {comparePrevious && (
                  <span className="text-xs text-emerald-400 flex items-center font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cream-500 mt-1">vs preceding {rangeDays}-day window</p>
            </div>

            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5">
              <span className="text-[10px] text-cream-400 uppercase tracking-wider font-medium">
                Shipments Fulfilled
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-cream-100">
                  {totalOrders}
                </span>
                {comparePrevious && (
                  <span className="text-xs text-emerald-400 flex items-center font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +9.8%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cream-500 mt-1">100% on-time fulfillment rate</p>
            </div>

            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5">
              <span className="text-[10px] text-cream-400 uppercase tracking-wider font-medium">
                Average Order Value (AOV)
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                {canViewRevenue ? (
                  <span className="text-2xl font-bold font-mono text-cream-100">
                    {formatINR(aov)}
                  </span>
                ) : (
                  <span className="text-xl text-cream-500 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> ••••••
                  </span>
                )}
                <span className="text-xs text-cream-400 font-mono">Cosmeceutical Tier</span>
              </div>
              <p className="text-[11px] text-cream-500 mt-1">Prestige formulation basket size</p>
            </div>
          </div>

          {/* Area Chart: Revenue Trend */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-cream-100">Revenue & Demand Velocity</h3>
                <p className="text-xs text-cream-400">
                  Daily aggregate throughput across the active {rangeDays}-day window.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-cream-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparePrevious}
                  onChange={(e) => setComparePrevious(e.target.checked)}
                  className="rounded border-obsidian-700 bg-obsidian-950 text-gold-500 focus:ring-0"
                />
                <span>Benchmark vs Prior Period</span>
              </label>
            </div>

            <div className="h-72 w-full">
              {canViewRevenue ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#666"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121214",
                        borderColor: "#2d2d32",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [formatINR(Number(val)), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d4af37"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsGold)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-obsidian-950/50 rounded-lg border border-dashed border-obsidian-800 text-center p-6">
                  <Lock className="w-8 h-8 text-cream-500 mb-2" />
                  <p className="text-xs font-semibold text-cream-200">Revenue Metrics Masked</p>
                  <p className="text-[11px] text-cream-400 max-w-sm mt-1">
                    Your current staff role does not possess the <code className="text-gold-300">analytics_revenue</code> privilege.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Regional Geography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-cream-100">Top Serviceable States</h3>
              <div className="space-y-3">
                {stateDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-200">{item.state}</span>
                      <span className="text-cream-400 font-mono">
                        {item.orders} shipments ({item.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-400 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-cream-100">Logistics Efficiency SLA</h3>
              <div className="space-y-3 text-xs text-cream-300">
                <div className="flex items-center justify-between p-3 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span>Average Handling Time (Pack to Ship)</span>
                  <span className="font-mono font-bold text-emerald-400">14.2 Hours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span>First-Attempt Delivery Rate</span>
                  <span className="font-mono font-bold text-cream-100">97.8%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span>Return Rate vs Platform Average</span>
                  <span className="font-mono font-bold text-emerald-400">1.8% (Avg: 3.4%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG & PRODUCTS */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Donut */}
            <div className="lg:col-span-5 bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-cream-100">Inventory by Category</h3>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121214",
                        borderColor: "#2d2d32",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-obsidian-800">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-cream-300 truncate">{cat.name}</span>
                    <span className="text-cream-500 font-mono text-[10px]">({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Products Table */}
            <div className="lg:col-span-7 bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cream-100">Top 5 Best-Performing SKUs</h3>
                <span className="text-[11px] text-gold-300">Ranked by Units Dispatched</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-obsidian-950 text-cream-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Product SKU</th>
                      <th className="p-2.5 text-center">Units Sold</th>
                      <th className="p-2.5 text-right">Revenue</th>
                      <th className="p-2.5 text-center">Return %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-800 text-cream-200">
                    {topProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-obsidian-850/50">
                        <td className="p-2.5">
                          <p className="font-semibold text-cream-100">{p.name}</p>
                          <span className="text-[10px] text-cream-500">{p.category}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-cream-100">
                          {p.unitsSold}
                        </td>
                        <td className="p-2.5 text-right font-mono text-gold-300">
                          {canViewRevenue ? formatINR(p.revenue) : "••••"}
                        </td>
                        <td className="p-2.5 text-center font-mono text-cream-400">
                          {p.returnRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONVERSION FUNNEL */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-cream-100">
                Diagnostic Conversion Funnel
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                From AI Skin Analysis scan recommendations through to confirmed distributor checkout.
              </p>
            </div>

            <div className="space-y-4">
              {funnelData.map((step, idx) => (
                <div key={idx} className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cream-200">{step.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cream-100 font-bold">
                        {step.count.toLocaleString()} visits
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gold-500/15 text-gold-300 font-mono text-[10px] font-semibold">
                        {step.rate}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-obsidian-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                      style={{ width: step.rate }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-obsidian-800 text-xs">
              <div className="p-3 bg-obsidian-950 rounded-lg">
                <span className="text-[10px] text-cream-500 uppercase block">Repeat Buyer Cohort</span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">34.2%</span>
                <p className="text-[11px] text-cream-400 mt-0.5">Buyers ordering within 45 days</p>
              </div>
              <div className="p-3 bg-obsidian-950 rounded-lg">
                <span className="text-[10px] text-cream-500 uppercase block">AI Match Accuracy</span>
                <span className="text-base font-bold font-mono text-gold-300 mt-1 block">94.8%</span>
                <p className="text-[11px] text-cream-400 mt-0.5">Rated &quot;Noticeable improvement&quot;</p>
              </div>
              <div className="p-3 bg-obsidian-950 rounded-lg">
                <span className="text-[10px] text-cream-500 uppercase block">Cart Abandonment</span>
                <span className="text-base font-bold font-mono text-rose-400 mt-1 block">58.4%</span>
                <p className="text-[11px] text-cream-400 mt-0.5">Marketplace benchmark: 69.2%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI INSIGHTS */}
      {activeTab === "ai_insights" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-cream-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Algorithm Diagnostics & Growth Opportunities
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Rule-based algorithmic heuristics derived from your live stock, customer velocity, and match weights.
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Demo Intelligence
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight 1: Low stock high velocity */}
            <div className="p-5 bg-obsidian-900 border border-gold-500/30 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-gold-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Restock Recommendation: High Velocity</span>
              </div>
              <p className="text-xs text-cream-200">
                2 products in your catalogue are below their minimum safety thresholds while maintaining high scan match conversions.
              </p>
              <div className="p-3 bg-obsidian-950 rounded-lg text-xs space-y-1">
                <p className="text-cream-300 font-medium">• Cellular Recovery Serum (Stock: 4 left)</p>
                <p className="text-cream-300 font-medium">• Niacinamide Radiance Cream (Stock: 6 left)</p>
              </div>
              <Link href="/seller/inventory">
                <Button size="sm" variant="gold" className="w-full mt-2">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Open Inventory & Restock
                </Button>
              </Link>
            </div>

            {/* Insight 2: Category matching */}
            <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Top Converting Parameter: Hydration</span>
              </div>
              <p className="text-xs text-cream-200">
                Products mapped to the <strong className="text-cream-100">Hydration</strong> parameter score an 8.4% conversion rate across scans, 2.1x higher than the marketplace average.
              </p>
              <p className="text-[11px] text-cream-400">
                Tip: Adding more multi-molecular hyaluronic acid SKUs will maximize regional placement.
              </p>
              <Link href="/seller/products">
                <Button size="sm" variant="outline" className="w-full mt-2">
                  View Hydration SKUs
                </Button>
              </Link>
            </div>

            {/* Insight 3: Speed of Delivery */}
            <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fulfillment Speed Advantage</span>
              </div>
              <p className="text-xs text-cream-200">
                Your dispatch turnaround is currently <strong className="text-cream-100">18% faster</strong> than other distributors in Western India.
              </p>
              <p className="text-[11px] text-cream-400">
                High fulfillment speed grants your products priority placement in the &quot;Same-Day Cold Chain&quot; carousel.
              </p>
            </div>

            {/* Insight 4: Margin Optimization */}
            <div className="p-5 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Lightbulb className="w-4 h-4" />
                <span>Price Elasticity Opportunity</span>
              </div>
              <p className="text-xs text-cream-200">
                Sunscreen SKUs in your inventory are priced 12% below competing brands with similar SPF 50+ PA++++ efficacy ratings.
              </p>
              <p className="text-[11px] text-cream-400">
                Consider adjusting prices closer to MRP to capture an estimated ₹14,200 additional monthly gross margin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
