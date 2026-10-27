import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { Ticket, TicketMessage, Role } from "@/types";
import initialTickets from "@/data/tickets.json";

export interface SupportSlice {
  tickets: Ticket[];
  createTicket: (
    ticket: Omit<Ticket, "id" | "ticketNumber" | "createdAt" | "updatedAt" | "messages">,
    initialMessage?: string
  ) => Ticket;
  addTicketReply: (ticketId: string, message: string, isInternal?: boolean) => void;
  updateTicketStatus: (
    ticketId: string,
    status: Ticket["status"],
    priority?: Ticket["priority"],
    assignedTo?: string
  ) => void;
}

export const createSupportSlice: StateCreator<AppState, [], [], SupportSlice> = (set, get) => ({
  tickets: initialTickets as unknown as Ticket[],

  createTicket: (ticket, initialMessage) => {
    const ticketNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `tkt-${Date.now()}`;
    const newTicket: Ticket = {
      id: newId,
      ticketNumber: ticketNum,
      ...ticket,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaMinutes: ticket.priority === "urgent" ? 60 : ticket.priority === "high" ? 120 : 240,
      messages: initialMessage
        ? [
            {
              id: `msg-${Date.now()}`,
              ticketId: newId,
              senderId: ticket.customerId || ticket.sellerId || "user-customer",
              senderName: ticket.requesterName,
              senderRole: ticket.requesterRole,
              message: initialMessage,
              timestamp: new Date().toISOString(),
              isInternal: false,
            },
          ]
        : [],
    };
    set((state) => ({
      tickets: [newTicket, ...state.tickets],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: "Support Ticket Registered",
          message: `Ticket #${ticketNum} received: ${ticket.subject}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "system",
        },
        ...state.notifications,
      ],
    }));
    return newTicket;
  },

  addTicketReply: (ticketId, message, isInternal = false) => {
    const state = get();
    const currentSender = state.currentUser || {
      id: "user-support",
      name: "Concierge Agent",
      role: "Support Agent",
    };
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      senderId: currentSender.id,
      senderName: currentSender.name,
      senderRole: currentSender.role as Role,
      message,
      timestamp: new Date().toISOString(),
      isInternal,
    };
    set({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              messages: [...t.messages, newMsg],
            }
          : t
      ),
    });
  },

  updateTicketStatus: (ticketId, status, priority, assignedTo) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              priority: priority || t.priority,
              assignedTo: assignedTo !== undefined ? assignedTo : t.assignedTo,
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  },
});
