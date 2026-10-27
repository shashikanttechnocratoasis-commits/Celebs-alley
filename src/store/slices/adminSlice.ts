import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { User, AdminPermissionMatrix, AdminRole, AdminResource, AdminAction } from "@/types";
import { DEFAULT_ADMIN_PERMISSION_MATRIX } from "@/lib/rbac";

export interface AdminSlice {
  adminPermissions: AdminPermissionMatrix;
  updateAdminPermission: (role: AdminRole, resource: AdminResource, actions: AdminAction[]) => void;
  resetAdminPermissions: () => void;

  toggleUserStatus: (userId: string, newStatus: "active" | "suspended", reason?: string) => void;
  addAdminUser: (userData: Omit<User, "id">) => User;
  resetUserPassword: (userId: string) => void;
}

export const createAdminSlice: StateCreator<AppState, [], [], AdminSlice> = (set, get) => ({
  adminPermissions: DEFAULT_ADMIN_PERMISSION_MATRIX,

  updateAdminPermission: (role, resource, actions) => {
    set((state) => ({
      adminPermissions: {
        ...state.adminPermissions,
        [role]: {
          ...state.adminPermissions[role],
          [resource]: actions,
        },
      },
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "update_admin_permission_matrix",
          resource: "roles",
          details: `Updated role ${role} permissions for ${resource}: [${actions.join(", ")}]`,
        },
        ...state.auditLogs,
      ],
    }));
  },

  resetAdminPermissions: () => {
    set({ adminPermissions: DEFAULT_ADMIN_PERMISSION_MATRIX });
  },

  toggleUserStatus: (userId, newStatus, reason) => {
    const state = get();
    const targetUser = (state.users || []).find((u) => u.id === userId);
    const updatedUsers = (state.users || []).map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    const updatedConsultants = (state.consultants || []).map((c) =>
      c.id === targetUser?.consultantId || (c as any).email === targetUser?.email
        ? { ...c, status: newStatus }
        : c
    );
    set({
      users: updatedUsers,
      consultants: updatedConsultants,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: newStatus === "suspended" ? "suspend_user" : "reactivate_user",
          resource: "users",
          details: `Changed user ${userId} (${targetUser?.name}) account status to ${newStatus}. Reason: ${reason || "Administrative governance"}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  addAdminUser: (userData) => {
    const state = get();
    const newUser: User = {
      ...userData,
      id: `user-admin-${Date.now()}`,
      status: "active",
      signupDate: new Date().toISOString().split("T")[0],
      avatar: userData.avatar || "",
    };
    set({
      users: [newUser, ...(state.users || [])],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "create_user",
          resource: "users",
          details: `Created administrative staff user ${newUser.name} with role ${newUser.role}`,
        },
        ...state.auditLogs,
      ],
    });
    return newUser;
  },

  resetUserPassword: (userId) => {
    const state = get();
    set({
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "reset_password",
          resource: "users",
          details: `Triggered simulated secure password reset credential dispatch for user ${userId}`,
        },
        ...state.auditLogs,
      ],
    });
  },
});
