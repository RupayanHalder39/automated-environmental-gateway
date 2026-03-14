import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppStateProvider } from "./utils/AppState";
import { DashboardLayout } from "./components/DashboardLayout";

// Pages aligned to Figma sidebar modules
import { Dashboard } from "./pages/Dashboard";
import { DeviceHealth } from "./pages/DeviceHealth";
import { HistoricalData } from "./pages/HistoricalData";
import { RulesEngine } from "./pages/RulesEngine";
import { Alerts } from "./pages/Alerts";
import { DataSanity } from "./pages/DataSanity";
import { BulkDataSync } from "./pages/BulkDataSync";
import { PublicAPI } from "./pages/PublicAPI";
import { Reports } from "./pages/Reports";
import { SystemStatus } from "./pages/SystemStatus";
import { Settings } from "./pages/Settings";

// App routes wire UI tabs to backend-connected pages.
export function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/sensors" element={<Dashboard />} />
            <Route path="/device-health" element={<DeviceHealth />} />
            <Route path="/historical-data" element={<HistoricalData />} />
            <Route path="/rules-engine" element={<RulesEngine />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/data-sanity" element={<DataSanity />} />
            <Route path="/bulk-sync" element={<BulkDataSync />} />
            <Route path="/public-api" element={<PublicAPI />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
