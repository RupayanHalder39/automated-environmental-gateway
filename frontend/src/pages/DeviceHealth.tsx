import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Activity, Battery, Signal, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";
import { fetchDevices } from "../services/deviceService";
import { EmptyState } from "../components/EmptyState";

interface Device {
  id: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  lastHeartbeat: string;
  signalStrength: number;
  batteryLevel: number;
  maintenance: boolean;
}


function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
    case "offline":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
    case "maintenance":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    default:
      return { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" };
  }
}

function getBatteryColor(level: number) {
  if (level > 60) return "text-emerald-400";
  if (level > 30) return "text-yellow-400";
  return "text-red-400";
}

function getSignalColor(strength: number) {
  if (strength > 70) return "text-emerald-400";
  if (strength > 40) return "text-yellow-400";
  return "text-red-400";
}

export function DeviceHealth() {
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [apiDevices, setApiDevices] = useState<Device[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load device list for Device Health view.
  useEffect(() => {
    fetchDevices()
      .then((res) => setApiDevices(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const devices = apiDevices;

  const filteredDevices = devices.filter((device) => {
    if (locationFilter !== "all" && device.location !== locationFilter) return false;
    if (statusFilter !== "all" && device.status !== statusFilter) return false;
    return true;
  });

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const maintenanceCount = devices.filter((d) => d.status === "maintenance").length;

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading device health data...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load devices: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && devices.length === 0 && (
        <EmptyState title="No devices found" description="Connect gateways or adjust filters." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Device Health Monitor</h1>
        <p className="text-zinc-400 mt-1">Track IoT gateway status and performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Devices</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{devices.length}</p>
            </div>
            <Activity className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Online</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{onlineCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400/80 uppercase tracking-wide">Offline</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{offlineCount}</p>
            </div>
            <WifiOff className="w-8 h-8 text-red-500/50" />
          </div>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400/80 uppercase tracking-wide">Maintenance</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{maintenanceCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-2 block">Filter by Location</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Salt Lake">Salt Lake</SelectItem>
                <SelectItem value="New Town">New Town</SelectItem>
                <SelectItem value="Sector V">Sector V</SelectItem>
                <SelectItem value="Rajarhat">Rajarhat</SelectItem>
                <SelectItem value="Park Street">Park Street</SelectItem>
                <SelectItem value="Ballygunge">Ballygunge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-2 block">Filter by Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1"></div>
          <div className="flex-1"></div>
        </div>
      </Card>

      {/* Device Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Device List</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Device ID</TableHead>
              <TableHead className="text-zinc-400">Location</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Last Heartbeat</TableHead>
              <TableHead className="text-zinc-400">Signal Strength</TableHead>
              <TableHead className="text-zinc-400">Battery Level</TableHead>
              <TableHead className="text-zinc-400">Maintenance</TableHead>
              <TableHead className="text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => {
              const statusColor = getStatusColor(device.status);
              return (
                <TableRow
                  key={device.id}
                  className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                  onClick={() => setSelectedDevice(device)}
                >
                  <TableCell className="font-medium text-zinc-100">{device.id}</TableCell>
                  <TableCell className="text-zinc-300">{device.location}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{device.lastHeartbeat}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Signal className={`w-4 h-4 ${getSignalColor(device.signalStrength)}`} />
                      <span className={`text-sm ${getSignalColor(device.signalStrength)}`}>
                        {device.signalStrength}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                      <span className={`text-sm ${getBatteryColor(device.batteryLevel)}`}>
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.maintenance ? (
                      <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Required
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Device Detail Dialog */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Device Details: {selectedDevice?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-zinc-800 border-zinc-700 p-4">
                  <p className="text-xs text-zinc-400 mb-2">Location</p>
                  <p className="text-lg font-semibold text-zinc-100">{selectedDevice.location}</p>
                </Card>
                <Card className="bg-zinc-800 border-zinc-700 p-4">
                  <p className="text-xs text-zinc-400 mb-2">Status</p>
                  <Badge
                    className={`${getStatusColor(selectedDevice.status).bg} ${
                      getStatusColor(selectedDevice.status).text
                    } border ${getStatusColor(selectedDevice.status).border}`}
                  >
                    {selectedDevice.status}
                  </Badge>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-zinc-800 border-zinc-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Signal className={`w-4 h-4 ${getSignalColor(selectedDevice.signalStrength)}`} />
                    <p className="text-xs text-zinc-400">Signal Strength</p>
                  </div>
                  <p className={`text-2xl font-bold ${getSignalColor(selectedDevice.signalStrength)}`}>
                    {selectedDevice.signalStrength}%
                  </p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(selectedDevice.batteryLevel)}`} />
                    <p className="text-xs text-zinc-400">Battery Level</p>
                  </div>
                  <p className={`text-2xl font-bold ${getBatteryColor(selectedDevice.batteryLevel)}`}>
                    {selectedDevice.batteryLevel}%
                  </p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-zinc-400">Maintenance</p>
                  </div>
                  <p className={`text-lg font-bold ${selectedDevice.maintenance ? "text-orange-400" : "text-emerald-400"}`}>
                    {selectedDevice.maintenance ? "Required" : "OK"}
                  </p>
                </Card>
              </div>

              <Card className="bg-zinc-800 border-zinc-700 p-4">
                <p className="text-xs text-zinc-400 mb-2">Last Heartbeat</p>
                <p className="text-sm text-zinc-100">{selectedDevice.lastHeartbeat}</p>
              </Card>

              <div className="flex gap-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Run Diagnostics
                </Button>
                <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  View Logs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
