"use client";

import { useEffect, useState } from "react";

/**
 * Hook to avoid hydration mismatch with persisted Zustand store
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
