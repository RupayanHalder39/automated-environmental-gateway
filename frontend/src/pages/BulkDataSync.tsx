import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSyncBatches } from "../services/syncService";
import { EmptyState } from "../components/EmptyState";


export function BulkDataSync() {
  const [apiBatches, setApiBatches] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load batch logs for Bulk Sync view.
  useEffect(() => {
    fetchSyncBatches()
      .then((res) => setApiBatches(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const batchLogs = apiBatches.map((log) => {
    const startedAt = log.timestamp || log.started_at || log.startedAt;
    const finishedAt = log.finished_at || log.finishedAt;
    const durationMs =
      startedAt && finishedAt
        ? Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime())
        : null;

    return {
      id: log.id,
      deviceId: log.deviceId || log.device_id || log.source || "unknown",
      packets: log.packets ?? log.total_records ?? 0,
      received: log.received ?? log.inserted_records ?? 0,
      rejected: log.rejected ?? log.failed_records ?? 0,
      duration: log.duration || (durationMs ? `${(durationMs / 1000).toFixed(1)}s` : "—"),
      timestamp: log.timestamp || log.started_at || "",
      status: String(log.status || "completed").toLowerCase(),
    };
  });

  const syncData = batchLogs.map((log) => ({
    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "--",
    received: log.received,
    rejected: log.rejected,
  }));

  const totalPackets = batchLogs.reduce((sum, log) => sum + log.packets, 0);
  const totalReceived = batchLogs.reduce((sum, log) => sum + log.received, 0);
  const totalRejected = batchLogs.reduce((sum, log) => sum + log.rejected, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading sync batches...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load sync batches: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && batchLogs.length === 0 && (
        <EmptyState title="No sync batches yet" description="Bulk sync activity will appear here." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Bulk Data Sync Monitoring</h1>
        <p className="text-zinc-400 mt-1">Track batch data uploads from offline gateways</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Packets</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{totalPackets.toLocaleString()}</p>
            </div>
            <Upload className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Received</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{totalReceived.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400/80 uppercase tracking-wide">Rejected</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{totalRejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500/50" />
          </div>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400/80 uppercase tracking-wide">Avg Duration</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">2.5s</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500/50" />
          </div>
        </Card>
      </div>

      {/* Packet Burst Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Packet Burst Activity</h2>
          <p className="text-sm text-zinc-400 mt-1">Real-time data sync from reconnecting devices</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={syncData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Bar dataKey="received" fill="#10b981" name="Received" />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Batch Upload Logs */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Batch Upload Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Device ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Total Packets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Rejected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {batchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{log.deviceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{log.packets}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">{log.received}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{log.rejected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{log.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
