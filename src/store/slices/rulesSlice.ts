import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { RecommendationRule, ModelVersion } from "@/types";
import initialRules from "@/data/rules.json";
import initialModelVersions from "@/data/modelVersions.json";

export interface RulesSlice {
  rules: RecommendationRule[];
  recommendationRules: RecommendationRule[];
  addRecommendationRule: (rule: Omit<RecommendationRule, "id">) => RecommendationRule;
  updateRecommendationRule: (id: string, patch: Partial<RecommendationRule>) => void;
  deleteRecommendationRule: (id: string) => { success: boolean; message: string };
  toggleRecommendationRule: (id: string) => void;

  modelVersions: ModelVersion[];
  activeModelVersionId: string;
  setActiveModelVersion: (modelId: string) => void;
}

export const createRulesSlice: StateCreator<AppState, [], [], RulesSlice> = (set, get) => ({
  rules: initialRules as unknown as RecommendationRule[],
  recommendationRules: initialRules as unknown as RecommendationRule[],

  addRecommendationRule: (rule) => {
    const newRule: RecommendationRule = {
      id: `rule-${Date.now()}`,
      ...rule,
      status: "active",
    };
    const updatedRules = [...get().rules, newRule];
    set((state) => ({
      rules: updatedRules,
      recommendationRules: updatedRules,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "AI Manager",
          action: "create_recommendation_rule",
          resource: "rules",
          details: `Created rule ${newRule.name}`,
        },
        ...state.auditLogs,
      ],
    }));
    return newRule;
  },

  updateRecommendationRule: (id, patch) => {
    const updatedRules = get().rules.map((r) => {
      if (r.id !== id) return r;
      if (r.isLocked && patch.status === "disabled") return r;
      return { ...r, ...patch };
    });
    set({ rules: updatedRules, recommendationRules: updatedRules });
  },

  deleteRecommendationRule: (id) => {
    const state = get();
    const rule = state.rules.find((r) => r.id === id);
    if (rule?.isLocked) {
      return {
        success: false,
        message: "Clinical safety rules are permanently locked and cannot be deleted.",
      };
    }
    const filtered = state.rules.filter((r) => r.id !== id);
    set({ rules: filtered, recommendationRules: filtered });
    return { success: true, message: "Rule deleted successfully." };
  },

  toggleRecommendationRule: (id) => {
    const toggled = get().rules.map((r) => {
      if (r.id !== id) return r;
      if (r.isLocked) return r;
      return { ...r, status: r.status === "active" ? ("disabled" as const) : ("active" as const) };
    });
    set({ rules: toggled, recommendationRules: toggled });
  },

  modelVersions: initialModelVersions as unknown as ModelVersion[],
  activeModelVersionId: "model-sim-1.0",
  setActiveModelVersion: (modelId) => {
    set((state) => ({
      activeModelVersionId: modelId,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "AI Manager",
          action: "switch_active_model",
          resource: "versions",
          details: `Switched active diagnostic model to ${modelId}`,
        },
        ...state.auditLogs,
      ],
    }));
  },
});
