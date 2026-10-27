"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Validate store initialization
    const state = useAppStore.getState();
    if (!state.parameters || state.parameters.length === 0) {
      state.resetDemoData();
    }
  }, []);

  return <>{children}</>;
}
