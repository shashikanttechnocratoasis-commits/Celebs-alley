import { StateCreator } from "zustand";
import initialChatThreads from "@/data/chatThreads.json";
import initialChatMessages from "@/data/chatMessages.json";
import type { ChatThread, ChatMessage } from "@/types";
import { sendNotification } from "@/lib/notify";

export interface ChatSlice {
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];

  sendMessage: (params: {
    threadId: string;
    text: string;
    senderId: string;
    senderRole: "consultant" | "customer";
    senderName: string;
    attachedScanId?: string;
    attachedProductId?: string;
  }) => ChatMessage;

  markThreadAsRead: (threadId: string, readerRole: "consultant" | "customer") => void;

  getOrCreateThread: (
    consultantId: string,
    consultantName: string,
    customerId: string,
    customerName: string
  ) => ChatThread;
}

export const createChatSlice: StateCreator<
  any,
  [],
  [],
  ChatSlice
> = (set, get) => ({
  chatThreads: initialChatThreads as ChatThread[],
  chatMessages: initialChatMessages as ChatMessage[],

  sendMessage: ({
    threadId,
    text,
    senderId,
    senderRole,
    senderName,
    attachedScanId,
    attachedProductId,
  }) => {
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      threadId,
      senderId,
      senderRole,
      senderName,
      text,
      timestamp: now,
      read: false,
      attachedScanId,
      attachedProductId,
    };

    set((state: any) => {
      const updatedMessages = [...state.chatMessages, newMsg];

      // Update thread lastMessage & unread count
      const updatedThreads = state.chatThreads.map((t: ChatThread) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessageText: text || (attachedScanId ? "Attached scan report" : "Attached product recommendation"),
            lastMessageTimestamp: now,
            unreadCountConsultant:
              senderRole === "customer"
                ? t.unreadCountConsultant + 1
                : t.unreadCountConsultant,
            unreadCountCustomer:
              senderRole === "consultant"
                ? t.unreadCountCustomer + 1
                : t.unreadCountCustomer,
          };
        }
        return t;
      });

      return {
        chatMessages: updatedMessages,
        chatThreads: updatedThreads,
      };
    });

    // Notify recipient
    const thread = get().chatThreads.find((t: ChatThread) => t.id === threadId);
    if (thread) {
      const recipientId = senderRole === "consultant" ? thread.customerId : thread.consultantId;
      const recipientRole = senderRole === "consultant" ? "Customer" : "Consultant";
      const deepLink =
        senderRole === "consultant"
          ? `/app/consultations?tab=messages`
          : `/consultant/messages?thread=${threadId}`;

      sendNotification({
        type: "info",
        recipientId,
        recipientRole,
        title: `Message from ${senderName}`,
        body: text.length > 80 ? `${text.substring(0, 80)}...` : text,
        link: deepLink,
        priority: "medium",
      });
    }

    return newMsg;
  },

  markThreadAsRead: (threadId, readerRole) => {
    set((state: any) => {
      const updatedThreads = state.chatThreads.map((t: ChatThread) => {
        if (t.id === threadId) {
          return {
            ...t,
            unreadCountConsultant:
              readerRole === "consultant" ? 0 : t.unreadCountConsultant,
            unreadCountCustomer:
              readerRole === "customer" ? 0 : t.unreadCountCustomer,
          };
        }
        return t;
      });

      const updatedMessages = state.chatMessages.map((m: ChatMessage) => {
        if (m.threadId === threadId && m.senderRole !== readerRole) {
          return { ...m, read: true };
        }
        return m;
      });

      return {
        chatThreads: updatedThreads,
        chatMessages: updatedMessages,
      };
    });
  },

  getOrCreateThread: (consultantId, consultantName, customerId, customerName) => {
    const existing = get().chatThreads.find(
      (t: ChatThread) =>
        t.consultantId === consultantId && t.customerId === customerId
    );
    if (existing) return existing;

    const newThread: ChatThread = {
      id: `thread-${consultantId}-${customerId}`,
      consultantId,
      consultantName,
      customerId,
      customerName,
      lastMessageText: "Consultation chat initialized.",
      lastMessageTimestamp: new Date().toISOString(),
      unreadCountConsultant: 0,
      unreadCountCustomer: 0,
    };

    set((state: any) => ({
      chatThreads: [newThread, ...state.chatThreads],
    }));

    return newThread;
  },
});
