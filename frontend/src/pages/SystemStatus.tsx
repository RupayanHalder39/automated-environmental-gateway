import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Server, Database, Zap, Activity, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSystemStatus } from "../services/systemService";
import { EmptyState } from "../components/EmptyState";

const mockServices = [
  {
    name: "Sensor Gateway Service",
    status: "running",
    uptime: "15 days 8 hours",
    cpu: "12%",
    memory: "340 MB",
    icon: Activity,
  },
  {
    name: "Data Processing Service",
    status: "running",
    uptime: "15 days 8 hours",
    cpu: "28%",
    memory: "580 MB",
    icon: Database,
  },
  {
    name: "Alert Engine",
    status: "running",
    uptime: "15 days 8 hours",
    cpu: "8%",
    memory: "215 MB",
    icon: Zap,
  },
  {
    name: "API Gateway",
    status: "running",
    uptime: "15 days 8 hours",
    cpu: "15%",
    memory: "420 MB",
    icon: Globe,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "running":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" };
    case "stopped":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" };
    case "degraded":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" };
    default:
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20", dot: "bg-zinc-400" };
  }
}

export function SystemStatus() {
  const [services, setServices] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load system status for System Status page.
  useEffect(() => {
    fetchSystemStatus()
      .then((res) => {
        if (res.data?.services) setServices(res.data.services as any);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading system status...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load system status: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && services.length === 0 && (
        <EmptyState title="No system metrics available" description="Backend metrics will appear here." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">System Deployment Status</h1>
        <p className="text-zinc-400 mt-1">Monitor backend services and infrastructure health</p>
      </div>

      {/* Overall Status */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">All Systems Operational</h2>
              <p className="text-emerald-400/80 mt-1">All services running normally</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg px-4 py-2">
            100% Uptime
          </Badge>
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-6">
        {services.map((service) => {
          const statusColor = getStatusColor(service.status);
          const Icon = service.icon;

          return (
            <Card key={service.name} className="bg-zinc-900 border-zinc-800">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 ${statusColor.dot} rounded-full animate-pulse`}></div>
                        <span className={`text-sm ${statusColor.text}`}>{service.status}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                    Active
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
                    <span className="text-sm text-zinc-400">Uptime</span>
                    <span className="text-sm font-medium text-zinc-100">{service.uptime}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-800">
                      <p className="text-xs text-zinc-400 mb-1">CPU Usage</p>
                      <p className="text-lg font-bold text-zinc-100">{service.cpu}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800">
                      <p className="text-xs text-zinc-400 mb-1">Memory</p>
                      <p className="text-lg font-bold text-zinc-100">{service.memory}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Deployment Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Deployment Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <Server className="w-8 h-8 text-blue-400" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-100">Docker Container Deployment</h3>
              <p className="text-sm text-zinc-400 mt-1">
                All services deployed using Docker containers for edge gateway compatibility
              </p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Docker
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2">Environment</p>
              <p className="text-lg font-bold text-zinc-100">Production</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2">Version</p>
              <p className="text-lg font-bold text-zinc-100">v2.4.1</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2">Last Deploy</p>
              <p className="text-lg font-bold text-zinc-100">15 days ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Resource Utilization */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">System Resources</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Total CPU Usage</span>
                <span className="text-sm font-medium text-zinc-100">16%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "16%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Memory Usage</span>
                <span className="text-sm font-medium text-zinc-100">1.5 GB / 8 GB</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "19%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Disk Usage</span>
                <span className="text-sm font-medium text-zinc-100">24 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "24%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Network Stats</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
              <span className="text-sm text-zinc-400">Inbound Traffic</span>
              <span className="text-sm font-medium text-emerald-400">2.4 MB/s</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
              <span className="text-sm text-zinc-400">Outbound Traffic</span>
              <span className="text-sm font-medium text-blue-400">1.8 MB/s</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
              <span className="text-sm text-zinc-400">Active Connections</span>
              <span className="text-sm font-medium text-zinc-100">142</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
