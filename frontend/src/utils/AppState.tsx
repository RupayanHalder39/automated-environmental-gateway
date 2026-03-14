import { createContext, useContext, useMemo, useState } from "react";

// Global UI state for filters and selections across pages.
// Keeps shared filters (date range, metric, location) consistent when navigating.

export type AppFilters = {
  dateRange: "24hours" | "7days" | "30days" | "custom";
  metric: "aqi" | "temperature" | "humidity" | "waterLevel";
  location: string[]; // e.g., ["Salt Lake", "New Town"]
};

export type AppSelection = {
  selectedSensorId?: string;
  selectedDeviceId?: string;
};

type AppState = {
  filters: AppFilters;
  setFilters: (next: Partial<AppFilters>) => void;
  selection: AppSelection;
  setSelection: (next: Partial<AppSelection>) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<AppFilters>({
    dateRange: "7days",
    metric: "aqi",
    location: [],
  });
  const [selection, setSelectionState] = useState<AppSelection>({});

  const value = useMemo(
    () => ({
      filters,
      setFilters: (next: Partial<AppFilters>) => setFiltersState((prev) => ({ ...prev, ...next })),
      selection,
      setSelection: (next: Partial<AppSelection>) => setSelectionState((prev) => ({ ...prev, ...next })),
    }),
    [filters, selection]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
