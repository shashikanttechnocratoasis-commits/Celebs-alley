"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { ChatThread, ChatMessage, Product, ScanRecord } from "@/types";
import {
  MessageSquare,
  Send,
  Paperclip,
  Sparkles,
  Search,
  Check,
  CheckCheck,
  Clock,
  User,
  Shield,
  Layers,
  ChevronLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const QUICK_REPLIES = [
  "Please pause any exfoliating AHA/BHA acids for 48 hours.",
  "Let's review this in our upcoming video session.",
  "Your latest scan demonstrates remarkable progress on barrier hydration!",
  "Make sure to apply your broad-spectrum SPF 50 every morning.",
  "If slight stinging persists, switch to just lukewarm water for cleansing.",
];

export default function ClientSecureMessagingPage() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams?.get("clientId") || null;

  const {
    currentUser,
    chatThreads,
    chatMessages,
    customers,
    products,
    scanRecords,
    sendMessage,
    markThreadAsRead,
    getOrCreateThread,
  } = useAppStore();

  const activeConsultantId =
    currentUser?.consultantId ||
    (currentUser?.id === "user-consultant"
      ? "cons-1"
      : currentUser?.id === "user-consultant-2"
      ? "cons-2"
      : currentUser?.id === "user-consultant-3"
      ? "cons-3"
      : "cons-1");

  // Threads for this consultant
  const myThreads = useMemo(() => {
    return chatThreads.filter((t) => t.consultantId === activeConsultantId);
  }, [chatThreads, activeConsultantId]);

  // Selected thread
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    myThreads[0]?.id || null
  );

  // If clientId passed in query and thread doesn't exist yet, get or create it
  useEffect(() => {
    if (preselectedClientId) {
      const targetCustomer = (customers || []).find((c: any) => c.id === preselectedClientId);
      if (targetCustomer) {
        const thread = getOrCreateThread(
          activeConsultantId,
          currentUser?.name || "Dr. Meera Nambiar, MD",
          targetCustomer.id,
          targetCustomer.name
        );
        setSelectedThreadId(thread.id);
      }
    }
  }, [preselectedClientId, customers, activeConsultantId, currentUser, getOrCreateThread]);

  const activeThread = useMemo(() => {
    return myThreads.find((t) => t.id === selectedThreadId) || myThreads[0] || null;
  }, [myThreads, selectedThreadId]);

  // Active client object
  const activeClient = useMemo(() => {
    if (!activeThread) return null;
    return (customers || []).find((c: any) => c.id === activeThread.customerId) || null;
  }, [activeThread, customers]);

  // Messages in active thread
  const activeMessages = useMemo(() => {
    if (!activeThread) return [];
    return chatMessages.filter((m) => m.threadId === activeThread.id);
  }, [chatMessages, activeThread]);

  // Mark read when switching threads
  useEffect(() => {
    if (activeThread?.id) {
      markThreadAsRead(activeThread.id, "consultant");
    }
  }, [activeThread?.id, markThreadAsRead]);

  // Search threads
  const [searchQuery, setSearchQuery] = useState("");
  const filteredThreads = useMemo(() => {
    return myThreads.filter((t) =>
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myThreads, searchQuery]);

  // New message input
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Attach dialogs
  const [attachProductOpen, setAttachProductOpen] = useState(false);
  const [attachScanOpen, setAttachScanOpen] = useState(false);

  // Send message handler
  const handleSend = (
    text: string,
    attachedScanId?: string,
    attachedProductId?: string
  ) => {
    if (!activeThread || (!text.trim() && !attachedScanId && !attachedProductId)) return;

    sendMessage({
      threadId: activeThread.id,
      text: text.trim(),
      senderId: activeConsultantId,
      senderRole: "consultant",
      senderName: currentUser?.name || "Dr. Meera Nambiar, MD",
      attachedScanId,
      attachedProductId,
    });

    setTextInput("");
    showToast.success("Message sent");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Patient Telemedicine Chat"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Messages" },
        ]}
      />

      {/* Main 3-column / 2-column responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left Column: Thread List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
              <Input
                placeholder="Search patient threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
              {filteredThreads.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#A89A85]">
                  No message threads found.
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = activeThread?.id === thread.id;
                  const unread = thread.unreadByConsultant || 0;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#241A0F] border-[#E8C77A] shadow-md shadow-[#C99A45]/10"
                          : "bg-[#1A130B] border-[#C99A45]/15 hover:border-[#C99A45]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar name={thread.customerName} size="md" />
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#F5EDE0] truncate">
                              {thread.customerName}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A89A85] truncate">
                            {thread.lastMessagePreview || "No messages yet"}
                          </p>
                        </div>
                      </div>

                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#E8C77A] text-[#0B0907] text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Center Column: Active Chat Thread (5 cols on desktop, 8 on tablet) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 p-5 bg-[#140F0A] border-[#C99A45]/20 flex flex-col justify-between space-y-4 min-h-[580px]">
            {activeThread ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#C99A45]/15">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeThread.customerName} size="sm" />
                    <div>
                      <h3 className="font-semibold text-sm text-[#F5EDE0]">
                        {activeThread.customerName}
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ● Direct Patient Channel
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#A89A85]">
                    Encrypted Telemedicine Chat
                  </span>
                </div>

                {/* Response SLA Note */}
                <div className="p-2 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 text-[10px] text-[#A89A85] text-center">
                  Consultant usually replies within 24h on business days.
                </div>

                {/* Message Bubble History */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
                  {activeMessages.map((msg) => {
                    const isMe = msg.senderRole === "consultant";
                    const attachedProduct = msg.attachedProductId
                      ? products.find((p) => p.id === msg.attachedProductId)
                      : null;
                    const attachedScan = msg.attachedScanId
                      ? (scanRecords || []).find((s: any) => s.id === msg.attachedScanId)
                      : null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 ${
                            isMe
                              ? "bg-[#C99A45] text-[#0B0907] rounded-br-xs font-medium"
                              : "bg-[#1A130B] text-[#F5EDE0] border border-[#C99A45]/20 rounded-bl-xs"
                          }`}
                        >
                          {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                          {/* Attached Product Card */}
                          {attachedProduct && (
                            <div className="p-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-left text-[11px] space-y-1">
                              <span className="text-[9px] uppercase font-bold text-[#E8C77A]">
                                Prescribed Product Reference
                              </span>
                              <div className="font-semibold text-[#F5EDE0]">
                                {attachedProduct.name}
                              </div>
                              <div className="text-[#A89A85]">
                                {attachedProduct.routineStep} • MRP ₹{attachedProduct.mrp}
                              </div>
                            </div>
                          )}

                          {/* Attached Scan Card */}
                          {attachedScan && (
                            <div className="p-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-left text-[11px] space-y-1">
                              <span className="text-[9px] uppercase font-bold text-[#E8C77A]">
                                Diagnostic Scan Reference
                              </span>
                              <div className="font-semibold text-[#F5EDE0]">
                                Overall Score: {attachedScan.overallScore}/100
                              </div>
                              <div className="text-[#A89A85]">
                                Date: {attachedScan.createdAt?.split("T")[0] || (attachedScan as any).date || "Recent Scan"}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & read receipts */}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#A89A85] px-1">
                          <span>
                            {msg.timestamp ? format(parseISO(msg.timestamp), "h:mm a") : "Now"}
                          </span>
                          {isMe && (
                            <span title={msg.read ? "Read by client" : "Delivered"}>
                              {msg.read ? (
                                <CheckCheck className="w-3 h-3 text-[#38BDF8]" />
                              ) : (
                                <Check className="w-3 h-3 text-[#A89A85]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(reply)}
                      className="px-2.5 py-1 rounded-full bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] text-[10px] text-[#E8C77A] shrink-0 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#C99A45]/15">
                  <button
                    onClick={() => setAttachProductOpen(true)}
                    className="p-2 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 text-[#E8C77A] hover:bg-[#C99A45]/10"
                    title="Attach Product Reference"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAttachScanOpen(true)}
                    className="p-2 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 text-[#E8C77A] hover:bg-[#C99A45]/10"
                    title="Attach Scan Reference"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <Input
                    placeholder="Type clinical advice or routine adjustment..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(textInput);
                      }
                    }}
                    className="flex-1 text-xs"
                  />

                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleSend(textInput)}
                    disabled={!textInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-[#A89A85]">
                Select a patient thread to view messaging history.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Client Context Panel on Desktop (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {activeClient ? (
            <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
              <div className="text-center space-y-2 pb-3 border-b border-[#C99A45]/15">
                <Avatar
                  src={activeClient.avatar}
                  name={activeClient.name}
                  size="lg"
                  className="mx-auto"
                />
                <h4 className="font-serif text-sm font-semibold text-[#F5EDE0]">
                  {activeClient.name}
                </h4>
                <Badge variant="outline" size="sm">
                  {activeClient.skinType}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-[#A89A85]">
                  Clinical Context
                </span>
                <div className="p-2.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 space-y-1">
                  <div className="text-[#F5EDE0]">
                    Allergies:{" "}
                    <span className="text-red-400 font-bold">
                      {activeClient.allergies?.join(", ") || "None"}
                    </span>
                  </div>
                  <div className="text-[#A89A85]">
                    Concerns: {activeClient.concerns?.join(", ") || "None"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link href={`/consultant/clients?clientId=${activeClient.id}`}>
                    Open Clinical File
                  </Link>
                </Button>
                <Button asChild variant="gold" size="sm" className="w-full text-xs">
                  <Link href={`/consultant/plans?clientId=${activeClient.id}`}>
                    Prescribe Plan
                  </Link>
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Attach Product Dialog */}
      <ResponsiveDialog
        open={attachProductOpen}
        onOpenChange={setAttachProductOpen}
        title="Attach Product to Chat"
        description="Send a reference card for a recommended product directly into the patient thread."
      >
        <div className="space-y-2 pt-2 max-h-72 overflow-y-auto">
          {products.slice(0, 8).map((p) => (
            <div
              key={p.id}
              onClick={() => {
                handleSend(`Recommended formulation: ${p.name}`, undefined, p.id);
                setAttachProductOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] cursor-pointer text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-[#F5EDE0]">{p.name}</div>
                <div className="text-[11px] text-[#A89A85]">
                  {p.routineStep} • ₹{p.mrp}
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-7">
                Attach
              </Button>
            </div>
          ))}
        </div>
      </ResponsiveDialog>

      {/* Attach Scan Dialog */}
      <ResponsiveDialog
        open={attachScanOpen}
        onOpenChange={setAttachScanOpen}
        title="Attach Diagnostic Scan Reference"
        description="Share a cellular score milestone into the chat for patient discussion."
      >
        <div className="space-y-2 pt-2 max-h-72 overflow-y-auto">
          {(scanRecords || []).slice(0, 4).map((s: any) => (
            <div
              key={s.id}
              onClick={() => {
                handleSend(
                  `Referencing your diagnostic scan with overall score ${s.overallScore}/100:`,
                  s.id
                );
                setAttachScanOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] cursor-pointer text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-[#F5EDE0]">
                  Scan Score: {s.overallScore}/100
                </div>
                <div className="text-[11px] text-[#A89A85]">
                  Date: {s.date || "Recent Analysis"}
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-7">
                Attach
              </Button>
            </div>
          ))}
        </div>
      </ResponsiveDialog>
    </div>
  );
}
