"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Lock,
  Download,
  Calendar,
  Layers,
  Users,
  Package,
  ShoppingBag,
  Building2,
  Printer,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/pricing";
import { showToast } from "@/components/ui/Toast";
import { usePermission } from "@/lib/rbac";
import plansData from "@/data/plans.json";

export default function SellerSubscriptionPage() {
  const {
    currentUser,
    currentRole,
    sellers,
    inventory,
    sellerStaff,
    warehouses,
    orders,
    updateSeller,
  } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";
  const currentPlanId = currentSeller?.planId || "plan-starter";

  // RBAC checks
  const canViewSubscription = usePermission("subscription", "view");
  const canEditSubscription = usePermission("subscription", "edit");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<any | null>(null);
  const [downgradeError, setDowngradeError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<any | null>(null);

  // Compute live usages
  const currentProductsCount = useMemo(
    () => inventory.filter((inv) => inv.sellerId === sellerId).length,
    [inventory, sellerId]
  );
  const currentStaffCount = useMemo(
    () => sellerStaff.filter((s) => s.sellerId === sellerId).length,
    [sellerStaff, sellerId]
  );
  const currentWarehouseCount = useMemo(
    () => warehouses.filter((w) => w.sellerId === sellerId).length,
    [warehouses, sellerId]
  );
  const currentOrdersThisMonth = useMemo(() => {
    return orders.filter((o) => {
      const match = o.shipments?.some((s) => s.sellerId === sellerId);
      return match || o.sellerId === sellerId;
    }).length;
  }, [orders, sellerId]);

  const activePlan = useMemo(
    () => plansData.find((p) => p.id === currentPlanId) || plansData[1],
    [currentPlanId]
  );

  // Handle plan selection (upgrade or downgrade)
  const handleSelectPlan = (targetPlan: any) => {
    if (!canEditSubscription) {
      showToast.error("Your role cannot modify subscription plans.");
      return;
    }
    if (targetPlan.id === currentPlanId) return;

    // Downgrade validation
    const targetMaxProducts = targetPlan.limits.maxProducts || 9999;
    const targetMaxStaff = (targetPlan.limits as any)?.maxStaff || (targetPlan.id === "plan-free" ? 1 : targetPlan.id === "plan-starter" ? 3 : 9999);

    if (currentProductsCount > targetMaxProducts) {
      setDowngradeError(
        `Cannot switch to ${targetPlan.name}: You have ${currentProductsCount} active products in your catalog (Target limit: ${targetMaxProducts}). Please deactivate ${
          currentProductsCount - targetMaxProducts
        } products before switching.`
      );
      return;
    }

    if (currentStaffCount > targetMaxStaff) {
      setDowngradeError(
        `Cannot switch to ${targetPlan.name}: You have ${currentStaffCount} active staff accounts (Target limit: ${targetMaxStaff}). Please remove ${
          currentStaffCount - targetMaxStaff
        } staff members before switching.`
      );
      return;
    }

    setDowngradeError(null);
    setUpgradeModalPlan(targetPlan);
  };

  const handleConfirmPlanChange = () => {
    if (!upgradeModalPlan) return;
    updateSeller(sellerId, { planId: upgradeModalPlan.id });
    showToast.success(`Successfully switched to ${upgradeModalPlan.name}!`);
    setUpgradeModalPlan(null);
  };

  const billingHistory = [
    {
      id: "INV-SUB-2026-10",
      period: "01 Oct 2026 - 31 Oct 2026",
      planName: activePlan.name,
      amount: billingCycle === "monthly" ? activePlan.priceMonthly : activePlan.priceYearly,
      gst: Math.round((activePlan.priceMonthly * 0.18)),
      status: "Paid",
      date: "01 Oct 2026",
    },
    {
      id: "INV-SUB-2026-09",
      period: "01 Sep 2026 - 30 Sep 2026",
      planName: "Growth Partner",
      amount: 999,
      gst: 180,
      status: "Paid",
      date: "01 Sep 2026",
    },
    {
      id: "INV-SUB-2026-08",
      period: "01 Aug 2026 - 31 Aug 2026",
      planName: "Growth Partner",
      amount: 999,
      gst: 180,
      status: "Paid",
      date: "01 Aug 2026",
    },
  ];

  if (!canViewSubscription) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view subscription plans or billing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="SaaS Subscription & Plan Entitlements"
        description={`Active tier, usage limits, and GST subscription invoices for ${currentSeller?.company}.`}
        breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Subscription" }]}
      />

      {/* Downgrade block alert if triggered */}
      {downgradeError && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-start justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">Plan Downgrade Blocked</p>
              <p className="text-rose-200/90 mt-0.5">{downgradeError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDowngradeError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner: Current Plan Overview & Usage Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Plan Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-obsidian-900 to-obsidian-950 border border-gold-500/30 rounded-xl p-6 relative overflow-hidden space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                Current Active Tier
              </span>
              <h2 className="text-xl font-serif font-bold text-cream-100 mt-1">
                {activePlan.name}
              </h2>
            </div>
            <Badge variant="gold" size="sm">
              Active
            </Badge>
          </div>

          <p className="text-xs text-cream-300 leading-relaxed">
            {activePlan.description}
          </p>

          <div className="pt-2 border-t border-obsidian-800 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-gold-300">
                {billingCycle === "monthly"
                  ? formatINR(activePlan.priceMonthly)
                  : formatINR(activePlan.priceYearly)}
              </span>
              <span className="text-xs text-cream-400 ml-1">
                /{billingCycle === "monthly" ? "month" : "year"} + 18% GST
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Commission: {activePlan.limits.commissionRate}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-cream-400 pt-2 border-t border-obsidian-800">
            <span>Next Billing: 01 Nov 2026</span>
            {canEditSubscription && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-rose-400 hover:text-rose-300 text-xs"
              >
                Pause / Cancel
              </button>
            )}
          </div>
        </div>

        {/* Usage Meters (7 cols) */}
        <div className="lg:col-span-7 bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-cream-100">
            Real-Time Resource Usage Against Plan Quotas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Products Meter */}
            <div className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cream-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gold-400" /> Catalog Products
                </span>
                <span className="font-mono text-cream-100 font-semibold">
                  {currentProductsCount} / {activePlan.limits.maxProducts === 9999 ? "∞" : activePlan.limits.maxProducts}
                </span>
              </div>
              <div className="h-1.5 w-full bg-obsidian-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentProductsCount / (activePlan.limits.maxProducts || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Staff Meter */}
            <div className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cream-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gold-400" /> Staff Seats
                </span>
                <span className="font-mono text-cream-100 font-semibold">
                  {currentStaffCount} / {activePlan.id === "plan-free" ? "1" : activePlan.id === "plan-starter" ? "3" : "∞"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-obsidian-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentStaffCount / (activePlan.id === "plan-free" ? 1 : activePlan.id === "plan-starter" ? 3 : 9999)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Orders this month */}
            <div className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cream-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-gold-400" /> Orders This Month
                </span>
                <span className="font-mono text-cream-100 font-semibold">
                  {currentOrdersThisMonth} / {activePlan.limits.maxOrdersPerMonth === 99999 ? "∞" : activePlan.limits.maxOrdersPerMonth}
                </span>
              </div>
              <div className="h-1.5 w-full bg-obsidian-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentOrdersThisMonth / (activePlan.limits.maxOrdersPerMonth || 100)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Warehouses */}
            <div className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cream-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gold-400" /> Warehouses
                </span>
                <span className="font-mono text-cream-100 font-semibold">
                  {currentWarehouseCount} / 3
                </span>
              </div>
              <div className="h-1.5 w-full bg-obsidian-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{ width: `${(currentWarehouseCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison Matrix */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-cream-100">
              Available SaaS Distributor Plans
            </h3>
            <p className="text-xs text-cream-400 mt-0.5">
              Upgrade instantly to unlock catalog scale, lower commission rates, and priority algorithm placement.
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center gap-2 bg-obsidian-950 border border-obsidian-800 rounded-lg p-1 self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                billingCycle === "monthly" ? "bg-gold-500/20 text-gold-300" : "text-cream-400"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                billingCycle === "yearly" ? "bg-gold-500/20 text-gold-300" : "text-cream-400"
              }`}
            >
              Yearly (2 Months Free)
              <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansData.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-5 flex flex-col justify-between space-y-5 transition-all ${
                  isCurrent
                    ? "bg-obsidian-950 border-gold-500/50 shadow-lg shadow-gold-500/5 ring-1 ring-gold-500/30"
                    : "bg-obsidian-950/60 border-obsidian-800 hover:border-obsidian-700"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-cream-100">{plan.name}</h4>
                    {isCurrent && (
                      <Badge variant="gold" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>

                  <div>
                    <span className="text-2xl font-bold font-mono text-gold-300">
                      {price === 0 ? "₹0" : formatINR(price)}
                    </span>
                    <span className="text-xs text-cream-400 ml-1">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                    <span className="text-[11px] text-cream-500 block mt-0.5">
                      Platform Commission: <strong className="text-cream-200">{plan.limits.commissionRate}%</strong>
                    </span>
                  </div>

                  <p className="text-xs text-cream-400">{plan.description}</p>

                  <div className="space-y-2 pt-2 border-t border-obsidian-850">
                    <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider block">
                      Tier Inclusions:
                    </span>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-cream-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-obsidian-850">
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "gold"}
                    className="w-full"
                    disabled={isCurrent || !canEditSubscription}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrent ? "Current Plan" : `Switch to ${plan.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing & Invoice History Table */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-cream-100">
          SaaS Subscription Invoices (GST Compliant)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-obsidian-950 text-cream-400 text-[10px] uppercase">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Billing Cycle</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800 text-cream-200">
              {billingHistory.map((inv) => (
                <tr key={inv.id} className="hover:bg-obsidian-850/50">
                  <td className="p-3 font-mono font-bold text-cream-100">{inv.id}</td>
                  <td className="p-3 text-cream-400">{inv.period}</td>
                  <td className="p-3 font-medium text-cream-200">{inv.planName}</td>
                  <td className="p-3 text-right font-mono text-gold-300 font-semibold">
                    {formatINR(inv.amount + inv.gst)}
                  </td>
                  <td className="p-3">
                    <Badge variant="success" size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrintInvoice(inv)}
                    >
                      <Printer className="w-3 h-3 mr-1" /> View Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Upgrade / Switch Confirmation Dialog */}
      {upgradeModalPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              Confirm Plan Switch: {upgradeModalPlan.name}
            </h3>
            <p className="text-xs text-cream-400">
              Your billing will be adjusted immediately with prorated credits from your current cycle.
            </p>

            <div className="p-3.5 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-cream-400">Target Plan:</span>
                <span className="font-bold text-cream-100">{upgradeModalPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-400">Billing Cycle:</span>
                <span className="capitalize text-cream-200">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-400">Recurring Price:</span>
                <span className="font-mono text-gold-300 font-bold">
                  {formatINR(
                    billingCycle === "monthly"
                      ? upgradeModalPlan.priceMonthly
                      : upgradeModalPlan.priceYearly
                  )} + 18% GST
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setUpgradeModalPlan(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="gold" onClick={handleConfirmPlanChange}>
                Simulate Payment & Activate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel / Pause Confirmation */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              Pause or Cancel Distributor Subscription
            </h3>
            <p className="text-xs text-cream-400">
              Cancelling will maintain your catalog access until the end of the current billing cycle (31 Oct 2026), after which offers will be paused.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setCancelModalOpen(false)}>
                Keep Active
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  showToast.info("Subscription scheduled to pause on 31 Oct 2026.");
                  setCancelModalOpen(false);
                }}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VIEW: Subscription Invoice */}
      {printInvoice && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="bg-white text-slate-900 max-w-2xl w-full rounded-lg shadow-2xl p-8 space-y-6 relative print:p-0">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 print:hidden">
              <span className="text-sm font-bold">SaaS Subscription Tax Invoice</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setPrintInvoice(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-lg font-bold">CELEBS ALLEY PLATFORM INVOICE</h1>
                  <p className="text-slate-500 font-mono">Invoice: {printInvoice.id}</p>
                  <p className="text-slate-500">Date: {printInvoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Celebs Alley Technologies Pvt Ltd</p>
                  <p className="text-slate-500">GSTIN: 27AABCC9981N1Z2</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-bold text-slate-700">Subscriber Details:</p>
                <p>{currentSeller?.company}</p>
                <p>GSTIN: {currentSeller?.gstin || currentSeller?.gstNumber || "27AAACB1234F1Z5"}</p>
                <p>{currentSeller?.city}, {currentSeller?.state}</p>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-2">Subscription Description</th>
                    <th className="py-2 text-right">Base Amount</th>
                    <th className="py-2 text-right">GST (18%)</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">
                      {printInvoice.planName} SaaS Tier ({printInvoice.period})
                    </td>
                    <td className="py-2 text-right">₹{printInvoice.amount}</td>
                    <td className="py-2 text-right">₹{printInvoice.gst}</td>
                    <td className="py-2 text-right font-bold">₹{printInvoice.amount + printInvoice.gst}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
