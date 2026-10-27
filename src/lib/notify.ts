import { useAppStore } from "@/store";
import type { Notification, Role } from "@/types";
import { toast } from "sonner";

export interface SendNotificationParams {
  type:
    | "system"
    | "order"
    | "appointment"
    | "plan"
    | "scan"
    | "ticket"
    | "payout"
    | "security"
    | "info"
    | "success"
    | "warning"
    | "error";
  recipientId?: string; // userId, sellerId, or consultantId
  recipientRole?: Role | "all" | string;
  title: string;
  body: string;
  link?: string;
  priority?: "low" | "medium" | "high";
  showToast?: boolean;
}

/**
 * Universal cross-panel notification dispatcher.
 * Automatically persists to store, triggers cross-tab sync, and displays toasts.
 */
export function sendNotification({
  type,
  recipientId,
  recipientRole = "all",
  title,
  body,
  link,
  priority = "medium",
  showToast = false,
}: SendNotificationParams): Notification {
  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    recipientId,
    recipientRole,
    roleTarget: recipientRole,
    title,
    body,
    message: body,
    link,
    actionUrl: link,
    priority,
    read: false,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  try {
    const store = useAppStore.getState();
    if (store.addNotification) {
      store.addNotification(newNotification);
    }

    // Broadcast across tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("celebs_alley_sync");
      channel.postMessage({
        type: "NOTIFICATION_RECEIVED",
        payload: newNotification,
      });
      channel.close();
    }
  } catch (err) {
    console.error("Failed to dispatch unified notification:", err);
  }

  if (showToast) {
    if (type === "success") {
      toast.success(title, { description: body });
    } else if (type === "error" || type === "warning") {
      toast.warning(title, { description: body });
    } else {
      toast.info(title, { description: body });
    }
  }

  return newNotification;
}

/**
 * Helper to filter notifications for the currently logged in user/role.
 */
export function getNotificationsForSession(
  notifications: Notification[],
  currentUserId?: string,
  currentRole?: string,
  consultantId?: string,
  sellerId?: string
): Notification[] {
  return (notifications || []).filter((n) => {
    // Global notifications
    if (!n.recipientRole || n.recipientRole === "all" || n.roleTarget === "all") return true;

    // Direct recipient match
    if (currentUserId && n.recipientId === currentUserId) return true;
    if (consultantId && n.recipientId === consultantId) return true;
    if (sellerId && n.recipientId === sellerId) return true;

    // Role match
    if (currentRole && (n.recipientRole === currentRole || n.roleTarget === currentRole)) return true;

    return false;
  });
}
