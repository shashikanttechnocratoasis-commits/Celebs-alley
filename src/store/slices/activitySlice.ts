import { StateCreator } from "zustand";
import initialActivityEvents from "@/data/activityEvents.json";
import type { ActivityEvent } from "@/types";

export interface ActivitySlice {
  activityEvents: ActivityEvent[];
  logActivityEvent: (
    event: Omit<ActivityEvent, "id" | "timestamp"> & { timestamp?: string }
  ) => ActivityEvent;
  getEntityActivity: (
    entityType: ActivityEvent["entityType"],
    entityId: string
  ) => ActivityEvent[];
}

export const createActivitySlice: StateCreator<
  any,
  [],
  [],
  ActivitySlice
> = (set, get) => ({
  activityEvents: initialActivityEvents as ActivityEvent[],

  logActivityEvent: (eventData) => {
    const newEvent: ActivityEvent = {
      ...eventData,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: eventData.timestamp || new Date().toISOString(),
    };

    set((state: any) => ({
      activityEvents: [newEvent, ...state.activityEvents],
    }));

    return newEvent;
  },

  getEntityActivity: (entityType, entityId) => {
    return (get().activityEvents || []).filter(
      (ev: ActivityEvent) =>
        ev.entityType === entityType && ev.entityId === entityId
    );
  },
});
