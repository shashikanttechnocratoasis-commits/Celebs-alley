"use client";

import React, { useState } from "react";
import {
  Store,
  Building2,
  Truck,
  ShieldCheck,
  Bell,
  Power,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Edit2,
  MapPin,
  Lock,
  Layers,
  FileText,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import { usePermission } from "@/lib/rbac";
import type { SellerWarehouse } from "@/types";

type SettingsTab =
  | "profile"
  | "kyc"
  | "shipping"
  | "warehouses"
  | "policies"
  | "notifications"
  | "status"
  | "danger";

export default function SellerSettingsPage() {
  const {
    currentUser,
    currentRole,
    sellers,
    warehouses,
    updateSeller,
    toggleSellerPaused,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
  } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";

  // RBAC checks
  const canViewSettings = usePermission("settings", "view");
  const canEditSettings = usePermission("settings", "edit");

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    storeName: currentSeller?.company || "",
    storeSlug: currentSeller?.slug || "royal-beauty-logistics",
    description: currentSeller?.description || "Premier distributor of dermatological and luxury cosmeceutical formulations.",
    supportEmail: currentSeller?.email || "concierge@royalbeauty.in",
    supportPhone: currentSeller?.phone || "+91 98200 11005",
  });

  // Shipping Form state
  const [shippingForm, setShippingForm] = useState({
    handlingTimeHours: currentSeller?.handlingTimeHours || 24,
    freeShippingThreshold: currentSeller?.freeShippingThreshold || 1500,
    shippingFee: currentSeller?.shippingFee || 99,
    allIndiaServiceable: true,
  });

  // Policies Form state
  const [policiesForm, setPoliciesForm] = useState({
    returnWindowDays: 7,
    returnPolicy:
      "Celebs Alley cold-shield products can be returned within 7 days of delivery provided the holographic tamper-evident seal is intact and unopened.",
    authenticityGuarantee:
      "All products dispatched from our licensed distributor warehouses are batch-traceable and 100% authentic from authorized laboratories.",
  });

  // Notification Toggles state
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    returns: true,
    payoutDisbursed: true,
  });

  // Warehouse Modal state
  const [warehouseModal, setWarehouseModal] = useState<{
    open: boolean;
    isEditing: boolean;
    data: Partial<SellerWarehouse>;
  }>({
    open: false,
    isEditing: false,
    data: { name: "", addressLine1: "", city: "Mumbai", state: "Maharashtra", pincode: "400026", isPrimary: false },
  });

  // Pause confirmation modal
  const [pauseConfirmModal, setPauseConfirmModal] = useState(false);

  // Danger zone close store modal
  const [closeConfirmModal, setCloseConfirmModal] = useState(false);
  const [closeInput, setCloseInput] = useState("");

  const sellerWarehouses = warehouses.filter((w) => w.sellerId === sellerId);

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    updateSeller(sellerId, {
      company: profileForm.storeName,
      slug: profileForm.storeSlug,
      description: profileForm.description,
      email: profileForm.supportEmail,
      phone: profileForm.supportPhone,
    });
    showToast.success("Store profile updated successfully.");
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    updateSeller(sellerId, {
      handlingTimeHours: Number(shippingForm.handlingTimeHours),
      freeShippingThreshold: Number(shippingForm.freeShippingThreshold),
      shippingFee: Number(shippingForm.shippingFee),
    });
    showToast.success("Shipping settings saved.");
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    showToast.success("Customer policies updated.");
  };

  const handleTogglePaused = () => {
    if (!canEditSettings) return;
    const isPausedNow = toggleSellerPaused(sellerId);
    setPauseConfirmModal(false);
    if (isPausedNow) {
      showToast.error("Store has been PAUSED. All product listings are hidden from customers.");
    } else {
      showToast.success("Store is now LIVE on Celebs Alley marketplace.");
    }
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    if (warehouseModal.isEditing && warehouseModal.data.id) {
      updateWarehouse(warehouseModal.data.id, warehouseModal.data);
      showToast.success("Warehouse updated.");
    } else {
      addWarehouse({
        sellerId,
        name: warehouseModal.data.name || "New Warehouse",
        address: warehouseModal.data.address || warehouseModal.data.addressLine1 || "Industrial Estate",
        addressLine1: warehouseModal.data.addressLine1 || warehouseModal.data.address || "Industrial Estate",
        city: warehouseModal.data.city || "Mumbai",
        state: warehouseModal.data.state || "Maharashtra",
        pincode: warehouseModal.data.pincode || "400026",
        isPrimary: warehouseModal.data.isPrimary || false,
      });
      showToast.success("Warehouse added.");
    }
    setWarehouseModal({ open: false, isEditing: false, data: {} });
  };

  const handleDeleteWarehouse = (id: string) => {
    if (!canEditSettings) return;
    const res = deleteWarehouse(id);
    if (res.success) {
      showToast.info(res.message);
    } else {
      showToast.error(res.message);
    }
  };

  if (!canViewSettings) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view store settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Distributor Settings & Configuration"
        description={`Manage operational parameters, warehouses, KYC compliance, and shipping rules for ${currentSeller?.company}.`}
        breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Settings" }]}
      />

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-obsidian-800 scrollbar-none">
        {[
          { id: "profile", label: "Store Profile", icon: Store },
          { id: "kyc", label: "Business & KYC", icon: ShieldCheck },
          { id: "shipping", label: "Shipping & SLAs", icon: Truck },
          { id: "warehouses", label: "Warehouses", icon: Building2 },
          { id: "policies", label: "Customer Policies", icon: FileText },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "status", label: "Store Status", icon: Power },
          { id: "danger", label: "Danger Zone", icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
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

      {/* TAB 1: STORE PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-obsidian-800 pb-3">
            <h3 className="text-sm font-semibold text-cream-100">Store Brand & Identity</h3>
            <p className="text-xs text-cream-400">Public customer details displayed across the marketplace.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-cream-300 font-medium block mb-1">Company / Trade Name *</label>
              <Input
                value={profileForm.storeName}
                onChange={(e) => setProfileForm((f) => ({ ...f, storeName: e.target.value }))}
                className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                required
              />
            </div>

            <div>
              <label className="text-cream-300 font-medium block mb-1">Store URL Handle / Slug *</label>
              <div className="flex items-center">
                <span className="bg-obsidian-950 border border-r-0 border-obsidian-800 px-3 py-2 rounded-l-lg text-cream-500 text-xs">
                  celebsalley.com/seller/
                </span>
                <Input
                  value={profileForm.storeSlug}
                  onChange={(e) => setProfileForm((f) => ({ ...f, storeSlug: e.target.value }))}
                  className="rounded-l-none h-9 text-xs bg-obsidian-950 border-obsidian-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-cream-300 font-medium block mb-1">Store Description / Editorial Bio</label>
              <textarea
                value={profileForm.description}
                onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-gold-500/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-cream-300 font-medium block mb-1">Customer Support Email</label>
                <Input
                  type="email"
                  value={profileForm.supportEmail}
                  onChange={(e) => setProfileForm((f) => ({ ...f, supportEmail: e.target.value }))}
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>
              <div>
                <label className="text-cream-300 font-medium block mb-1">Customer Support Hotline</label>
                <Input
                  value={profileForm.supportPhone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, supportPhone: e.target.value }))}
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-obsidian-800 flex justify-end">
            <Button size="sm" variant="gold" type="submit" disabled={!canEditSettings}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Profile Details
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: BUSINESS & KYC (READ-ONLY WITH RE-AUDIT REQUEST) */}
      {activeTab === "kyc" && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-cream-100">Verified Business & Compliance Record</h3>
              <p className="text-xs text-cream-400">Locked legal registration details validated during distributor onboarding.</p>
            </div>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified & Active
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-obsidian-950 rounded-lg flex justify-between">
              <span className="text-cream-400">Legal Registered Name:</span>
              <span className="font-semibold text-cream-100">{currentSeller?.company} Pvt Ltd</span>
            </div>
            <div className="p-3 bg-obsidian-950 rounded-lg flex justify-between">
              <span className="text-cream-400">GSTIN Identification:</span>
              <span className="font-mono font-bold text-cream-100">{currentSeller?.gstin || "27AAACB1234F1Z5"}</span>
            </div>
            <div className="p-3 bg-obsidian-950 rounded-lg flex justify-between">
              <span className="text-cream-400">Income Tax PAN:</span>
              <span className="font-mono font-bold text-cream-100">{currentSeller?.pan || "AAACB1234F"}</span>
            </div>
            <div className="p-3 bg-obsidian-950 rounded-lg flex justify-between">
              <span className="text-cream-400">Bank Account Last 4:</span>
              <span className="font-mono text-cream-100">••••{currentSeller?.bankDetails?.accountNumberLast4 || "8821"}</span>
            </div>
            <div className="p-3 bg-obsidian-950 rounded-lg flex justify-between">
              <span className="text-cream-400">Bank IFSC:</span>
              <span className="font-mono text-cream-100">{currentSeller?.bankDetails?.ifsc || "HDFC0001234"}</span>
            </div>
          </div>

          <div className="p-3.5 bg-obsidian-950/70 border border-obsidian-850 rounded-lg text-xs text-cream-400 flex items-center justify-between">
            <span>Need to update GSTIN or Banking coordinates?</span>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => showToast.info("KYC modification ticket #KYC-MOD-9941 dispatched to compliance desk.")}
            >
              Request Compliance Re-audit
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: SHIPPING & LOGISTICS */}
      {activeTab === "shipping" && (
        <form onSubmit={handleSaveShipping} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-obsidian-800 pb-3">
            <h3 className="text-sm font-semibold text-cream-100">Fulfillment SLAs & Delivery Fees</h3>
            <p className="text-xs text-cream-400">Control handling times and customer shipping fees.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-cream-300 font-medium block mb-1">Standard Handling SLA (Hours to Dispatch)</label>
              <select
                value={shippingForm.handlingTimeHours}
                onChange={(e) => setShippingForm((f) => ({ ...f, handlingTimeHours: Number(e.target.value) }))}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none"
              >
                <option value={12}>Within 12 Hours (Express Cold Chain)</option>
                <option value={24}>Within 24 Hours (Recommended)</option>
                <option value={48}>Within 48 Hours</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-cream-300 font-medium block mb-1">Free Shipping Order Threshold (INR)</label>
                <Input
                  type="number"
                  value={shippingForm.freeShippingThreshold}
                  onChange={(e) => setShippingForm((f) => ({ ...f, freeShippingThreshold: Number(e.target.value) }))}
                  className="h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div>
                <label className="text-cream-300 font-medium block mb-1">Standard Shipping Fee (INR)</label>
                <Input
                  type="number"
                  value={shippingForm.shippingFee}
                  onChange={(e) => setShippingForm((f) => ({ ...f, shippingFee: Number(e.target.value) }))}
                  className="h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                />
              </div>
            </div>

            <div className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 space-y-2">
              <span className="font-semibold text-cream-200 block">Serviceable Territories</span>
              <label className="flex items-center gap-2 text-cream-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shippingForm.allIndiaServiceable}
                  onChange={(e) => setShippingForm((f) => ({ ...f, allIndiaServiceable: e.target.checked }))}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500"
                />
                <span>Ship to All India (all 19,000+ PIN codes via integrated air couriers)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-obsidian-800 flex justify-end">
            <Button size="sm" variant="gold" type="submit" disabled={!canEditSettings}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Shipping Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: WAREHOUSES */}
      {activeTab === "warehouses" && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-cream-100">Fulfillment Hubs & Depots</h3>
              <p className="text-xs text-cream-400">
                Warehouses assigned to your seller account ({sellerWarehouses.length} of 3 allowed on current plan).
              </p>
            </div>

            <Button
              size="sm"
              variant="gold"
              disabled={!canEditSettings || sellerWarehouses.length >= 3}
              onClick={() =>
                setWarehouseModal({
                  open: true,
                  isEditing: false,
                  data: { name: "", addressLine1: "", city: "Mumbai", state: "Maharashtra", pincode: "400026", isPrimary: false },
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Warehouse
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerWarehouses.map((wh) => (
              <div
                key={wh.id}
                className="p-4 bg-obsidian-900 border border-obsidian-800 rounded-xl space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cream-100 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gold-400" />
                    {wh.name}
                  </span>
                  {wh.isPrimary && (
                    <Badge variant="gold" size="sm">
                      Primary
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-cream-400 space-y-0.5">
                  <p className="text-cream-300">{wh.addressLine1}</p>
                  <p>{wh.city}, {wh.state} - {wh.pincode}</p>
                </div>

                <div className="pt-2 border-t border-obsidian-850 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canEditSettings}
                    onClick={() =>
                      setWarehouseModal({
                        open: true,
                        isEditing: true,
                        data: wh,
                      })
                    }
                  >
                    Edit
                  </Button>
                  {!wh.isPrimary && canEditSettings && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteWarehouse(wh.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: POLICIES */}
      {activeTab === "policies" && (
        <form onSubmit={handleSavePolicies} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-obsidian-800 pb-3">
            <h3 className="text-sm font-semibold text-cream-100">Distributor Warranty & Return Policies</h3>
            <p className="text-xs text-cream-400">Policies shown on product detail tabs for your offers.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-cream-300 font-medium block mb-1">Return Window (Days)</label>
              <select
                value={policiesForm.returnWindowDays}
                onChange={(e) => setPoliciesForm((f) => ({ ...f, returnWindowDays: Number(e.target.value) }))}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100"
              >
                <option value={7}>7 Days Return Policy (Marketplace Default)</option>
                <option value={14}>14 Days Extended Return Policy</option>
              </select>
            </div>

            <div>
              <label className="text-cream-300 font-medium block mb-1">Customer Return Policy Disclaimer</label>
              <textarea
                value={policiesForm.returnPolicy}
                onChange={(e) => setPoliciesForm((f) => ({ ...f, returnPolicy: e.target.value }))}
                rows={3}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100"
              />
            </div>

            <div>
              <label className="text-cream-300 font-medium block mb-1">Authenticity & Cold Chain Certificate Text</label>
              <textarea
                value={policiesForm.authenticityGuarantee}
                onChange={(e) => setPoliciesForm((f) => ({ ...f, authenticityGuarantee: e.target.value }))}
                rows={3}
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-obsidian-800 flex justify-end">
            <Button size="sm" variant="gold" type="submit" disabled={!canEditSettings}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Policies
            </Button>
          </div>
        </form>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-obsidian-800 pb-3">
            <h3 className="text-sm font-semibold text-cream-100">Email & In-App Notification Preferences</h3>
            <p className="text-xs text-cream-400">Configure alerts for team operations.</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "newOrders", label: "New Incoming Orders", desc: "Notify immediately when an order is routed to this seller." },
              { id: "lowStock", label: "Low Inventory Warnings", desc: "Trigger alert when warehouse available stock drops below threshold." },
              { id: "returns", label: "Return & RMA Filings", desc: "Alert when a buyer submits a return request on your SKU." },
              { id: "payoutDisbursed", label: "Payout Wire Confirmations", desc: "Send confirmation when a bank disbursement completes." },
            ].map((n) => (
              <label
                key={n.id}
                className="p-3.5 bg-obsidian-950 rounded-lg border border-obsidian-850 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-cream-100">{n.label}</p>
                  <p className="text-[11px] text-cream-400">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[n.id]}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, [n.id]: e.target.checked }))}
                  className="rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-0"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: STORE STATUS (LIVE / PAUSED) */}
      {activeTab === "status" && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-obsidian-800 pb-3">
            <h3 className="text-sm font-semibold text-cream-100">Store Operational Visibility</h3>
            <p className="text-xs text-cream-400">
              Temporarily pause operations during warehouse stock audits or holidays.
            </p>
          </div>

          <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-cream-100">
                Current Status:{" "}
                <span className={currentSeller?.isPaused ? "text-amber-400" : "text-emerald-400"}>
                  {currentSeller?.isPaused ? "PAUSED (OFFLINE)" : "LIVE & VISIBLE"}
                </span>
              </p>
              <p className="text-[11px] text-cream-400 mt-0.5">
                {currentSeller?.isPaused
                  ? "All product offers from your distributor store are currently hidden from public and customer catalog pages."
                  : "Customers can view, scan-match, and purchase your offers in real time."}
              </p>
            </div>

            <Button
              size="sm"
              variant={currentSeller?.isPaused ? "gold" : "danger"}
              disabled={!canEditSettings}
              onClick={() => setPauseConfirmModal(true)}
            >
              {currentSeller?.isPaused ? "Resume Store (Go Live)" : "Pause Operations"}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 8: DANGER ZONE */}
      {activeTab === "danger" && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="border-b border-rose-500/20 pb-3">
            <h3 className="text-sm font-semibold text-rose-300">Danger Zone: Close Store</h3>
            <p className="text-xs text-cream-400">
              Permanently close distributor operations and delist catalog entries.
            </p>
          </div>

          <div className="p-4 bg-obsidian-950 rounded-xl border border-rose-500/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-cream-100">De-register Seller Account</p>
              <p className="text-[11px] text-cream-400 mt-0.5">
                This action requires clearance of all outstanding escrow payouts and fulfillment of pending orders.
              </p>
            </div>

            <Button
              size="sm"
              variant="danger"
              disabled={!canEditSettings}
              onClick={() => setCloseConfirmModal(true)}
            >
              Close Store
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: Warehouse Add/Edit */}
      {warehouseModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              {warehouseModal.isEditing ? "Edit Warehouse" : "Add Fulfillment Warehouse"}
            </h3>

            <form onSubmit={handleSaveWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="text-cream-300 font-medium block mb-1">Warehouse Name *</label>
                <Input
                  required
                  value={warehouseModal.data.name || ""}
                  onChange={(e) =>
                    setWarehouseModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))
                  }
                  placeholder="e.g. Bhiwandi Cold Hub"
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div>
                <label className="text-cream-300 font-medium block mb-1">Address Line *</label>
                <Input
                  required
                  value={warehouseModal.data.addressLine1 || ""}
                  onChange={(e) =>
                    setWarehouseModal((m) => ({ ...m, data: { ...m.data, addressLine1: e.target.value } }))
                  }
                  placeholder="Unit 14, Apex Industrial Park"
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cream-300 font-medium block mb-1">City *</label>
                  <Input
                    required
                    value={warehouseModal.data.city || ""}
                    onChange={(e) =>
                      setWarehouseModal((m) => ({ ...m, data: { ...m.data, city: e.target.value } }))
                    }
                    className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                  />
                </div>
                <div>
                  <label className="text-cream-300 font-medium block mb-1">Pincode *</label>
                  <Input
                    required
                    value={warehouseModal.data.pincode || ""}
                    onChange={(e) =>
                      setWarehouseModal((m) => ({ ...m, data: { ...m.data, pincode: e.target.value } }))
                    }
                    className="h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-obsidian-800">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setWarehouseModal({ open: false, isEditing: false, data: {} })}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="gold" type="submit">
                  Save Warehouse
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pause Confirm */}
      {pauseConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              {currentSeller?.isPaused ? "Resume Store Operations?" : "Pause Store Operations?"}
            </h3>
            <p className="text-xs text-cream-400">
              {currentSeller?.isPaused
                ? "Resuming will immediately restore all active offers to the customer shop."
                : "Pausing will immediately hide all your inventory offers from the customer catalog and prevent new checkout additions."}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setPauseConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={currentSeller?.isPaused ? "gold" : "danger"}
                onClick={handleTogglePaused}
              >
                {currentSeller?.isPaused ? "Confirm & Go Live" : "Confirm Pause"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Danger Zone Confirm Close */}
      {closeConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-rose-400">
              De-register & Close Store
            </h3>
            <p className="text-xs text-cream-400">
              Please type <strong className="text-cream-100 font-mono">{currentSeller?.company}</strong> to confirm closure.
            </p>
            <Input
              value={closeInput}
              onChange={(e) => setCloseInput(e.target.value)}
              placeholder={currentSeller?.company}
              className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setCloseConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={closeInput.trim() !== currentSeller?.company}
                onClick={() => {
                  showToast.info("Store closure request submitted to Super Admin.");
                  setCloseConfirmModal(false);
                }}
              >
                Confirm De-registration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
