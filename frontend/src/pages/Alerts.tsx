import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAlerts } from "../services/alertService";
import { EmptyState } from "../components/EmptyState";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  location: string;
  timestamp: string;
  status: "active" | "resolved" | "dismissed";
  value: string;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "critical",
    message: "Dangerous AQI Level Detected",
    location: "Park Street",
    timestamp: "2026-03-13 14:32:15",
    status: "active",
    value: "AQI: 165",
  },
  {
    id: "ALT-002",
    type: "warning",
    message: "High Water Level Warning",
    location: "Sector V",
    timestamp: "2026-03-13 13:45:22",
    status: "active",
    value: "Water: 3.1m",
  },
  {
    id: "ALT-003",
    type: "critical",
    message: "Temperature Exceeds Threshold",
    location: "New Town",
    timestamp: "2026-03-13 12:20:08",
    status: "resolved",
    value: "Temp: 36°C",
  },
  {
    id: "ALT-004",
    type: "info",
    message: "Sensor Connection Restored",
    location: "Salt Lake",
    timestamp: "2026-03-13 11:15:45",
    status: "resolved",
    value: "SEN-001",
  },
  {
    id: "ALT-005",
    type: "warning",
    message: "Moderate AQI Level",
    location: "Rajarhat",
    timestamp: "2026-03-13 10:30:12",
    status: "dismissed",
    value: "AQI: 95",
  },
];

function getAlertColor(type: string) {
  switch (type) {
    case "critical":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
    case "warning":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    case "info":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" };
    default:
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
    case "resolved":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
    case "dismissed":
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" };
    default:
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" };
  }
}

export function Alerts() {
  const [apiAlerts, setApiAlerts] = useState<Alert[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load alerts list for the Alerts UI.
  useEffect(() => {
    fetchAlerts()
      .then((res) => setApiAlerts(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const alerts = apiAlerts;
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const resolvedToday = alerts.filter((a) => a.status === "resolved");

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading alerts...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load alerts: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && alerts.length === 0 && (
        <EmptyState title="No alerts yet" description="System is stable or alerts are filtered out." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Alert Management</h1>
        <p className="text-zinc-400 mt-1">Monitor and manage system alerts and notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-red-500/5 border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400/80 uppercase tracking-wide">Active Alerts</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{activeAlerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500/50 animate-pulse" />
          </div>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400/80 uppercase tracking-wide">Critical</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{criticalAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Resolved Today</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{resolvedToday.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Alerts</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Active Alerts</h2>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Mark All as Read
          </Button>
        </div>
        <div className="divide-y divide-zinc-800">
          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-zinc-400">No active alerts</p>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const alertColor = getAlertColor(alert.type);
              return (
                <div key={alert.id} className="p-6 hover:bg-zinc-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg ${alertColor.bg} flex items-center justify-center`}>
                        <AlertTriangle className={`w-5 h-5 ${alertColor.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-zinc-100">{alert.message}</h3>
                          <Badge className={`${alertColor.bg} ${alertColor.text} border ${alertColor.border}`}>
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-400">
                          <span>Location: {alert.location}</span>
                          <span>Value: {alert.value}</span>
                          <span>Time: {alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* All Alerts Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Alert History</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Alert ID</TableHead>
              <TableHead className="text-zinc-400">Type</TableHead>
              <TableHead className="text-zinc-400">Message</TableHead>
              <TableHead className="text-zinc-400">Location</TableHead>
              <TableHead className="text-zinc-400">Value</TableHead>
              <TableHead className="text-zinc-400">Timestamp</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const alertColor = getAlertColor(alert.type);
              const statusColor = getStatusColor(alert.status);
              return (
                <TableRow key={alert.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-100">{alert.id}</TableCell>
                  <TableCell>
                    <Badge className={`${alertColor.bg} ${alertColor.text} border ${alertColor.border}`}>
                      {alert.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{alert.message}</TableCell>
                  <TableCell className="text-zinc-300">{alert.location}</TableCell>
                  <TableCell className="text-zinc-300 font-mono text-sm">{alert.value}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">{alert.timestamp}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                      {alert.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
