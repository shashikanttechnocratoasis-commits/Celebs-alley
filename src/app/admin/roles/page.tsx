"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { SensitiveActionModal } from "@/components/admin/SensitiveActionModal";
import {
  Shield,
  Check,
  X,
  RotateCcw,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  Cpu,
} from "lucide-react";
import type {
  AdminRole,
  AdminResource,
  AdminAction,
  SellerRole,
  SellerResource,
  SellerAction,
} from "@/types";

const ADMIN_RESOURCES: AdminResource[] = [
  "dashboard",
  "users",
  "distributors",
  "parameters",
  "rules",
  "versions",
  "products",
  "categories",
  "brands",
  "ingredients",
  "orders",
  "payments",
  "refunds",
  "coupons",
  "commissions",
  "marketing",
  "cms",
  "support",
  "finance",
  "security",
  "audit",
  "roles",
];

const ADMIN_ACTIONS: AdminAction[] = ["view", "create", "edit", "delete", "approve", "export"];

const SELLER_RESOURCES: SellerResource[] = [
  "dashboard",
  "products",
  "inventory",
  "orders",
  "returns",
  "customers",
  "analytics_revenue",
  "staff",
  "subscription",
  "payouts",
  "settings",
];

const SELLER_ACTIONS: SellerAction[] = ["view", "create", "edit", "delete", "approve"];

export default function PlatformRolesPermissionsPage() {
  const {
    adminPermissions,
    sellerPermissions,
    updateAdminPermission,
    resetAdminPermissions,
    updateSellerPermission,
  } = useAppStore();

  const { isSuperAdmin, canEdit } = useAdminPermission("roles");

  // Main Sector Switcher: Admin Roles vs Seller Roles
  const [scope, setScope] = useState<"admin" | "seller">("admin");

  // Selected Role
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdminRole>("Admin");
  const [selectedSellerRole, setSelectedSellerRole] = useState<SellerRole>("Distributor Manager");

  // Reset Confirmation Modal
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Success Flash
  const [statusMsg, setStatusMsg] = useState("");

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  // Toggle Admin Action
  const handleToggleAdminAction = (resource: AdminResource, action: AdminAction) => {
    if (!isSuperAdmin) {
      alert("Only Super Admin can modify the platform permission matrix.");
      return;
    }
    if (selectedAdminRole === "Super Admin") {
      alert("Super Admin permissions are foundational and cannot be demoted.");
      return;
    }

    const currentActions = adminPermissions[selectedAdminRole]?.[resource] || [];
    const hasAction = currentActions.includes(action);
    const updated = hasAction
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];

    updateAdminPermission(selectedAdminRole, resource, updated);
    showStatus(`Updated ${selectedAdminRole} permission on [${resource}.${action}].`);
  };

  // Toggle Seller Action
  const handleToggleSellerAction = (resource: SellerResource, action: SellerAction) => {
    if (!canEdit) return;
    if (selectedSellerRole === "Distributor Owner") {
      alert("Distributor Owner maintains unconstrained tenant privileges.");
      return;
    }

    const currentActions = sellerPermissions[selectedSellerRole]?.[resource] || [];
    const hasAction = currentActions.includes(action);
    const updated = hasAction
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];

    updateSellerPermission(selectedSellerRole, resource, updated);
    showStatus(`Updated ${selectedSellerRole} permission on [${resource}.${action}].`);
  };

  const handleResetDefaults = () => {
    resetAdminPermissions();
    setIsResetOpen(false);
    showStatus("Permissions matrix restored to baseline clinical defaults.");
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Roles & RBAC Privilege Matrix"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Roles" }]}
      />

      {statusMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Scope Selector Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope("admin")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              scope === "admin"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" /> Admin Governance Roles (6)
          </button>

          <button
            onClick={() => setScope("seller")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              scope === "seller"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" /> Distributor SaaS Roles (6)
          </button>
        </div>

        <button
          onClick={() => setIsResetOpen(true)}
          disabled={!isSuperAdmin}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-500/50 hover:text-white disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Reset to Clinical Defaults
        </button>
      </div>

      {/* ADMIN RBAC VIEW */}
      {scope === "admin" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Role Picker (3 Cols) */}
          <div className="space-y-2 lg:col-span-3">
            <span className="text-xs font-medium text-zinc-400 block px-1">
              Select Governance Role
            </span>
            {(
              [
                "Super Admin",
                "Admin",
                "Product Manager",
                "AI/Rule Manager",
                "Support Agent",
                "Finance Manager",
              ] as AdminRole[]
            ).map((role) => {
              const isSelected = selectedAdminRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedAdminRole(role)}
                  className={`w-full text-left rounded-xl p-3.5 text-xs font-semibold transition border ${
                    isSelected
                      ? "border-amber-500/50 bg-amber-950/20 text-white shadow-md shadow-amber-500/5"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    {role === "Super Admin" && <Lock className="h-3 w-3 text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Matrix Grid (9 Cols) */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md lg:col-span-9">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Privilege Matrix for {selectedAdminRole}
                </h3>
                <p className="text-xs text-zinc-400">
                  Click cell checkboxes to grant or revoke mutation privileges across admin resource endpoints.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3 pl-5 pr-3">Admin Resource</th>
                    {ADMIN_ACTIONS.map((action) => (
                      <th key={action} className="px-3 py-3 text-center uppercase font-mono">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {ADMIN_RESOURCES.map((resource) => {
                    const permitted =
                      adminPermissions[selectedAdminRole]?.[resource] || [];

                    return (
                      <tr key={resource} className="transition hover:bg-zinc-900/40">
                        <td className="py-3 pl-5 pr-3 font-semibold text-white font-mono">
                          {resource}
                        </td>

                        {ADMIN_ACTIONS.map((action) => {
                          const isAllowed = permitted.includes(action);
                          const isLocked = selectedAdminRole === "Super Admin";

                          return (
                            <td key={action} className="px-3 py-3 text-center">
                              <button
                                onClick={() => handleToggleAdminAction(resource, action)}
                                disabled={isLocked || !isSuperAdmin}
                                className={`h-6 w-6 rounded-md inline-flex items-center justify-center transition border ${
                                  isAllowed
                                    ? "bg-amber-500 text-black border-amber-400"
                                    : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-600"
                                } disabled:opacity-60`}
                              >
                                {isAllowed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SELLER RBAC VIEW */}
      {scope === "seller" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Role Picker (3 Cols) */}
          <div className="space-y-2 lg:col-span-3">
            <span className="text-xs font-medium text-zinc-400 block px-1">
              Select Distributor Role
            </span>
            {(
              [
                "Distributor Owner",
                "Distributor Manager",
                "Inventory Manager",
                "Order Manager",
                "Sales Executive",
                "Accountant",
              ] as SellerRole[]
            ).map((role) => {
              const isSelected = selectedSellerRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedSellerRole(role)}
                  className={`w-full text-left rounded-xl p-3.5 text-xs font-semibold transition border ${
                    isSelected
                      ? "border-amber-500/50 bg-amber-950/20 text-white shadow-md shadow-amber-500/5"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    {role === "Distributor Owner" && <Lock className="h-3 w-3 text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Matrix Grid (9 Cols) */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md lg:col-span-9">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Distributor SaaS Matrix for {selectedSellerRole}
                </h3>
                <p className="text-xs text-zinc-400">
                  Shared single source of truth across both Admin governance and Seller Tenant settings.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3 pl-5 pr-3">Tenant Resource</th>
                    {SELLER_ACTIONS.map((action) => (
                      <th key={action} className="px-3 py-3 text-center uppercase font-mono">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {SELLER_RESOURCES.map((resource) => {
                    const permitted =
                      sellerPermissions[selectedSellerRole]?.[resource] || [];

                    return (
                      <tr key={resource} className="transition hover:bg-zinc-900/40">
                        <td className="py-3 pl-5 pr-3 font-semibold text-white font-mono">
                          {resource}
                        </td>

                        {SELLER_ACTIONS.map((action) => {
                          const isAllowed = permitted.includes(action);
                          const isLocked = selectedSellerRole === "Distributor Owner";

                          return (
                            <td key={action} className="px-3 py-3 text-center">
                              <button
                                onClick={() => handleToggleSellerAction(resource, action)}
                                disabled={isLocked || !canEdit}
                                className={`h-6 w-6 rounded-md inline-flex items-center justify-center transition border ${
                                  isAllowed
                                    ? "bg-amber-500 text-black border-amber-400"
                                    : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-600"
                                } disabled:opacity-60`}
                              >
                                {isAllowed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <SensitiveActionModal
        open={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetDefaults}
        title="Restore Clinical RBAC Defaults"
        description="Resetting the permission matrix will revert all custom action overrides across both Super Admin staff and Distributor SaaS roles back to factory default policies."
        confirmLabel="Reset All Permissions"
        requireTypeConfirm={isSuperAdmin}
        expectedKeyword="CONFIRM"
      />
    </div>
  );
}
