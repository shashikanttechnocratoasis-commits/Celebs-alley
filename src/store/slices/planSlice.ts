import { StateCreator } from "zustand";
import initialClientPlans from "@/data/clientPlans.json";
import initialPlanTemplates from "@/data/planTemplates.json";
import type {
  Plan,
  PlanTemplate,
  PlanVersion,
  PlanProgress,
} from "@/types";
import { sendNotification } from "@/lib/notify";

export interface PlanSlice {
  clientPlans: Plan[];
  planTemplates: PlanTemplate[];
  planVersions: PlanVersion[];
  planProgress: Record<string, PlanProgress>;

  createPlan: (plan: Omit<Plan, "id" | "createdAt" | "updatedAt" | "version">) => Plan;
  updatePlan: (id: string, updates: Partial<Plan>) => Plan;
  publishPlan: (id: string, changeNote?: string) => Plan;
  savePlanAsTemplate: (planId: string, title: string, description: string) => PlanTemplate;
  togglePlanChecklistItem: (
    planId: string,
    customerId: string,
    checklistKey: string
  ) => void;
  getPlanAdherence: (planId: string, customerId: string) => number;
}

export const createPlanSlice: StateCreator<
  any,
  [],
  [],
  PlanSlice
> = (set, get) => ({
  clientPlans: initialClientPlans as Plan[],
  planTemplates: initialPlanTemplates as PlanTemplate[],
  planVersions: [],
  planProgress: {
    "cplan-1": {
      planId: "cplan-1",
      customerId: "cust-1",
      completedChecklist: {
        "step-cp1-1": true,
        "step-cp1-2": true,
      },
      adherencePercent: 75,
      lastCheckedDate: new Date().toISOString(),
    },
  },

  createPlan: (planData) => {
    const now = new Date().toISOString();
    const newPlan: Plan = {
      ...planData,
      id: `cplan-${Date.now()}`,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    set((state: any) => ({
      clientPlans: [newPlan, ...state.clientPlans],
    }));

    if (get().addAuditLog) {
      get().addAuditLog({
        action: "PLAN_CREATED",
        actor: planData.consultantName,
        target: newPlan.id,
        details: `Created new ${planData.durationWeeks}-week routine for ${planData.customerName}`,
        status: "success",
      });
    }

    return newPlan;
  },

  updatePlan: (id, updates) => {
    let updatedPlan: Plan | undefined;
    set((state: any) => {
      const updated = state.clientPlans.map((p: Plan) => {
        if (p.id === id) {
          updatedPlan = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedPlan;
        }
        return p;
      });
      return { clientPlans: updated };
    });

    return updatedPlan || (get().clientPlans.find((p: Plan) => p.id === id) as Plan);
  },

  publishPlan: (id, changeNote = "Published clinical regimen version update.") => {
    let publishedPlan: Plan | undefined;
    const now = new Date().toISOString();

    set((state: any) => {
      const updated = state.clientPlans.map((p: Plan) => {
        if (p.id === id) {
          const nextVersion = p.version + 1;
          publishedPlan = {
            ...p,
            status: "published",
            version: nextVersion,
            changeNotes: changeNote,
            updatedAt: now,
          };
          return publishedPlan;
        }
        return p;
      });

      // Create snapshot version
      const targetPlan = publishedPlan || state.clientPlans.find((p: Plan) => p.id === id);
      const newVersionRecord: PlanVersion = {
        id: `pver-${Date.now()}`,
        planId: id,
        version: targetPlan?.version || 1,
        changeNote,
        snapshot: targetPlan,
        publishedAt: now,
      };

      return {
        clientPlans: updated,
        planVersions: [newVersionRecord, ...state.planVersions],
      };
    });

    if (publishedPlan) {
      // Send notification to customer
      sendNotification({
        type: "plan",
        recipientId: publishedPlan.customerId,
        recipientRole: "Customer",
        title: `New Routine Published by ${publishedPlan.consultantName}`,
        body: `"${publishedPlan.title}" is now available in your Consultation and Regimen cockpit. Tap to review and start your daily checklist.`,
        link: "/app/consultations",
        priority: "high",
        showToast: true,
      });

      if (get().logActivityEvent) {
        get().logActivityEvent({
          entityType: "plan",
          entityId: publishedPlan.id,
          action: "PLAN_PUBLISHED",
          actorId: publishedPlan.consultantId,
          actorName: publishedPlan.consultantName,
          actorRole: "Consultant",
          metadata: {
            title: publishedPlan.title,
            version: publishedPlan.version,
            stepsCount: publishedPlan.amRoutine.length + publishedPlan.pmRoutine.length,
          },
        });
      }

      if (get().addAuditLog) {
        get().addAuditLog({
          action: "PLAN_PUBLISHED",
          actor: publishedPlan.consultantName,
          target: publishedPlan.id,
          details: `Published v${publishedPlan.version} for ${publishedPlan.customerName} (${publishedPlan.amRoutine.length} AM, ${publishedPlan.pmRoutine.length} PM steps)`,
          status: "success",
        });
      }
    }

    return publishedPlan || (get().clientPlans.find((p: Plan) => p.id === id) as Plan);
  },

  savePlanAsTemplate: (planId, title, description) => {
    const plan = get().clientPlans.find((p: Plan) => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    const newTemplate: PlanTemplate = {
      id: `template-${Date.now()}`,
      title,
      description,
      durationWeeks: plan.durationWeeks,
      goals: plan.goals,
      amRoutine: plan.amRoutine,
      pmRoutine: plan.pmRoutine,
      lifestyleTips: plan.lifestyleTips,
      dietNotes: plan.dietNotes,
    };

    set((state: any) => ({
      planTemplates: [newTemplate, ...state.planTemplates],
    }));

    return newTemplate;
  },

  togglePlanChecklistItem: (planId, customerId, checklistKey) => {
    set((state: any) => {
      const existing = state.planProgress[planId] || {
        planId,
        customerId,
        completedChecklist: {},
        adherencePercent: 0,
        lastCheckedDate: new Date().toISOString(),
      };

      const currentVal = Boolean(existing.completedChecklist[checklistKey]);
      const updatedChecklist = {
        ...existing.completedChecklist,
        [checklistKey]: !currentVal,
      };

      const plan = state.clientPlans.find((p: Plan) => p.id === planId);
      const totalSteps =
        (plan?.amRoutine?.length || 0) + (plan?.pmRoutine?.length || 0) || 1;
      const checkedCount = Object.values(updatedChecklist).filter(Boolean).length;
      const adherence = Math.min(100, Math.round((checkedCount / totalSteps) * 100));

      return {
        planProgress: {
          ...state.planProgress,
          [planId]: {
            ...existing,
            completedChecklist: updatedChecklist,
            adherencePercent: adherence,
            lastCheckedDate: new Date().toISOString(),
          },
        },
      };
    });
  },

  getPlanAdherence: (planId, customerId) => {
    const progress = get().planProgress[planId];
    return progress?.adherencePercent ?? 0;
  },
});
