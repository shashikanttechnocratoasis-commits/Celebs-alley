import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { SkinParameter, ParameterVersion, AuditLogEntry, Notification } from "@/types";
import initialParameterVersions from "@/data/parameterVersions.json";

export interface ParametersSlice {
  parameterDraft: SkinParameter[] | null;
  parameterVersions: ParameterVersion[];
  initParameterDraft: () => void;
  updateDraftParameter: (id: string, patch: Partial<SkinParameter>) => void;
  addDraftParameter: (param: Omit<SkinParameter, "id"> & { id?: string }) => SkinParameter;
  removeDraftParameter: (id: string) => { success: boolean; message: string };
  reorderDraftParameters: (newOrder: string[]) => void;
  discardParameterDraft: () => void;
  publishParameterDraft: (changeSummary: string) => { success: boolean; version: ParameterVersion };
  rollbackParameterVersion: (versionId: string) => { success: boolean; version: ParameterVersion };
}

export const createParametersSlice: StateCreator<AppState, [], [], ParametersSlice> = (set, get) => ({
  parameterDraft: null,
  parameterVersions: initialParameterVersions as unknown as ParameterVersion[],

  initParameterDraft: () => {
    set({ parameterDraft: JSON.parse(JSON.stringify(get().parameters)) });
  },

  updateDraftParameter: (id, patch) => {
    const draft = get().parameterDraft;
    if (!draft) return;
    set({
      parameterDraft: draft.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  },

  addDraftParameter: (param) => {
    const draft = get().parameterDraft || JSON.parse(JSON.stringify(get().parameters));
    const newParam: SkinParameter = {
      id: param.id || `param-${Date.now()}`,
      name: param.name,
      slug: param.slug || param.name.toLowerCase().replace(/\s+/g, "_"),
      description: param.description,
      unit: param.unit || "%",
      minScore: param.minScore ?? 0,
      maxScore: param.maxScore ?? 100,
      weight: param.weight ?? 0.1,
      status: param.status || "active",
      aiKey: param.aiKey || `ai_${param.slug || "custom"}`,
      displayOrder: param.displayOrder ?? draft.length + 1,
      icon: param.icon || "Sparkles",
      interpretation: param.interpretation || {
        low: "Requires clinical formulation focus.",
        medium: "Moderate biological balance.",
        high: "Optimal cellular radiance.",
      },
    };
    set({ parameterDraft: [...draft, newParam] });
    return newParam;
  },

  removeDraftParameter: (id) => {
    const draft = get().parameterDraft;
    if (!draft) return { success: false, message: "No active draft" };
    const param = draft.find((p) => p.id === id);
    const products = get().products;
    const isMapped = products.some((prod) => {
      const targets = prod.targetParameters || {};
      return targets[id] !== undefined || (param && targets[param.slug] !== undefined);
    });
    if (isMapped) {
      set({
        parameterDraft: draft.map((p) => (p.id === id ? { ...p, status: "inactive" } : p)),
      });
      return {
        success: true,
        message: "Parameter is mapped to products; archived and set to inactive instead of deletion.",
      };
    }
    set({ parameterDraft: draft.filter((p) => p.id !== id) });
    return { success: true, message: "Parameter removed from draft." };
  },

  reorderDraftParameters: (newOrder) => {
    const draft = get().parameterDraft;
    if (!draft) return;
    const reordered = newOrder
      .map((id, idx) => {
        const p = draft.find((item) => item.id === id);
        return p ? { ...p, displayOrder: idx + 1 } : null;
      })
      .filter(Boolean) as SkinParameter[];
    set({ parameterDraft: reordered });
  },

  discardParameterDraft: () => {
    set({ parameterDraft: null });
  },

  publishParameterDraft: (changeSummary) => {
    const state = get();
    const draft = state.parameterDraft;
    if (!draft) {
      return {
        success: false,
        version: state.parameterVersions[0],
      };
    }
    const newVersionNumber = `v1.${state.parameterVersions.length}`;
    const newVersion: ParameterVersion = {
      id: `ver-${Date.now()}`,
      version: newVersionNumber,
      authorId: state.currentUser?.id || "user-super-admin",
      authorName: state.currentUser?.name || "Super Admin",
      createdAt: new Date().toISOString(),
      changeSummary: changeSummary || "Production AI parameter update.",
      parametersSnapshot: JSON.parse(JSON.stringify(draft)),
      status: "live",
      scanCount: 0,
    };

    const updatedVersions = state.parameterVersions.map((v) => ({
      ...v,
      status: "archived" as const,
    }));

    const actor = state.currentUser?.name || "Super Admin";
    const newAuditLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: "publish_parameter_version",
      resource: "parameters",
      details: `Published AI Parameter Version ${newVersionNumber}: ${changeSummary}`,
    };

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title: "AI Engine Parameters Updated",
      message: `Version ${newVersionNumber} is now live across diagnostics and customer boutique.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "system",
    };

    set({
      parameters: draft,
      parameterDraft: null,
      parameterVersions: [newVersion, ...updatedVersions],
      auditLogs: [newAuditLog, ...state.auditLogs],
      notifications: [newNotification, ...state.notifications],
    });

    return { success: true, version: newVersion };
  },

  rollbackParameterVersion: (versionId) => {
    const state = get();
    const targetVersion = state.parameterVersions.find((v) => v.id === versionId);
    if (!targetVersion) return { success: false, version: state.parameterVersions[0] };

    const newVersionNumber = `v1.${state.parameterVersions.length}`;
    const rolledBackVersion: ParameterVersion = {
      id: `ver-${Date.now()}`,
      version: newVersionNumber,
      authorId: state.currentUser?.id || "user-super-admin",
      authorName: state.currentUser?.name || "Super Admin",
      createdAt: new Date().toISOString(),
      changeSummary: `Rollback to version ${targetVersion.version} (${targetVersion.changeSummary})`,
      parametersSnapshot: JSON.parse(JSON.stringify(targetVersion.parametersSnapshot)),
      status: "live",
      scanCount: 0,
    };

    const updatedVersions = state.parameterVersions.map((v) => ({
      ...v,
      status: "archived" as const,
    }));

    set({
      parameters: targetVersion.parametersSnapshot,
      parameterDraft: null,
      parameterVersions: [rolledBackVersion, ...updatedVersions],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "rollback_parameter_version",
          resource: "parameters",
          details: `Rolled back AI Parameter Engine to snapshot ${targetVersion.version}`,
        },
        ...state.auditLogs,
      ],
    });

    return { success: true, version: rolledBackVersion };
  },
});
