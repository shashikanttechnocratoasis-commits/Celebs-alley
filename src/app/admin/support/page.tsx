"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Send,
  MessageSquare,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Eye,
  EyeOff,
  Package,
  ShieldAlert,
  Flame,
  Check,
} from "lucide-react";
import type { Ticket, TicketMessage, Customer, Order } from "@/types";

const CANNED_REPLIES = [
  "Thank you for contacting Celebs Alley Concierge. We are reviewing your diagnostic formulation with Dr. Meera Nambiar.",
  "Your return dispute has been verified. A courier reverse pickup has been scheduled with Delhivery Logistics.",
  "The distributor fulfillment hub has verified dispatch. Your tracking reference will update within 4 hours.",
  "We have escalated this inquiry to our Chief Regulatory Officer for immediate verification.",
];

export default function SupportConciergeDeskPage() {
  const {
    tickets,
    customers,
    orders,
    currentUser,
    addTicketReply,
    updateTicketStatus,
    logAuditEvent,
  } = useAppStore();

  const { canEdit } = useAdminPermission("support");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || "");
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Customer Lookup Modal & Unmasking
  const [lookupCustomerOpen, setLookupCustomerOpen] = useState(false);
  const [customerLookupQuery, setCustomerLookupQuery] = useState("");
  const [unmaskedCustomerIds, setUnmaskedCustomerIds] = useState<Record<string, boolean>>({});

  // Order Lookup Modal
  const [lookupOrderOpen, setLookupOrderOpen] = useState(false);
  const [orderLookupQuery, setOrderLookupQuery] = useState("");

  // KPI Calculations
  const openTickets = useMemo(() => tickets.filter((t) => t.status === "open"), [tickets]);
  const slaBreachingTickets = useMemo(
    () => tickets.filter((t) => t.priority === "urgent" || t.priority === "high"),
    [tickets]
  );
  const myAssignedCount = useMemo(
    () =>
      tickets.filter(
        (t) => t.assignedTo === currentUser?.id || t.assignedTo === "user-support"
      ).length,
    [tickets, currentUser]
  );
  const ordersNeedingHelpCount = useMemo(
    () => orders.filter((o) => o.status === "processing" || (o as any).dispute).length,
    [orders]
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchUser = (t.userName || t.requesterName || "").toLowerCase().includes(q);
        const matchNumber = t.ticketNumber.toLowerCase().includes(q);
        if (!matchSubject && !matchUser && !matchNumber) return false;
      }

      return true;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || null;
  }, [tickets, selectedTicketId, filteredTickets]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    addTicketReply(selectedTicket.id, replyText.trim(), isInternalNote);
    setReplyText("");
    setIsInternalNote(false);
    showToast.success(isInternalNote ? "Internal staff note added" : "Reply sent to customer");
  };

  const handleStatusChange = (status: Ticket["status"]) => {
    if (!selectedTicket || !canEdit) return;
    updateTicketStatus(selectedTicket.id, status);
  };

  const handlePriorityChange = (priority: Ticket["priority"]) => {
    if (!selectedTicket || !canEdit) return;
    updateTicketStatus(selectedTicket.id, selectedTicket.status, priority);
  };

  // Escalate to Admin
  const handleEscalateToAdmin = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, "in_progress", "urgent");
    addTicketReply(
      selectedTicket.id,
      `[ESCALATION] Ticket escalated to Super Admin governance by ${currentUser?.name || "Support Agent"}. High-priority resolution requested.`,
      true
    );
    logAuditEvent?.({
      actor: currentUser?.name || "Tarun Joshi",
      action: `Escalated Ticket ${selectedTicket.ticketNumber} to Super Admin`,
      resource: "support",
      ipAddress: "127.0.0.1 (Support Desk)",
    });
    showToast.warning(`Ticket ${selectedTicket.ticketNumber} escalated to Super Admin`);
  };

  // Unmask customer data with audit log
  const handleUnmaskCustomer = (cust: Customer) => {
    setUnmaskedCustomerIds((prev) => ({ ...prev, [cust.id]: true }));
    logAuditEvent?.({
      actor: currentUser?.name || "Tarun Joshi",
      action: `Support Agent unmasked PII contact details for customer ${cust.name} (${cust.id})`,
      resource: "customers",
      ipAddress: "127.0.0.1 (Support Desk)",
    });
    showToast.info(`Customer PII unmasked. Logged to Security Audit.`);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Support Agent Operations & Helpdesk"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Support Desk" }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLookupCustomerOpen(true)}
            >
              <User className="w-4 h-4 mr-1.5 text-[#E8C77A]" />
              Customer Lookup
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setLookupOrderOpen(true)}
            >
              <Package className="w-4 h-4 mr-1.5" />
              Order Lookup
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Open Inquiries</span>
          <div className="text-xl font-serif font-bold text-[#F5EDE0]">
            {openTickets.length}
          </div>
          <span className="text-[10px] text-amber-400">Queue active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">SLA Breaching (&lt;4h)</span>
          <div className="text-xl font-serif font-bold text-red-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            {slaBreachingTickets.length}
          </div>
          <span className="text-[10px] text-red-300">Needs priority response</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Avg First Response</span>
          <div className="text-xl font-serif font-bold text-[#E8C77A]">18m</div>
          <span className="text-[10px] text-[#5FAF7A]">94% SLA compliant</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">My Assigned</span>
          <div className="text-xl font-serif font-bold text-[#38BDF8]">
            {myAssignedCount}
          </div>
          <span className="text-[10px] text-[#A89A85]">Support Agent</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140F0A] border border-[#C99A45]/20 space-y-1">
          <span className="text-[11px] text-[#A89A85]">Orders Needing Help</span>
          <div className="text-xl font-serif font-bold text-amber-400">
            {ordersNeedingHelpCount}
          </div>
          <span className="text-[10px] text-[#A89A85]">Disputed / Processing</span>
        </div>
      </div>

      {/* Main Split Layout: Left Ticket List (5 Cols) / Right Conversation Pane (7 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[650px]">
        {/* Left Ticket List */}
        <div className="space-y-4 lg:col-span-5 flex flex-col">
          {/* Search & Filter */}
          <div className="rounded-2xl border border-[#C99A45]/20 bg-[#140F0A] p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A89A85]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket subject, user, or #..."
                className="w-full rounded-xl border border-[#C99A45]/25 bg-[#1A130B] py-2 pl-9 pr-3 text-xs text-[#F5EDE0] placeholder-[#A89A85] focus:border-[#E8C77A] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-xl border border-[#C99A45]/25 bg-[#1A130B] px-2.5 py-1.5 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 rounded-xl border border-[#C99A45]/25 bg-[#1A130B] px-2.5 py-1.5 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tickets Scroll List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-[#E8C77A] bg-[#241A0F] shadow-md shadow-[#C99A45]/10"
                      : "border-[#C99A45]/15 bg-[#1A130B] hover:border-[#C99A45]/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] text-[#E8C77A] font-semibold">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        t.priority === "urgent"
                          ? "bg-red-500/20 text-red-400"
                          : t.priority === "high"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-[#0B0907] text-[#A89A85]"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-[#F5EDE0] mt-1 line-clamp-1">
                    {t.subject}
                  </h4>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#A89A85]">
                    <span className="truncate max-w-[120px]">
                      {t.userName || t.requesterName}
                    </span>
                    <span className="font-mono text-[#A89A85]/70">
                      {t.messages.length} {t.messages.length === 1 ? "msg" : "msgs"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Conversation Pane */}
        <div className="space-y-4 lg:col-span-7 flex flex-col rounded-2xl border border-[#C99A45]/20 bg-[#140F0A] p-6">
          {selectedTicket ? (
            <>
              {/* Ticket Top Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#C99A45]/15 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#E8C77A] font-bold">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="rounded bg-[#1A130B] px-2 py-0.5 text-[10px] font-mono text-[#A89A85] uppercase">
                      {selectedTicket.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F5EDE0] mt-1">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#A89A85] mt-1">
                    <span>
                      From: {selectedTicket.userName || selectedTicket.requesterName} (
                      {selectedTicket.userRole || selectedTicket.requesterRole})
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[#A89A85]/80">
                      {new Date(selectedTicket.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Status & Priority Selectors + Escalate */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    disabled={!canEdit}
                    className="rounded-lg border border-[#C99A45]/30 bg-[#1A130B] px-2.5 py-1 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as any)}
                    disabled={!canEdit}
                    className="rounded-lg border border-[#C99A45]/30 bg-[#1A130B] px-2.5 py-1 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <Button
                    variant="danger"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={handleEscalateToAdmin}
                  >
                    <ArrowUpRight className="w-3 h-3 mr-1" /> Escalate to Admin
                  </Button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] p-2">
                {selectedTicket.messages.map((msg) => {
                  const isAgent =
                    msg.senderRole?.includes("Admin") ||
                    msg.senderRole === "Support Agent";
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-4 text-xs space-y-1.5 ${
                        msg.isInternal
                          ? "border border-amber-500/30 bg-amber-950/20 text-amber-200"
                          : isAgent
                          ? "border border-[#C99A45]/30 bg-[#1A130B] text-[#F5EDE0] ml-6"
                          : "border border-[#C99A45]/15 bg-[#0B0907] text-[#A89A85] mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#E8C77A] flex items-center gap-1.5">
                          {msg.isInternal && <Lock className="h-3 w-3" />}
                          {msg.senderName} ({msg.senderRole || "Customer"})
                        </span>
                        <span className="font-mono text-[#A89A85]/70">
                          {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">
                        {msg.text || msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Canned Responses */}
              <div className="border-t border-[#C99A45]/15 pt-3">
                <span className="text-[10px] uppercase font-bold text-[#A89A85] block mb-1.5">
                  Concierge Canned Macros:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANNED_REPLIES.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => setReplyText(reply)}
                      className="rounded bg-[#1A130B] px-2 py-1 text-[10px] text-[#A89A85] hover:text-[#F5EDE0] truncate max-w-xs border border-[#C99A45]/20 hover:border-[#E8C77A]"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Write an internal note (visible ONLY to platform staff)..."
                      : "Type your official response to the customer..."
                  }
                  className="w-full rounded-xl border border-[#C99A45]/25 bg-[#1A130B] p-3 text-xs text-[#F5EDE0] placeholder-[#A89A85] focus:border-[#E8C77A] focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-[#A89A85] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded accent-[#C99A45]"
                    />
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-[#E8C77A]" /> Internal Staff Note
                    </span>
                  </label>

                  <Button type="submit" variant="gold" size="sm">
                    <Send className="h-3.5 w-3.5 mr-1" /> Send Reply
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#A89A85] italic">
              Select a ticket from the left queue to view messages.
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER LOOKUP MODAL (with Data Masking & Audited Reveal) */}
      <ResponsiveDialog
        open={lookupCustomerOpen}
        onOpenChange={setLookupCustomerOpen}
        title="Customer Directory & PII Safeguard"
        description="Search platform customer registry. Personal contact numbers and emails are masked by default. Revealing data logs an entry to the Security Audit Trail."
      >
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
            <Input
              placeholder="Search customer by name or email..."
              value={customerLookupQuery}
              onChange={(e) => setCustomerLookupQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {customers
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(customerLookupQuery.toLowerCase()) ||
                  c.email.toLowerCase().includes(customerLookupQuery.toLowerCase())
              )
              .map((cust) => {
                const isUnmasked = !!unmaskedCustomerIds[cust.id];
                const maskedPhone = isUnmasked
                  ? cust.phone
                  : cust.phone.replace(/(\+\d{2}\s\d{2})\d{3}\s\d{4}/, "$1*** ****");
                const maskedEmail = isUnmasked
                  ? cust.email
                  : cust.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

                return (
                  <div
                    key={cust.id}
                    className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#F5EDE0]">{cust.name}</div>
                      <div className="text-[11px] font-mono text-[#A89A85]">
                        Phone: {maskedPhone}
                      </div>
                      <div className="text-[11px] font-mono text-[#A89A85]">
                        Email: {maskedEmail}
                      </div>
                    </div>

                    {!isUnmasked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1"
                        onClick={() => handleUnmaskCustomer(cust)}
                      >
                        <Eye className="w-3 h-3 text-[#E8C77A]" /> Reveal Contact
                      </Button>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Revealed (Audited)
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </ResponsiveDialog>

      {/* ORDER LOOKUP MODAL */}
      <ResponsiveDialog
        open={lookupOrderOpen}
        onOpenChange={setLookupOrderOpen}
        title="Order Lookup & Courier Timeline"
        description="Inspect order fulfillment status, courier dispatch, and customer shipment tracking."
      >
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
            <Input
              placeholder="Search by order ID (e.g. ord-1) or customer name..."
              value={orderLookupQuery}
              onChange={(e) => setOrderLookupQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {orders
              .filter(
                (o) =>
                  o.id.toLowerCase().includes(orderLookupQuery.toLowerCase()) ||
                  (o as any).customerName
                    ?.toLowerCase()
                    .includes(orderLookupQuery.toLowerCase())
              )
              .map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-[#E8C77A]">
                        {ord.id.toUpperCase()}
                      </span>
                      <span className="text-[#A89A85] ml-2">
                        {ord.createdAt?.split("T")[0]}
                      </span>
                    </div>
                    <Badge variant="gold">{ord.status}</Badge>
                  </div>

                  <div className="text-[11px] text-[#A89A85] space-y-0.5">
                    <div>Total: ₹{(((ord.totalAmountPaise ?? (ord.total || 0) * 100)) / 100).toLocaleString("en-IN")}</div>
                    <div>Items: {ord.items?.length || 1} product(s)</div>
                    <div>Payment: {ord.paymentStatus || "Authorized & Escrowed"}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
