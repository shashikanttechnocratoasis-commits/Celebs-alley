"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Plus,
  X,
  FileText,
  Clock,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { User, Role } from "@/types";

type UserTab = "all" | "customers" | "staff" | "consultants" | "admins";

export default function UserManagementPage() {
  const {
    users,
    orders,
    scans,
    adminNotes,
    toggleUserStatus,
    addAdminUser,
    resetUserPassword,
    addAdminNote,
    revealMaskedField,
  } = useAppStore();

  const { canEdit, canDelete } = useAdminPermission("users");

  // Tabs & Search & Filter
  const [activeTab, setActiveTab] = useState<UserTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected User for Detail Drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Masking reveal state for privacy
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  // Create Admin Staff Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<Role>("Admin");
  const [newAdminCity, setNewAdminCity] = useState("Mumbai");

  // Add Internal Note inside Drawer
  const [newNoteText, setNewNoteText] = useState("");

  // Filtered cities list
  const cities = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.city) set.add(u.city);
    });
    return Array.from(set);
  }, [users]);

  // Tab categorization
  const isCustomer = (role: Role) => role === "Customer";
  const isStaff = (role: Role) =>
    [
      "Distributor Owner",
      "Distributor Manager",
      "Inventory Manager",
      "Order Manager",
      "Sales Executive",
      "Accountant",
    ].includes(role);
  const isConsultant = (role: Role) => role === "Consultant";
  const isAdminRole = (role: Role) =>
    ["Super Admin", "Admin", "Product Manager", "AI/Rule Manager", "Support Agent", "Finance Manager"].includes(
      role
    );

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab Filter
      if (activeTab === "customers" && !isCustomer(u.role)) return false;
      if (activeTab === "staff" && !isStaff(u.role)) return false;
      if (activeTab === "consultants" && !isConsultant(u.role)) return false;
      if (activeTab === "admins" && !isAdminRole(u.role)) return false;

      // Status Filter
      if (statusFilter !== "all" && u.status !== statusFilter) return false;

      // City Filter
      if (cityFilter !== "all" && u.city !== cityFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(query);
        const matchEmail = u.email.toLowerCase().includes(query);
        const matchRole = u.role.toLowerCase().includes(query);
        const matchCity = u.city?.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchRole && !matchCity) return false;
      }

      return true;
    });
  }, [users, activeTab, statusFilter, cityFilter, searchQuery]);

  // Paginated list
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // Privacy Reveal Handler
  const handleReveal = (userId: string, field: "phone" | "email") => {
    const key = `${userId}-${field}`;
    if (!revealedFields[key]) {
      revealMaskedField("users", userId, field);
      setRevealedFields((prev) => ({ ...prev, [key]: true }));
    } else {
      setRevealedFields((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Masking helpers
  const maskEmail = (email: string, isRevealed: boolean) => {
    if (isRevealed) return email;
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    const masked = name.slice(0, 2) + "***" + name.slice(-1);
    return `${masked}@${domain}`;
  };

  const maskPhone = (phone: string, isRevealed: boolean) => {
    if (isRevealed) return phone;
    return phone.replace(/(\+?\d{2})\s?(\d{2})\d{4}(\d{3})/, "$1 $2****$3");
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ["ID", "Name", "Role", "Email", "Phone", "City", "Status", "Registered"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      `"${u.role}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.city || "N/A"}"`,
      `"${u.status || "active"}"`,
      `"${u.signupDate || "N/A"}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Admin
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    addAdminUser({
      name: newAdminName,
      email: newAdminEmail,
      phone: newAdminPhone || "+91 98200 11999",
      role: newAdminRole,
      city: newAdminCity,
      avatar: "",
    });

    setIsCreateModalOpen(false);
    setNewAdminName("");
    setNewAdminEmail("");
  };

  // Add Note to User Drawer
  const handleAddNote = () => {
    if (!selectedUser || !newNoteText.trim()) return;
    addAdminNote("user", selectedUser.id, newNoteText);
    setNewNoteText("");
  };

  const userNotes = useMemo(() => {
    if (!selectedUser) return [];
    return adminNotes.filter((n) => n.entityId === selectedUser.id);
  }, [adminNotes, selectedUser]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Identity & User Governance"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />

      {/* Top Filter & Action Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Identities", count: users.length },
            {
              id: "customers",
              label: "Customers",
              count: users.filter((u) => isCustomer(u.role)).length,
            },
            {
              id: "staff",
              label: "Seller Staff",
              count: users.filter((u) => isStaff(u.role)).length,
            },
            {
              id: "consultants",
              label: "Consultants",
              count: users.filter((u) => isConsultant(u.role)).length,
            },
            {
              id: "admins",
              label: "Platform Admins",
              count: users.filter((u) => isAdminRole(u.role)).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as UserTab);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-850 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" /> Export CSV
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canEdit}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Provision Admin Staff
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, role, masked email or city..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Identity Name</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Masked Contact (DPDP)</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right pr-6">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {paginatedUsers.map((user) => {
                const isEmailRevealed = !!revealedFields[`${user.id}-email`];
                const isPhoneRevealed = !!revealedFields[`${user.id}-phone`];
                const isSuspended = user.status === "suspended";

                return (
                  <tr
                    key={user.id}
                    className={`transition hover:bg-zinc-900/40 ${
                      isSuspended ? "bg-red-950/5 opacity-75" : ""
                    }`}
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-xs font-bold text-amber-300 border border-amber-500/30">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{user.name}</span>
                          <span className="font-mono text-[10px] text-zinc-500">{user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-2.5 py-1 font-medium text-zinc-300 border border-zinc-700/60">
                        <Shield className="h-3 w-3 text-amber-400" /> {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-300">
                            {maskEmail(user.email, isEmailRevealed)}
                          </span>
                          <button
                            onClick={() => handleReveal(user.id, "email")}
                            title={isEmailRevealed ? "Hide PII" : "Reveal PII (Audited)"}
                            className="text-zinc-500 hover:text-amber-400"
                          >
                            {isEmailRevealed ? (
                              <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="font-mono">
                            {maskPhone(user.phone, isPhoneRevealed)}
                          </span>
                          <button
                            onClick={() => handleReveal(user.id, "phone")}
                            title={isPhoneRevealed ? "Hide PII" : "Reveal PII (Audited)"}
                            className="text-zinc-500 hover:text-amber-400"
                          >
                            {isPhoneRevealed ? (
                              <EyeOff className="h-3 w-3 text-amber-400" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{user.city || "Pan-India"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                          <AlertTriangle className="h-3 w-3" /> SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-700 hover:text-white"
                        >
                          Inspect Record
                        </button>

                        <button
                          onClick={() =>
                            toggleUserStatus(
                              user.id,
                              isSuspended ? "active" : "suspended",
                              isSuspended ? "Administrative reinstatement" : "Security compliance violation"
                            )
                          }
                          disabled={!canEdit}
                          title={isSuspended ? "Reactivate User" : "Suspend User Access"}
                          className={`rounded-lg p-1.5 transition ${
                            isSuspended
                              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          } disabled:opacity-40`}
                        >
                          {isSuspended ? (
                            <UserCheck className="h-3.5 w-3.5" />
                          ) : (
                            <UserX className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                    No platform identities match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3.5 text-xs text-zinc-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Inspect Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-base font-bold text-amber-300 border border-amber-500/30">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedUser.name}</h3>
                  <span className="text-xs font-mono text-zinc-400">{selectedUser.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetUserPassword(selectedUser.id);
                  alert(`Dispatched password reset instructions to ${selectedUser.email}`);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-800"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-400" /> Reset Password
              </button>

              <button
                onClick={() =>
                  toggleUserStatus(
                    selectedUser.id,
                    selectedUser.status === "suspended" ? "active" : "suspended"
                  )
                }
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold ${
                  selectedUser.status === "suspended"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                }`}
              >
                {selectedUser.status === "suspended" ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" /> Reactivate Account
                  </>
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5" /> Suspend Account
                  </>
                )}
              </button>
            </div>

            {/* Account Metadata Cards */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 text-xs">
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                Profile & DPDP Governance
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Primary Role</span>
                  <span className="font-semibold text-white">{selectedUser.role}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[11px]">City / Region</span>
                  <span className="font-semibold text-white">{selectedUser.city || "Pan-India"}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[11px]">Account Status</span>
                  <span
                    className={`font-bold ${
                      selectedUser.status === "suspended" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {(selectedUser.status || "active").toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[11px]">Onboarding Timestamp</span>
                  <span className="font-mono text-zinc-300">
                    {selectedUser.signupDate || "2026-01-10"}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Footprint Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 text-xs">
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                Platform Footprint
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                  <span className="text-zinc-500 text-[11px] block">Customer Orders</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {orders.filter((o) => o.customerId === selectedUser.id).length}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                  <span className="text-zinc-500 text-[11px] block">Diagnostic Scans</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {scans.filter((s) => s.id.includes(selectedUser.id)).length || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes Thread */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-300 text-xs flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-amber-400" /> Internal Administrative Notes
              </h4>

              <div className="space-y-2">
                {userNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-semibold text-amber-300">{note.authorName}</span>
                      <span className="font-mono text-zinc-500">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{note.text}</p>
                  </div>
                ))}

                {userNotes.length === 0 && (
                  <p className="text-xs text-zinc-500 italic">No governance notes recorded yet.</p>
                )}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record an internal compliance or verification note..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={handleAddNote}
                  className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Post Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision Admin Staff Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-white">Provision Admin Staff Member</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g., Deepika Sen"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Official Work Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="deepika.pm@celebsalley.com"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Administrative Role</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as Role)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Admin">Admin (General Ops)</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="AI/Rule Manager">AI/Rule Manager</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Primary Office Location</label>
                  <select
                    value={newAdminCity}
                    onChange={(e) => setNewAdminCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                >
                  Create & Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
