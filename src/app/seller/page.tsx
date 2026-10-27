"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  RotateCcw,
  Star,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Lock,
  Boxes,
  Plus,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Truck,
  ExternalLink,
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
} from "recharts";
import { useAppStore } from "@/store";
import { usePermission } from "@/lib/rbac";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { OnboardingWizard } from "@/components/seller/OnboardingWizard";
import { showToast } from "@/components/ui/Toast";
import salesHistoryData from "@/data/salesHistory.json";
import plansData from "@/data/plans.json";

export default function SellerDashboardPage() {
  const {
    currentUser,
    sellers,
    orders,
    inventory,
    products,
    returns,
    sellerStaff,
    warehouses,
    stockIn,
  } = useAppStore();

  const { canRevenue, canPayouts, canOrdersEdit, canInventoryEdit } = usePermission();

  const sellerId = currentUser?.sellerId || "seller-1";
  const currentSeller = sellers.find((s) => s.id === sellerId) || sellers[0];
  const currentPlan = (plansData as any[]).find(
    (p) => p.id === (currentSeller?.planId || "plan-starter")
  ) || plansData[1];

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<{ id: string; name: string; currentStock: number } | null>(null);
  const [restockQty, setRestockQty] = useState(25);

  // Filter seller's shipments & orders
  const sellerShipments = useMemo(() => {
    const list: Array<{ order: any; shipment: any }> = [];
    orders.forEach((o) => {
      o.shipments?.forEach((sh) => {
        if (sh.sellerId === sellerId) {
          list.push({ order: o, shipment: sh });
        }
      });
    });
    return list;
  }, [orders, sellerId]);

  // Filter seller's inventory items
  const sellerOffers = useMemo(() => {
    return inventory.filter((inv) => inv.sellerId === sellerId);
  }, [inventory, sellerId]);

  // Filter returns
  const sellerReturns = useMemo(() => {
    return returns.filter((r) => {
      const match = sellerShipments.some((s) => s.shipment.id === r.shipmentId);
      return match && r.status === "pending";
    });
  }, [returns, sellerShipments]);

  // Compute KPIs
  const kpis = useMemo(() => {
    // Orders today
    const todayStr = "2026-10-10";
    const ordersTodayCount = sellerShipments.filter(
      (s) => s.order.createdAt.startsWith(todayStr)
    ).length;

    // Pending acceptance / processing
    const pendingOrdersCount = sellerShipments.filter(
      (s) => s.shipment.status === "pending" || s.shipment.status === "confirmed"
    ).length;

    // Active products
    const activeProductsCount = sellerOffers.filter(
      (inv) => inv.stock > 0 && inv.status !== "inactive"
    ).length;

    // Low stock items (stock <= threshold)
    const lowStockItems = sellerOffers.filter(
      (inv) => (inv.stock - (inv.reserved || 0)) <= (inv.lowStockThreshold || 10)
    );

    // Delivered revenue from store
    const storeRevenue = sellerShipments
      .filter((s) => s.shipment.status === "delivered")
      .reduce((sum, s) => sum + s.shipment.subtotal, 0);

    // Seeded revenue from salesHistory for this seller
    const seededRevenue = (salesHistoryData as any[])
      .filter((pt) => pt.sellerId === sellerId)
      .reduce((sum, pt) => sum + pt.revenue, 0);

    const totalRevenue = storeRevenue + seededRevenue;

    return {
      totalRevenue,
      ordersTodayCount,
      pendingOrdersCount,
      activeProductsCount,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      returnsCount: sellerReturns.length,
      rating: currentSeller?.rating || 4.9,
    };
  }, [sellerShipments, sellerOffers, sellerReturns, sellerId, currentSeller]);

  // Chart data: combines seeded history + live store orders
  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const historyPoints = (salesHistoryData as any[])
      .filter((pt) => pt.sellerId === sellerId)
      .slice(-days);

    return historyPoints.map((pt) => {
      // Add any live orders matching date
      const liveOrdersOnDate = sellerShipments.filter((s) =>
        s.order.createdAt.startsWith(pt.date)
      );
      const liveRev = liveOrdersOnDate.reduce((sum, s) => sum + s.shipment.subtotal, 0);

      const d = new Date(pt.date);
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

      return {
        date: label,
        revenue: pt.revenue + liveRev,
        orders: pt.ordersCount + liveOrdersOnDate.length,
      };
    });
  }, [salesHistoryData, sellerId, timeRange, sellerShipments]);

  // Donut chart: Orders by status
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      New: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    sellerShipments.forEach((s) => {
      const st = s.shipment.status;
      if (st === "pending" || st === "confirmed") counts.New++;
      else if (st === "processing" || st === "packed") counts.Processing++;
      else if (st === "shipped" || st === "out_for_delivery") counts.Shipped++;
      else if (st === "delivered") counts.Delivered++;
      else if (st === "cancelled") counts.Cancelled++;
    });

    // Provide default fallback counts for visually rich demo
    if (sellerShipments.length === 0) {
      return [
        { name: "New", value: 3, color: "#E0A93B" },
        { name: "Processing", value: 5, color: "#6FA3C7" },
        { name: "Shipped", value: 8, color: "#E8C77A" },
        { name: "Delivered", value: 42, color: "#5FAF7A" },
        { name: "Cancelled", value: 1, color: "#D4604F" },
      ];
    }

    return [
      { name: "New", value: Math.max(1, counts.New), color: "#E0A93B" },
      { name: "Processing", value: Math.max(1, counts.Processing), color: "#6FA3C7" },
      { name: "Shipped", value: Math.max(2, counts.Shipped), color: "#E8C77A" },
      { name: "Delivered", value: Math.max(5, counts.Delivered), color: "#5FAF7A" },
      { name: "Cancelled", value: counts.Cancelled, color: "#D4604F" },
    ].filter((it) => it.value > 0);
  }, [sellerShipments]);

  // Top 5 products
  const topProducts = useMemo(() => {
    return sellerOffers.slice(0, 5).map((inv) => {
      const prod = products.find((p) => p.id === inv.productId);
      const unitsSold = 18 + Math.round((inv.price % 100) / 4);
      const revenue = unitsSold * inv.price;
      return {
        id: inv.id,
        productId: inv.productId,
        name: prod?.name || `Product SKU-${inv.sku}`,
        category: prod?.routineStep || "Treatment",
        price: inv.price,
        stock: inv.stock,
        unitsSold,
        revenue,
      };
    });
  }, [sellerOffers, products]);

  // Action required items
  const actionRequiredItems = useMemo(() => {
    const list: Array<{ id: string; title: string; subtitle: string; slaBadge: string; type: "order" | "return" | "stock" }> = [];

    sellerShipments
      .filter((s) => s.shipment.status === "pending" || s.shipment.status === "confirmed")
      .slice(0, 3)
      .forEach((s) => {
        list.push({
          id: s.shipment.id,
          title: `Shipment #${s.shipment.id.slice(-6)} • Order #${s.order.orderNumber}`,
          subtitle: `Items: ${s.shipment.items.length} • City: ${s.order.shippingAddress.city}`,
          slaBadge: "22h SLA remaining",
          type: "order",
        });
      });

    sellerReturns.slice(0, 2).forEach((r) => {
      list.push({
        id: r.id,
        title: `Return Request #${r.id.slice(-5)}`,
        subtitle: `Item: ${r.productName} • Refund ₹${r.refundAmount}`,
        slaBadge: "Action Required",
        type: "return",
      });
    });

    return list;
  }, [sellerShipments, sellerReturns]);

  // Plan limits usage
  const productsLimit = currentPlan.limits.maxProducts;
  const productsUsed = sellerOffers.length;
  const staffLimit = currentPlan.limits.maxStaff || 10;
  const staffUsed = sellerStaff.filter((s) => s.sellerId === sellerId).length;

  const handleRestockSubmit = () => {
    if (!restockItem) return;
    stockIn(restockItem.id, restockQty, `BCH-${Date.now().toString().slice(-4)}`);
    showToast.success(`Added ${restockQty} units to ${restockItem.name}`);
    setRestockItem(null);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-medium">
              B2B Merchant Portal
            </span>
            <Badge variant={currentSeller?.isPaused ? "warning" : "success"} size="sm">
              {currentSeller?.isPaused ? "Store Paused" : "Store Live"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
            {currentSeller?.company}
          </h1>
          <p className="text-xs text-[#A89A85] mt-1">
            Fulfillment velocity, multi-warehouse stock balances, and financial earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnboardingOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-[#E8C77A]" />}
          >
            Store Setup Wizard
          </Button>

          <Link href="/seller/products">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Setup Checklist Widget (Visible if onboarding not marked complete) */}
      {!currentSeller?.onboardingCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-r from-[#241A0F] via-[#1A130B] to-[#241A0F] border border-[#C99A45]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C99A45]/20 flex items-center justify-center text-[#E8C77A] flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5EDE0]">
                Complete Store Launch Checklist
              </h3>
              <p className="text-xs text-[#A89A85]">
                Configure shipping SLAs, warehouse dispatch address, and initial flagship SKUs to maximize placement.
              </p>
            </div>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setOnboardingOpen(true)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Open Wizard
          </Button>
        </motion.div>
      )}

      {/* KPI Cards Row (Mobile horizontal swipe, Tablet 2-col, Desktop 4/7-col) */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
        {/* KPI 1: Total Revenue (Masked for unauthorized roles) */}
        <div className="min-w-[240px] sm:min-w-0 snap-start p-5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 relative overflow-hidden group hover:border-[#E8C77A]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A89A85] font-medium">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#C99A45]/15 flex items-center justify-center text-[#E8C77A]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-serif font-bold text-[#F5EDE0] flex items-center gap-2">
            {canRevenue ? (
              `₹${kpis.totalRevenue.toLocaleString("en-IN")}`
            ) : (
              <span className="flex items-center gap-2 text-[#A89A85] text-xl font-sans">
                <span>••••••••</span>
                <Lock className="w-4 h-4 text-[#E0A93B]" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#5FAF7A] mt-1.5 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last cycle
          </p>
        </div>

        {/* KPI 2: Orders Today */}
        <div className="min-w-[240px] sm:min-w-0 snap-start p-5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 group hover:border-[#E8C77A]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A89A85] font-medium">
              Orders Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#5FAF7A]/15 flex items-center justify-center text-[#5FAF7A]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EDE0]">
            {kpis.ordersTodayCount}
          </div>
          <p className="text-[11px] text-[#A89A85] mt-1.5 font-medium">
            Active dispatch queue
          </p>
        </div>

        {/* KPI 3: Pending Acceptance */}
        <div className="min-w-[240px] sm:min-w-0 snap-start p-5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 group hover:border-[#E8C77A]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A89A85] font-medium">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E0A93B]/15 flex items-center justify-center text-[#E0A93B]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EDE0]">
            {kpis.pendingOrdersCount}
          </div>
          <p className="text-[11px] text-[#E0A93B] mt-1.5 font-medium">
            Awaiting pack & dispatch
          </p>
        </div>

        {/* KPI 4: Active SKUs & Low Stock */}
        <div className="min-w-[240px] sm:min-w-0 snap-start p-5 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 group hover:border-[#E8C77A]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A89A85] font-medium">
              Active SKUs
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#6FA3C7]/15 flex items-center justify-center text-[#6FA3C7]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EDE0]">
            {kpis.activeProductsCount}
          </div>
          <p className="text-[11px] text-[#D4604F] mt-1.5 font-medium">
            {kpis.lowStockCount} below restock threshold
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Area Chart (2 cols) & Orders Donut + Action Required (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue & Velocity Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#F5EDE0] flex items-center gap-2">
                Fulfillment Velocity & Revenue
              </h2>
              <p className="text-xs text-[#A89A85]">
                Aggregated daily volume from seeded history and store transactions.
              </p>
            </div>

            {/* Time range switch */}
            <div className="flex items-center p-1 rounded-xl bg-[#0B0907] border border-[#C99A45]/20">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    timeRange === r
                      ? "bg-[#C99A45] text-[#0B0907] font-semibold"
                      : "text-[#A89A85] hover:text-[#F5EDE0]"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-72 w-full">
            {canRevenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C99A45" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C99A45" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#6F6354"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(201,154,69,0.2)" }}
                  />
                  <YAxis
                    stroke="#6F6354"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A130B",
                      border: "1px solid rgba(201,154,69,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#F5EDE0",
                    }}
                    formatter={(val: any) => [`₹${val.toLocaleString("en-IN")}`, "Gross Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E8C77A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sellerRevGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#0B0907]/60 rounded-2xl border border-dashed border-[#C99A45]/30 text-center space-y-2">
                <Lock className="w-8 h-8 text-[#E0A93B]" />
                <h4 className="text-sm font-semibold text-[#F5EDE0]">
                  Revenue Analytics Restricted
                </h4>
                <p className="text-xs text-[#A89A85] max-w-sm">
                  Your current role ({currentUser?.role}) cannot inspect financial gross merchandise figures. Contact the Distributor Owner to adjust permissions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Orders by Status Donut & Plan Usage */}
        <div className="space-y-6">
          {/* Donut Chart */}
          <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#F5EDE0]">
              Orders by Status
            </h3>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A130B",
                      border: "1px solid rgba(201,154,69,0.3)",
                      borderRadius: "10px",
                      fontSize: "11px",
                      color: "#F5EDE0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A89A85]">
              {statusDistribution.map((it) => (
                <div key={it.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.color }} />
                  <span className="text-[#F5EDE0]">{it.name}:</span>
                  <span className="font-mono">{it.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Usage Meter */}
          <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#F5EDE0]">
                Plan Usage ({currentPlan.name})
              </h3>
              <Link href="/seller/subscription" className="text-[11px] text-[#E8C77A] hover:underline">
                Upgrade
              </Link>
            </div>

            <div className="space-y-3">
              {/* Product SKUs Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A89A85]">Catalog SKUs</span>
                  <span className="text-[#F5EDE0] font-mono">
                    {productsUsed} / {productsLimit > 9000 ? "∞" : productsLimit}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0907] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C99A45] rounded-full"
                    style={{ width: `${Math.min(100, (productsUsed / (productsLimit > 9000 ? 50 : productsLimit)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Staff Members Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A89A85]">Team Seats</span>
                  <span className="text-[#F5EDE0] font-mono">
                    {staffUsed} / {staffLimit}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0907] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5FAF7A] rounded-full"
                    style={{ width: `${Math.min(100, (staffUsed / staffLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Top 5 Products Table & Action Required Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products Table (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#F5EDE0]">
                Top Formulations by Volume
              </h3>
              <p className="text-xs text-[#A89A85]">
                High-demand clinical formulations ranked by weekly order frequency.
              </p>
            </div>
            <Link href="/seller/products">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                All Products
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#C99A45]/15 text-[#A89A85]">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Available</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C99A45]/10">
                {topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#241A0F]/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-[#F5EDE0] max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-[#A89A85]">{p.category}</td>
                    <td className="py-3 px-3 font-mono font-medium text-[#E8C77A]">
                      ₹{p.price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={p.stock <= 5 ? "danger" : "outline"} size="sm">
                        {p.stock} Units
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#F5EDE0]">{p.unitsSold}</td>
                    <td className="py-3 px-3 text-right font-mono text-[#F5EDE0]">
                      {canRevenue ? `₹${p.revenue.toLocaleString("en-IN")}` : "••••"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Required Feed (1 col) */}
        <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#F5EDE0] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E0A93B]" />
              Action Required
            </h3>
            <span className="text-[10px] text-[#A89A85]">
              {actionRequiredItems.length} Tasks
            </span>
          </div>

          <div className="space-y-3">
            {actionRequiredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A89A85]">
                All shipments & returns processed. No pending SLAs!
              </div>
            ) : (
              actionRequiredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0B0907] border border-[#C99A45]/20 space-y-2 hover:border-[#E8C77A]/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F5EDE0]">
                      {item.title}
                    </span>
                    <Badge variant="gold" size="sm">
                      {item.slaBadge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#A89A85] truncate">{item.subtitle}</p>
                  <div className="pt-1 flex justify-end">
                    <Link href={item.type === "return" ? "/seller/orders?tab=returns" : "/seller/orders"}>
                      <span className="text-[11px] font-semibold text-[#E8C77A] hover:underline flex items-center gap-1">
                        Handle Now <ExternalLink className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Low Stock Quick Restock Alerts */}
          {kpis.lowStockItems.length > 0 && (
            <div className="pt-3 border-t border-[#C99A45]/15 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#D4604F] font-semibold block">
                Low Stock Warning:
              </span>
              {kpis.lowStockItems.slice(0, 2).map((inv) => {
                const prod = products.find((p) => p.id === inv.productId);
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#D4604F]/10 border border-[#D4604F]/30 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-[#F5EDE0] truncate">
                        {prod?.name || inv.sku}
                      </p>
                      <span className="text-[10px] text-[#D4604F]">
                        {inv.stock} left (Threshold: {inv.lowStockThreshold})
                      </span>
                    </div>
                    {canInventoryEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRestockItem({
                            id: inv.id,
                            name: prod?.name || inv.sku,
                            currentStock: inv.stock,
                          })
                        }
                        className="border-[#D4604F]/40 text-[#D4604F] hover:bg-[#D4604F]/20 text-[11px] h-7 px-2"
                      >
                        Restock
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Restock Dialog */}
      <ResponsiveDialog
        open={Boolean(restockItem)}
        onOpenChange={(open) => !open && setRestockItem(null)}
        title="Immediate Stock Replenishment"
        description={`Add new inventory units to ${restockItem?.name}`}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A89A85]">
              Units to Add to Current Stock ({restockItem?.currentStock || 0})
            </label>
            <input
              type="number"
              min={1}
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRestockItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRestockSubmit}>
              Apply Stock In
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Full-screen Onboarding Wizard */}
      <OnboardingWizard
        seller={currentSeller}
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
}
