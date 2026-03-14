import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Key, Copy, Trash2, Plus, BarChart3, Code } from "lucide-react";
import { fetchApiKeys } from "../services/apiKeyService";
import { EmptyState } from "../components/EmptyState";

const mockApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "aeg_prod_k8s9d7f6a5s4d3f2g1h",
    created: "2026-02-15",
    lastUsed: "2 hours ago",
    requests: 15420,
  },
  {
    id: "2",
    name: "Development API Key",
    key: "aeg_dev_j7h6g5f4d3s2a1z9x8c",
    created: "2026-03-01",
    lastUsed: "5 minutes ago",
    requests: 8734,
  },
];

const usageData = [
  { date: "Mar 7", requests: 420 },
  { date: "Mar 8", requests: 380 },
  { date: "Mar 9", requests: 520 },
  { date: "Mar 10", requests: 460 },
  { date: "Mar 11", requests: 590 },
  { date: "Mar 12", requests: 510 },
  { date: "Mar 13", requests: 640 },
];

export function PublicAPI() {
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState("100");
  const [rateLimitPerHour, setRateLimitPerHour] = useState("5000");
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load API keys for Public API management.
  useEffect(() => {
    fetchApiKeys()
      .then((res) => {
        setApiKeys((res.data as any) || []);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading API keys...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load API keys: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && apiKeys.length === 0 && (
        <EmptyState title="No API keys yet" description="Generate a key to access public endpoints." />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Public API Management</h1>
          <p className="text-zinc-400 mt-1">Manage API access for environmental data</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" />
          Generate New Key
        </Button>
      </div>

      {/* API Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Keys</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{apiKeys.length}</p>
            </div>
            <Key className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Total Requests</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">24.1K</p>
            </div>
            <BarChart3 className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400/80 uppercase tracking-wide">Requests/Hour</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">640</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Response</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">42ms</p>
            </div>
          </div>
        </Card>
      </div>

      {/* API Documentation */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">API Endpoints</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                GET
              </Badge>
              <code className="text-sm text-zinc-100">/api/v1/aqi</code>
            </div>
            <p className="text-sm text-zinc-400 mb-3">Get current AQI data for a specific location</p>
            <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-emerald-400">
              GET /api/v1/aqi?location=SaltLake
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                GET
              </Badge>
              <code className="text-sm text-zinc-100">/api/v1/sensors</code>
            </div>
            <p className="text-sm text-zinc-400 mb-3">List all active sensors and their locations</p>
            <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-emerald-400">
              GET /api/v1/sensors
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                GET
              </Badge>
              <code className="text-sm text-zinc-100">/api/v1/historical</code>
            </div>
            <p className="text-sm text-zinc-400 mb-3">Retrieve historical environmental data</p>
            <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-emerald-400">
              GET /api/v1/historical?metric=temperature&days=7
            </div>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">API Keys</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6 hover:bg-zinc-800/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">{apiKey.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300 font-mono">
                      {apiKey.key}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-zinc-400">
                    <span>Created: {apiKey.created}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                    <span>Requests: {apiKey.requests.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rate Limits */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Rate Limit Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Requests per Minute</label>
              <Input
                type="number"
                value={rateLimitPerMinute}
                onChange={(e) => setRateLimitPerMinute(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Requests per Hour</label>
              <Input
                type="number"
                value={rateLimitPerHour}
                onChange={(e) => setRateLimitPerHour(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Save Configuration
          </Button>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">API Usage Statistics</h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
