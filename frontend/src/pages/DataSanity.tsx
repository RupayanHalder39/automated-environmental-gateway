import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, Shield } from "lucide-react";
import { fetchAnomalies } from "../services/anomalyService";
import { EmptyState } from "../components/EmptyState";

interface AnomalyLog {
  id: string;
  sensorId: string;
  invalidValue: string;
  expectedRange: string;
  timestamp: string;
  reason: string;
  severity: "high" | "medium" | "low";
}


function getSeverityColor(severity: string) {
  switch (severity) {
    case "high":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
    case "medium":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    case "low":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" };
    default:
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" };
  }
}

export function DataSanity() {
  const [anomalyFilterEnabled, setAnomalyFilterEnabled] = useState(true);
  const [autoRejectEnabled, setAutoRejectEnabled] = useState(true);
  const [apiLogs, setApiLogs] = useState<AnomalyLog[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load anomaly logs for Data Sanity view.
  useEffect(() => {
    fetchAnomalies()
      .then((res) => setApiLogs(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const anomalyLogs = apiLogs;

  const totalRejected = anomalyLogs.length;
  const highSeverity = anomalyLogs.filter((log) => log.severity === "high").length;
  const mediumSeverity = anomalyLogs.filter((log) => log.severity === "medium").length;

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading anomaly logs...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load anomalies: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && anomalyLogs.length === 0 && (
        <EmptyState title="No anomalies detected" description="All incoming readings look healthy." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Data Sanity & Anomaly Detection</h1>
        <p className="text-zinc-400 mt-1">Monitor and filter invalid sensor readings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Rejected</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{totalRejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400/80 uppercase tracking-wide">High Severity</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{highSeverity}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500/50" />
          </div>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400/80 uppercase tracking-wide">Medium Severity</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{mediumSeverity}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Filter Status</p>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {anomalyFilterEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Anomaly Filter Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-zinc-100">Enable Anomaly Filtering</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Automatically detect and reject invalid sensor readings
                </p>
              </div>
            </div>
            <Switch checked={anomalyFilterEnabled} onCheckedChange={setAnomalyFilterEnabled} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-zinc-100">Auto-Reject Invalid Data</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Automatically reject readings that exceed defined thresholds
                </p>
              </div>
            </div>
            <Switch checked={autoRejectEnabled} onCheckedChange={setAutoRejectEnabled} />
          </div>
        </div>
      </Card>

      {/* Validation Rules */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Validation Rules</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-sm font-medium text-zinc-100 mb-2">Temperature Range</p>
              <p className="text-xs text-zinc-400">Valid: 0°C to 50°C</p>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-2">
                Active
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-sm font-medium text-zinc-100 mb-2">Humidity Range</p>
              <p className="text-xs text-zinc-400">Valid: 0% to 100%</p>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-2">
                Active
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-sm font-medium text-zinc-100 mb-2">Water Level Range</p>
              <p className="text-xs text-zinc-400">Valid: 0m to 10m</p>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-2">
                Active
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-sm font-medium text-zinc-100 mb-2">AQI Range</p>
              <p className="text-xs text-zinc-400">Valid: 0 to 500</p>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-2">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Rejected Readings Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Rejected Readings Log</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">ID</TableHead>
              <TableHead className="text-zinc-400">Sensor ID</TableHead>
              <TableHead className="text-zinc-400">Invalid Value</TableHead>
              <TableHead className="text-zinc-400">Expected Range</TableHead>
              <TableHead className="text-zinc-400">Timestamp</TableHead>
              <TableHead className="text-zinc-400">Reason Rejected</TableHead>
              <TableHead className="text-zinc-400">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalyLogs.map((log) => {
              const severityColor = getSeverityColor(log.severity);
              return (
                <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-100">{log.id}</TableCell>
                  <TableCell className="text-zinc-300">{log.sensorId}</TableCell>
                  <TableCell className="text-red-400 font-mono text-sm">{log.invalidValue}</TableCell>
                  <TableCell className="text-emerald-400 font-mono text-sm">{log.expectedRange}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">{log.timestamp}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">{log.reason}</TableCell>
                  <TableCell>
                    <Badge className={`${severityColor.bg} ${severityColor.text} border ${severityColor.border}`}>
                      {log.severity}
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
