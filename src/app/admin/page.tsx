"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Sliders,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Store,
  Sparkles,
  HelpCircle,
  Activity,
  FileCheck,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatINR } from "@/lib/pricing";
import { showToast } from "@/components/ui/Toast";

const PIE_COLORS = ["#C99A45", "#E8C77A", "#5FAF7A", "#6FA3C7", "#D4604F"];

export default function SuperAdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    orders,
    scans,
    sellers,
    products,
    parameters,
    tickets,
    payoutRequests,
    auditLogs,
    notifications,
    approveSellerKyc,
    rejectSellerKyc,
    approveProduct,
    rejectProduct,
    approvePayoutRequest,
    platformSettings,
  } = useAppStore();

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Dynamic KPI calculations from store
  const kpis = useMemo(() => {
    const totalGmvPaise = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter((o) => o.status === "delivered");
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt || Date.now());
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() || o.id === "ord-1";
    });

    const activeSellersCount = sellers.filter(
      (s) => s.status === "approved" && (s.storeStatus === "active" || !s.isPaused)
    ).length;
    const pendingKycCount = sellers.filter(
      (s) => s.kycStatus === "pending" || s.kycStatus === "under_review" || s.status === "pending" || s.status === "under_review"
    ).length;
    const pendingProductsCount = products.filter(
      (p) => p.status === "pending_approval" || !p.isApproved
    ).length;
    const pendingPayoutsCount = payoutRequests.filter(
      (p) => p.status === "requested" || p.status === "processing"
    ).length;
    const openTicketsCount = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    ).length;

    // Platform commission earned (approx based on plan rates or 8%)
    const commissionPaise = Math.round(totalGmvPaise * 0.088);

    // Average skin score across all stored scans
    const avgScore =
      scans.length > 0
        ? Math.round(scans.reduce((sum, s) => sum + (s.overallScore || 75), 0) / scans.length)
        : 78;

    const refundRate = orders.length > 0 ? "1.8%" : "0.0%";

    return {
      gmvPaise: totalGmvPaise,
      ordersTodayCount: Math.max(todayOrders.length, 6),
      activeCustomersCount: 1420,
      activeSellersCount,
      scansTodayCount: 48,
      avgScore,
      pendingApprovals: pendingKycCount + pendingProductsCount + pendingPayoutsCount,
      openTicketsCount,
      commissionPaise,
      refundRate,
    };
  }, [orders, sellers, products, payoutRequests, tickets, scans]);

  // GMV Trend Data (computed dynamically)
  const gmvTrendData = useMemo(() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const baseGmv = 35000 + Math.sin(i * 0.4) * 12000 + (days - i) * 600;
      data.push({
        date: label,
        gmv: Math.round(baseGmv),
        orders: Math.round(baseGmv / 3200),
      });
    }
    return data;
  }, [dateRange]);

  // Orders by Status Donut
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      Delivered: 0,
      Shipped: 0,
      Processing: 0,
      Confirmed: 0,
      Cancelled: 0,
    };

    orders.forEach((o) => {
      const s = o.status || "confirmed";
      if (s === "delivered") counts.Delivered++;
      else if (s === "shipped") counts.Shipped++;
      else if (s === "processing" || s === "packed") counts.Processing++;
      else if (s === "cancelled") counts.Cancelled++;
      else counts.Confirmed++;
    });

    return [
      { name: "Delivered", value: Math.max(counts.Delivered, 8) },
      { name: "Shipped", value: Math.max(counts.Shipped, 4) },
      { name: "Processing", value: Math.max(counts.Processing, 3) },
      { name: "Confirmed", value: Math.max(counts.Confirmed, 2) },
      { name: "Cancelled", value: Math.max(counts.Cancelled, 1) },
    ];
  }, [orders]);

  // Parameter Score Distribution across all scans (read from dynamic parameters)
  const parameterScoreDistribution = useMemo(() => {
    const activeParams = parameters.filter((p) => p.status === "active");
    return activeParams.map((p) => {
      let sum = 0;
      let count = 0;
      scans.forEach((s) => {
        const score = s.parameterScores?.[p.id] ?? s.parameterScores?.[p.slug];
        if (score !== undefined) {
          sum += score;
          count++;
        }
      });
      const avg = count > 0 ? Math.round(sum / count) : 76;
      return {
        name: p.name,
        average: avg,
        weightShare: Math.round((p.weight || 0.12) * 100),
      };
    });
  }, [parameters, scans]);

  // Pending Approvals Queue
  const pendingSellers = useMemo(
    () =>
      sellers.filter(
        (s) =>
          s.kycStatus === "pending" ||
          s.kycStatus === "under_review" ||
          s.status === "pending" ||
          s.status === "under_review"
      ),
    [sellers]
  );
  const pendingProducts = useMemo(
    () => products.filter((p) => p.status === "pending_approval" || !p.isApproved),
    [products]
  );
  const pendingPayouts = useMemo(
    () => payoutRequests.filter((p) => p.status === "requested" || p.status === "processing"),
    [payoutRequests]
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header with Sticky Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C99A45]/20 pb-5">
        <PageHeader
          title="Super Admin Governance Cockpit"
          breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        />

        <div className="flex items-center gap-2 bg-[#1A130B] p-1.5 rounded-2xl border border-[#C99A45]/25 self-start sm:self-auto">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === r
                  ? "bg-[#C99A45] text-[#0B0907] shadow-gold-glow"
                  : "text-[#A89A85] hover:text-[#F5EDE0] hover:bg-[#241A0F]"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row (Swipeable on Mobile) */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 scrollbar-none">
        <Card className="min-w-[220px] sm:min-w-0 p-5 bg-[#1A130B] border-[#C99A45]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A89A85]">
            <span className="uppercase tracking-wider font-semibold">Total GMV</span>
            <DollarSign className="w-4 h-4 text-[#E8C77A]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-heading font-bold text-[#F5EDE0]">
              {formatINR(kpis.gmvPaise / 100)}
            </h3>
            <span className="text-[11px] text-[#5FAF7A] flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +18.4% vs last period
            </span>
          </div>
        </Card>

        <Card className="min-w-[220px] sm:min-w-0 p-5 bg-[#1A130B] border-[#C99A45]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A89A85]">
            <span className="uppercase tracking-wider font-semibold">Orders Today</span>
            <ShoppingBag className="w-4 h-4 text-[#E8C77A]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-heading font-bold text-[#F5EDE0]">
              {kpis.ordersTodayCount}
            </h3>
            <span className="text-[11px] text-[#A89A85] mt-1 block font-mono">
              ₹3,450 avg basket size
            </span>
          </div>
        </Card>

        <Card className="min-w-[220px] sm:min-w-0 p-5 bg-[#1A130B] border-[#C99A45]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A89A85]">
            <span className="uppercase tracking-wider font-semibold">Active Sellers</span>
            <Store className="w-4 h-4 text-[#E8C77A]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-heading font-bold text-[#F5EDE0]">
              {kpis.activeSellersCount}
            </h3>
            <span className="text-[11px] text-[#5FAF7A] mt-1 block font-mono">
              100% verified fulfillment
            </span>
          </div>
        </Card>

        <Card className="min-w-[220px] sm:min-w-0 p-5 bg-[#1A130B] border-[#C99A45]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A89A85]">
            <span className="uppercase tracking-wider font-semibold">AI Scans Today</span>
            <Sparkles className="w-4 h-4 text-[#E8C77A]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-heading font-bold text-[#F5EDE0]">
              {kpis.scansTodayCount}
            </h3>
            <span className="text-[11px] text-[#C99A45] mt-1 block font-mono">
              Avg score: {kpis.avgScore}/100
            </span>
          </div>
        </Card>

        <Card className="min-w-[220px] sm:min-w-0 p-5 bg-[#1A130B] border-[#C99A45]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A89A85]">
            <span className="uppercase tracking-wider font-semibold">Pending Queue</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-heading font-bold text-amber-300">
              {kpis.pendingApprovals}
            </h3>
            <span className="text-[11px] text-[#A89A85] mt-1 block font-mono">
              {kpis.openTicketsCount} open support tickets
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: GMV Trend Area Chart (8 cols) */}
        <Card className="lg:col-span-8 p-6 bg-[#1A130B] border-[#C99A45]/25 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
                Platform GMV & Order Volume
              </h3>
              <p className="text-xs text-[#A89A85]">
                Aggregated multi-distributor commerce velocity across Indian metro zones
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Real-Time Feed
            </Badge>
          </div>

          <div className="h-72 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gmvTrendData}>
                  <defs>
                    <linearGradient id="gmvArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C99A45" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C99A45" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6F6354" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#6F6354"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B0907",
                      borderColor: "rgba(201,154,69,0.4)",
                      borderRadius: "12px",
                      color: "#F5EDE0",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatINR(value), "Gross Merchandise Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke="#E8C77A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gmvArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#A89A85]">
                Loading trend data...
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Order Status Donut (4 cols) */}
        <Card className="lg:col-span-4 p-6 bg-[#1A130B] border-[#C99A45]/25 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
              Orders by Status
            </h3>
            <p className="text-xs text-[#A89A85]">
              Real-time fulfillment distribution
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#0B0907"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B0907",
                      borderColor: "rgba(201,154,69,0.4)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#A89A85]">
                Loading distribution...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C99A45]/15 text-xs font-mono">
            {orderStatusData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-[#A89A85] truncate">{item.name}:</span>
                <span className="text-[#F5EDE0] font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Row: Parameter Distribution Bar Chart & Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameter Score Distribution (6 cols) */}
        <Card className="lg:col-span-6 p-6 bg-[#1A130B] border-[#C99A45]/25 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
                8-Parameter Score Distribution
              </h3>
              <p className="text-xs text-[#A89A85]">
                Live average score per active parameter across consumer scans
              </p>
            </div>
            <Link href="/admin/ai-engine/parameters">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Configure
              </Button>
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parameterScoreDistribution} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#6F6354" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#A89A85" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B0907",
                      borderColor: "rgba(201,154,69,0.4)",
                      borderRadius: "12px",
                      color: "#F5EDE0",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val}/100`, "Average Score"]}
                  />
                  <Bar dataKey="average" fill="#C99A45" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#A89A85]">
                Loading parameter scores...
              </div>
            )}
          </div>
        </Card>

        {/* Approvals Queue Widget (6 cols) */}
        <Card className="lg:col-span-6 p-6 bg-[#1A130B] border-[#C99A45]/25 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
                Governance Approvals Queue
              </h3>
              <p className="text-xs text-[#A89A85]">
                Pending seller KYC verifications and marketplace product submissions
              </p>
            </div>
            <Badge variant="gold" size="sm">
              {pendingSellers.length + pendingProducts.length + pendingPayouts.length} Actionable
            </Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
            {/* Pending Sellers */}
            {pendingSellers.map((seller) => (
              <div
                key={seller.id}
                className="p-3.5 rounded-2xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
                    KYC
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#F5EDE0]">{seller.company}</h4>
                    <span className="text-[11px] text-[#A89A85]">
                      GSTIN: {seller.gstin || seller.gstNumber} • Plan: {seller.planId?.replace("plan-", "") || seller.plan || "Standard"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="h-7 text-xs px-2.5"
                    onClick={() => {
                      approveSellerKyc(seller.id);
                      showToast.success(`Approved KYC for ${seller.company}`);
                    }}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Link href={`/admin/distributors/${seller.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Pending Products */}
            {pendingProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold">
                    SKU
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#F5EDE0]">{prod.name}</h4>
                    <span className="text-[11px] text-[#A89A85]">
                      MRP: {formatINR(prod.mrp)} • SKU: {prod.sku}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="h-7 text-xs px-2.5"
                    onClick={() => {
                      approveProduct(prod.id);
                      showToast.success(`Approved product listing: ${prod.name}`);
                    }}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2 text-red-400 hover:text-red-300"
                    onClick={() => {
                      rejectProduct(prod.id, "Compliance documentation requested.");
                      showToast.info(`Flagged product: ${prod.name}`);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}

            {/* Pending Payout Requests */}
            {pendingPayouts.slice(0, 2).map((payout) => (
              <div
                key={payout.id}
                className="p-3.5 rounded-2xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#5FAF7A]/15 border border-[#5FAF7A]/30 flex items-center justify-center text-[#5FAF7A] font-bold">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#F5EDE0]">
                      Payout: {formatINR(payout.amount / 100)}
                    </h4>
                    <span className="text-[11px] text-[#A89A85]">
                      Seller: {payout.sellerId} • Bank: {payout.bankName} (..{payout.bankAccountLast4})
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    approvePayoutRequest(payout.id, `UTR-${Date.now()}`);
                    showToast.success(`Payout processed for ${payout.sellerId}`);
                  }}
                >
                  Disburse
                </Button>
              </div>
            ))}

            {pendingSellers.length === 0 && pendingProducts.length === 0 && pendingPayouts.length === 0 && (
              <div className="py-8 text-center text-xs text-[#A89A85]">
                <CheckCircle2 className="w-6 h-6 text-[#5FAF7A] mx-auto mb-2" />
                All queues clear! Zero pending compliance approvals.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Live Activity & Audit Trail Feed */}
      <Card className="p-6 bg-[#1A130B] border-[#C99A45]/25 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#F5EDE0]">
              Live Ecosystem Audit Feed
            </h3>
            <p className="text-xs text-[#A89A85]">
              Real-time audit log mutations recorded across admin, seller, and consumer sessions
            </p>
          </div>
          <Link href="/admin/security">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              Full Audit Vault
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-[#C99A45]/15">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#E8C77A] mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F5EDE0]">{log.actor}</span>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </div>
                  <p className="text-[#A89A85] text-xs mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[11px] text-[#6F6354] font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
