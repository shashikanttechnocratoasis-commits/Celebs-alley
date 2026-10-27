"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ChevronRight,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Search,
  Sliders,
  Eye,
  Check,
  X,
  Trash2,
  Mail,
  Phone,
  Crown,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import { usePermission, DEFAULT_PERMISSION_MATRIX } from "@/lib/rbac";
import type { SellerRole, SellerResource, SellerAction, SellerStaff } from "@/types";

const ALL_ROLES: SellerRole[] = [
  "Distributor Owner",
  "Distributor Manager",
  "Inventory Manager",
  "Order Manager",
  "Sales Executive",
  "Accountant",
];

const ALL_RESOURCES: Array<{ id: SellerResource; label: string; icon: any }> = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "products", label: "Product Catalogue & Offers", icon: Package },
  { id: "inventory", label: "Stock & Warehouses", icon: Layers },
  { id: "orders", label: "Orders & Fulfillment", icon: ShoppingBag },
  { id: "returns", label: "Returns & RMA", icon: RotateCcw },
  { id: "customers", label: "Customer Relationship Directory", icon: Users },
  { id: "analytics_revenue", label: "Sales & Financial Analytics", icon: DollarSign },
  { id: "staff", label: "Staff & Team Permissions", icon: Shield },
  { id: "subscription", label: "Subscription & SaaS Plans", icon: CreditCard },
  { id: "payouts", label: "Bank Payouts & Settlements", icon: DollarSign },
  { id: "settings", label: "Store Identity & Settings", icon: Settings },
];

export default function SellerStaffPage() {
  const {
    currentUser,
    currentRole,
    sellers,
    sellerStaff,
    sellerPermissions,
    inviteSellerStaff,
    updateSellerStaff,
    deleteSellerStaff,
    updateSellerPermission,
    resetSellerPermissions,
  } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";

  // RBAC checks
  const canViewStaff = usePermission("staff", "view");
  const canCreateStaff = usePermission("staff", "create");
  const canEditStaff = usePermission("staff", "edit");
  const canDeleteStaff = usePermission("staff", "delete");
  const isOwner = currentRole === "Distributor Owner" || currentRole === "Super Admin";

  const [activeTab, setActiveTab] = useState<"members" | "matrix" | "preview">("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    phone: "+91 ",
    role: "Order Manager" as SellerRole,
  });

  // Edit role modal
  const [editingStaff, setEditingStaff] = useState<SellerStaff | null>(null);

  // Preview as role
  const [previewRole, setPreviewRole] = useState<SellerRole>("Inventory Manager");

  // Plan limits
  const planLimits = useMemo(() => {
    const planId = currentSeller?.planId || "plan-starter";
    if (planId === "plan-free") return { maxStaff: 1, name: "Starter Showcase" };
    if (planId === "plan-starter") return { maxStaff: 3, name: "Growth Partner" };
    return { maxStaff: 9999, name: "Brand Empire" };
  }, [currentSeller]);

  // Filter staff by tenant
  const tenantStaff = useMemo(() => {
    return sellerStaff.filter((s) => s.sellerId === sellerId);
  }, [sellerStaff, sellerId]);

  const filteredStaff = useMemo(() => {
    return tenantStaff.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tenantStaff, roleFilter, searchQuery]);

  const isStaffLimitReached = tenantStaff.length >= planLimits.maxStaff;

  // Handlers
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    const res = inviteSellerStaff({
      sellerId,
      name: inviteForm.name,
      email: inviteForm.email,
      phone: inviteForm.phone,
      role: inviteForm.role,
      status: "active",
    });

    if (res.success) {
      showToast.success(res.message);
      setInviteModalOpen(false);
      setInviteForm({ name: "", email: "", phone: "+91 ", role: "Order Manager" });
    } else {
      showToast.error(res.message);
    }
  };

  const handleToggleStatus = (staff: SellerStaff) => {
    if (!canEditStaff) return;
    if (staff.role === "Distributor Owner") {
      showToast.error("Cannot disable the Distributor Owner account.");
      return;
    }
    const newStatus = staff.status === "active" ? "disabled" : "active";
    updateSellerStaff(staff.id, { status: newStatus });
    showToast.info(`${staff.name}'s account is now ${newStatus}.`);
  };

  const handleDeleteStaff = (staff: SellerStaff) => {
    if (!canDeleteStaff) return;
    if (staff.role === "Distributor Owner") {
      showToast.error("Cannot delete the Owner account.");
      return;
    }
    if (confirm(`Are you sure you want to remove ${staff.name} from your team?`)) {
      deleteSellerStaff(staff.id);
      showToast.info(`${staff.name} was removed from the team.`);
    }
  };

  const handleResendInvite = (staff: SellerStaff) => {
    showToast.success(`Invitation re-dispatched to ${staff.email}.`);
  };

  // Permission Matrix toggles
  const handleTogglePermissionAction = (role: SellerRole, resource: SellerResource, action: SellerAction) => {
    if (!isOwner) return;
    const currentActions = sellerPermissions[role]?.[resource] || [];
    const hasAction = currentActions.includes(action);
    const updated = hasAction
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];

    updateSellerPermission(role, resource, updated);
  };

  if (!canViewStaff) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view team staff or RBAC policies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Staff & Role Permissions (RBAC)"
          description={`Manage team members, roles, and granular security policies for ${currentSeller?.company}.`}
          breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Staff & Roles" }]}
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-xs text-cream-300">
            <span>Staff Limit:</span>
            <span
              className={`font-mono font-bold ${
                isStaffLimitReached ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {tenantStaff.length} / {planLimits.maxStaff === 9999 ? "∞" : planLimits.maxStaff}
            </span>
          </div>

          <Button
            size="sm"
            variant="gold"
            disabled={!canCreateStaff}
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Invite Staff
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-obsidian-800 pb-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "members"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Team Members ({tenantStaff.length})
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "matrix"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Permission Matrix (Owner Only)
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === "preview"
              ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold"
              : "text-cream-400 hover:text-cream-200 hover:bg-obsidian-900"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Role Simulator & Nav Preview
        </button>
      </div>

      {/* TAB 1: TEAM MEMBERS LIST */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or email..."
                className="pl-9 h-9 text-xs bg-obsidian-950 border-obsidian-800"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-800 rounded-lg px-3 py-1.5 text-xs text-cream-200 focus:outline-none focus:border-gold-500/40"
            >
              <option value="all">All Roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-obsidian-950 border-b border-obsidian-800 text-cream-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Last Active</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800 text-cream-200">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-obsidian-850/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300 font-bold text-xs uppercase flex-shrink-0">
                            {staff.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-cream-100 flex items-center gap-1.5">
                              {staff.name}
                              {staff.role === "Distributor Owner" && (
                                <Crown className="w-3.5 h-3.5 text-gold-400" />
                              )}
                            </p>
                            <p className="text-[11px] text-cream-500 font-mono">
                              {staff.email} • {staff.phone || "+91 ••••• •••••"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant={
                            staff.role === "Distributor Owner"
                              ? "gold"
                              : staff.role === "Distributor Manager"
                              ? "outline"
                              : "info"
                          }
                          size="sm"
                        >
                          {staff.role}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            staff.status === "active"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : staff.status === "invited"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              staff.status === "active"
                                ? "bg-emerald-400"
                                : staff.status === "invited"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {staff.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3.5 text-[11px] text-cream-400 font-mono">
                        {staff.lastActive === "Never"
                          ? "Never"
                          : new Date(staff.lastActive).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </td>

                      <td className="p-3.5 text-[11px] text-cream-500 font-mono">
                        {new Date(staff.joinedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEditStaff && staff.role !== "Distributor Owner" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStaff(staff)}
                              >
                                Edit Role
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleToggleStatus(staff)}
                              >
                                {staff.status === "active" ? "Deactivate" : "Activate"}
                              </Button>
                            </>
                          )}
                          {canDeleteStaff && staff.role !== "Distributor Owner" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteStaff(staff)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSION MATRIX EDITOR (OWNER ONLY) */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-obsidian-950 rounded-xl border border-obsidian-800">
            <div>
              <h3 className="text-sm font-semibold text-cream-100 flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold-400" />
                Dynamic RBAC Security Policy Matrix
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Toggling permissions here alters navigation items, API authorization guards, and button availability in real time.
              </p>
            </div>

            {isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Reset all permission matrix rules back to default factory settings?")) {
                    resetSellerPermissions();
                    showToast.info("Permissions reset to defaults.");
                  }
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to Defaults
              </Button>
            )}
          </div>

          {!isOwner && (
            <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>You are viewing this matrix in read-only mode. Only the Distributor Owner can modify access policies.</span>
            </div>
          )}

          {/* Matrix Grid */}
          <div className="space-y-6">
            {ALL_ROLES.filter((r) => r !== "Distributor Owner").map((role) => (
              <div key={role} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-cream-100">{role}</h4>
                    <p className="text-[11px] text-cream-400">
                      Configured for {tenantStaff.filter((s) => s.role === role).length} assigned staff member(s).
                    </p>
                  </div>
                  <Badge variant="gold" size="sm">
                    Active Policy
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_RESOURCES.map((res) => {
                    const Icon = res.icon;
                    const actions = sellerPermissions[role]?.[res.id] || [];
                    const canView = actions.includes("view");
                    const canEdit = actions.includes("edit") || actions.includes("create");

                    return (
                      <div
                        key={res.id}
                        className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-850 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 text-gold-400 flex-shrink-0" />
                          <span className="text-xs text-cream-200 font-medium truncate">
                            {res.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* View Toggle */}
                          <button
                            type="button"
                            disabled={!isOwner}
                            onClick={() => handleTogglePermissionAction(role, res.id, "view")}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              canView
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-obsidian-900 text-cream-500 border border-obsidian-800"
                            }`}
                          >
                            View
                          </button>

                          {/* Edit Toggle */}
                          <button
                            type="button"
                            disabled={!isOwner}
                            onClick={() => handleTogglePermissionAction(role, res.id, "edit")}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              canEdit
                                ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                                : "bg-obsidian-900 text-cream-500 border border-obsidian-800"
                            }`}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROLE SIMULATOR & NAV PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="p-4 bg-obsidian-900 border border-obsidian-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-cream-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold-400" />
                Live Role Perspective Sandbox
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Select a role to verify what routes, sidebar navigation links, and financial figures they can see.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-cream-400">Simulate Role:</span>
              <select
                value={previewRole}
                onChange={(e) => setPreviewRole(e.target.value as SellerRole)}
                className="bg-obsidian-950 border border-gold-500/40 rounded-lg px-3 py-1.5 text-xs text-gold-300 focus:outline-none"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Simulated Sidebar */}
            <div className="md:col-span-4 bg-obsidian-950 border border-obsidian-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-obsidian-850">
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-serif font-bold text-cream-100">
                  Simulated Sidebar Navigation
                </span>
              </div>

              <div className="space-y-1">
                {[
                  { label: "Dashboard", res: "dashboard", href: "/seller" },
                  { label: "Products & Catalogue", res: "products", href: "/seller/products" },
                  { label: "Inventory & Stock", res: "inventory", href: "/seller/inventory" },
                  { label: "Orders & Fulfillment", res: "orders", href: "/seller/orders" },
                  { label: "Customer Directory", res: "customers", href: "/seller/customers" },
                  { label: "Sales Analytics", res: "analytics_revenue", href: "/seller/analytics" },
                  { label: "Staff & Roles", res: "staff", href: "/seller/staff" },
                  { label: "Subscription Plans", res: "subscription", href: "/seller/subscription" },
                  { label: "Payouts & Settlements", res: "payouts", href: "/seller/payouts" },
                  { label: "Store Settings", res: "settings", href: "/seller/settings" },
                ].map((item) => {
                  const allowed =
                    previewRole === "Distributor Owner" ||
                    (sellerPermissions[previewRole]?.[item.res as SellerResource] || []).length > 0;

                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        allowed
                          ? "bg-obsidian-900 text-cream-100 font-medium"
                          : "bg-obsidian-900/30 text-cream-600 line-through"
                      }`}
                    >
                      <span>{item.label}</span>
                      {allowed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-cream-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Access Card */}
            <div className="md:col-span-8 bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 space-y-5">
              <h4 className="text-sm font-bold text-cream-100">
                Security Profile Assessment for {previewRole}
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-obsidian-950 rounded-lg flex items-center justify-between">
                  <span className="text-cream-300">Revenue Figures & Gross Margins:</span>
                  {(sellerPermissions[previewRole]?.["analytics_revenue"] || []).includes("view") ||
                  previewRole === "Distributor Owner" ? (
                    <span className="text-emerald-400 font-semibold">Visible</span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Masked (•••• with lock)
                    </span>
                  )}
                </div>

                <div className="p-3 bg-obsidian-950 rounded-lg flex items-center justify-between">
                  <span className="text-cream-300">Bank Payout Withdrawals:</span>
                  {(sellerPermissions[previewRole]?.["payouts"] || []).includes("create") ||
                  previewRole === "Distributor Owner" ? (
                    <span className="text-emerald-400 font-semibold">Allowed</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Blocked</span>
                  )}
                </div>

                <div className="p-3 bg-obsidian-950 rounded-lg flex items-center justify-between">
                  <span className="text-cream-300">Inventory Movement & Restock Writes:</span>
                  {(sellerPermissions[previewRole]?.["inventory"] || []).includes("edit") ||
                  previewRole === "Distributor Owner" ? (
                    <span className="text-emerald-400 font-semibold">Allowed</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Read Only / Blocked</span>
                  )}
                </div>

                <div className="p-3 bg-obsidian-950 rounded-lg flex items-center justify-between">
                  <span className="text-cream-300">Shipment Status Mutations (Pack / Ship):</span>
                  {(sellerPermissions[previewRole]?.["orders"] || []).includes("edit") ||
                  previewRole === "Distributor Owner" ? (
                    <span className="text-emerald-400 font-semibold">Allowed</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Blocked</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Invite Staff */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-cream-100">
                Invite Staff Member
              </h3>
              <p className="text-xs text-cream-400 mt-1">
                Add an operator or executive to {currentSeller?.company}.
              </p>
            </div>

            {isStaffLimitReached && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-lg text-xs text-amber-300 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Staff Limit Reached ({planLimits.maxStaff} max on {planLimits.name})
                </p>
                <p className="text-[11px] text-cream-300">
                  Please upgrade to the Business or Enterprise tier to invite more users.
                </p>
                <Link href="/seller/subscription">
                  <Button size="sm" variant="gold" className="w-full mt-1">
                    Upgrade Subscription
                  </Button>
                </Link>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="rahul@company.com"
                  className="h-9 text-xs bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Mobile (+91)
                </label>
                <Input
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98200 12345"
                  className="h-9 text-xs font-mono bg-obsidian-950 border-obsidian-800"
                />
              </div>

              <div>
                <label className="text-xs text-cream-300 font-medium block mb-1">
                  Assigned Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as SellerRole }))}
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-gold-500/40"
                >
                  {ALL_ROLES.filter((r) => r !== "Distributor Owner").map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-obsidian-800">
                <Button size="sm" variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="gold" type="submit" disabled={isStaffLimitReached}>
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Role */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-serif font-bold text-cream-100">
              Update Role: {editingStaff.name}
            </h3>
            <div>
              <label className="text-xs text-cream-300 font-medium block mb-1">
                Role Assignment
              </label>
              <select
                defaultValue={editingStaff.role}
                id="role-select"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-2.5 text-xs text-cream-100 focus:outline-none focus:border-gold-500/40"
              >
                {ALL_ROLES.filter((r) => r !== "Distributor Owner").map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="gold"
                onClick={() => {
                  const sel = document.getElementById("role-select") as HTMLSelectElement;
                  if (sel) {
                    updateSellerStaff(editingStaff.id, { role: sel.value as SellerRole });
                    showToast.success(`Updated ${editingStaff.name}'s role to ${sel.value}.`);
                    setEditingStaff(null);
                  }
                }}
              >
                Apply Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
