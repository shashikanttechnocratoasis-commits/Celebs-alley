import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { PrivacyRequest, LoginAttempt, AdminNote } from "@/types";
import initialPrivacyRequests from "@/data/privacyRequests.json";
import initialLoginAttempts from "@/data/loginAttempts.json";

export interface SecuritySlice {
  privacyRequests: PrivacyRequest[];
  createPrivacyRequest: (
    customerId: string,
    customerName: string,
    customerEmail: string,
    type: "export" | "deletion",
    notes?: string
  ) => PrivacyRequest;
  fulfillPrivacyExport: (requestId: string) => { downloadUrl: string; jsonContent: string };
  processPrivacyDeletion: (requestId: string) => void;

  loginAttempts: LoginAttempt[];
  recordLoginAttempt: (
    emailOrPhone: string,
    role: string,
    status: LoginAttempt["status"],
    ip?: string
  ) => void;

  adminNotes: AdminNote[];
  addAdminNote: (entityType: AdminNote["entityType"], entityId: string, text: string) => void;

  revealMaskedField: (resource: string, entityId: string, fieldName: string) => void;
}

export const createSecuritySlice: StateCreator<AppState, [], [], SecuritySlice> = (set, get) => ({
  privacyRequests: initialPrivacyRequests as unknown as PrivacyRequest[],

  createPrivacyRequest: (customerId, customerName, customerEmail, type, notes) => {
    const newReq: PrivacyRequest = {
      id: `priv-${Date.now()}`,
      customerId,
      customerName,
      customerEmail,
      type,
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: "pending",
      notes,
    };
    set((state) => ({
      privacyRequests: [newReq, ...state.privacyRequests],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: customerName,
          action: `create_privacy_${type}_request`,
          resource: "security",
          details: `Customer submitted DPDP ${type} request`,
        },
        ...state.auditLogs,
      ],
    }));
    return newReq;
  },

  fulfillPrivacyExport: (requestId) => {
    const state = get();
    const req = state.privacyRequests.find((r) => r.id === requestId);
    const exportPackage = {
      exportDate: new Date().toISOString(),
      regulation: "Digital Personal Data Protection Act, 2023 / GDPR",
      customer: req ? { id: req.customerId, name: req.customerName, email: req.customerEmail } : {},
      customerProfile: state.customerProfile,
      scans: state.scans.filter((s) => s.customerId === req?.customerId),
      orders: state.orders.filter((o) => o.customerId === req?.customerId),
    };
    const jsonContent = JSON.stringify(exportPackage, null, 2);
    const downloadUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`;
    set({
      privacyRequests: state.privacyRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "fulfilled" as const,
              fulfilledAt: new Date().toISOString(),
              exportDataJson: jsonContent,
            }
          : r
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "fulfill_privacy_export",
          resource: "security",
          details: `Generated encrypted personal data archive for ${req?.customerEmail}`,
        },
        ...state.auditLogs,
      ],
    });
    return { downloadUrl, jsonContent };
  },

  processPrivacyDeletion: (requestId) => {
    const state = get();
    const req = state.privacyRequests.find((r) => r.id === requestId);
    if (!req) return;
    const targetCustId = req.customerId;
    set({
      scans: state.scans.filter((s) => s.customerId !== targetCustId),
      privacyRequests: state.privacyRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: "fulfilled" as const, fulfilledAt: new Date().toISOString() }
          : r
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "process_privacy_deletion",
          resource: "security",
          details: `Permanently deleted biometric scans and anonymized records for ${req.customerEmail}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  loginAttempts: initialLoginAttempts as unknown as LoginAttempt[],
  recordLoginAttempt: (emailOrPhone, role, status, ip = "127.0.0.1") => {
    const newLog: LoginAttempt = {
      id: `log-${Date.now()}`,
      emailOrPhone,
      role,
      ipAddress: ip,
      device: "Web Browser (Chrome)",
      status,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ loginAttempts: [newLog, ...state.loginAttempts] }));
  },

  adminNotes: [],
  addAdminNote: (entityType, entityId, text) => {
    const state = get();
    const newNote: AdminNote = {
      id: `note-${Date.now()}`,
      entityType,
      entityId,
      authorId: state.currentUser?.id || "admin",
      authorName: state.currentUser?.name || "Admin",
      text,
      createdAt: new Date().toISOString(),
    };
    set({ adminNotes: [newNote, ...state.adminNotes] });
  },

  revealMaskedField: (resource, entityId, fieldName) => {
    const state = get();
    set({
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Admin",
          action: "reveal_pii_masked_field",
          resource,
          details: `Revealed sensitive field '${fieldName}' for entity ${entityId}`,
        },
        ...state.auditLogs,
      ],
    });
  },
});
