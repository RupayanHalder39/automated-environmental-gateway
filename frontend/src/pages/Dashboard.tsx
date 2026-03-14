import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { RefreshCw, MapPin, Thermometer, Droplets, Waves, Clock } from "lucide-react";
import { fetchSensors } from "../services/sensorService";
import { EmptyState } from "../components/EmptyState";

interface Sensor {
  id: string;
  location: string;
  lat: number;
  lng: number;
  aqi: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  lastUpdate: string;
  status: "online" | "offline";
}

const mockSensors: Sensor[] = [
  {
    id: "SEN-001",
    location: "Salt Lake",
    lat: 22.5726,
    lng: 88.4197,
    aqi: 45,
    temperature: 28,
    humidity: 65,
    waterLevel: 2.3,
    lastUpdate: "2 min ago",
    status: "online",
  },
  {
    id: "SEN-002",
    location: "New Town",
    lat: 22.5897,
    lng: 88.4753,
    aqi: 78,
    temperature: 29,
    humidity: 68,
    waterLevel: 1.8,
    lastUpdate: "1 min ago",
    status: "online",
  },
  {
    id: "SEN-003",
    location: "Sector V",
    lat: 22.5726,
    lng: 88.4324,
    aqi: 120,
    temperature: 31,
    humidity: 72,
    waterLevel: 3.1,
    lastUpdate: "3 min ago",
    status: "online",
  },
  {
    id: "SEN-004",
    location: "Rajarhat",
    lat: 22.6208,
    lng: 88.4504,
    aqi: 95,
    temperature: 27,
    humidity: 70,
    waterLevel: 2.5,
    lastUpdate: "4 min ago",
    status: "online",
  },
  {
    id: "SEN-005",
    location: "Park Street",
    lat: 22.5543,
    lng: 88.3519,
    aqi: 165,
    temperature: 32,
    humidity: 75,
    waterLevel: 1.9,
    lastUpdate: "5 min ago",
    status: "online",
  },
];

function getAQIColor(aqi: number) {
  if (aqi <= 50) return { bg: "bg-emerald-500", text: "text-emerald-500", label: "Good" };
  if (aqi <= 100) return { bg: "bg-yellow-500", text: "text-yellow-500", label: "Moderate" };
  if (aqi <= 150) return { bg: "bg-orange-500", text: "text-orange-500", label: "Poor" };
  return { bg: "bg-red-500", text: "text-red-500", label: "Dangerous" };
}

export function Dashboard() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiSensors, setApiSensors] = useState<Sensor[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load live sensor list for the dashboard.
  useEffect(() => {
    fetchSensors()
      .then((res) => setApiSensors(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const sensors = apiSensors;

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading live sensor data...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load sensors: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && sensors.length === 0 && (
        <EmptyState title="No live sensors available" description="Check device connections or try again later." />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Real-Time Sensor Dashboard</h1>
          <p className="text-zinc-400 mt-1">Monitoring environmental data across Kolkata</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Sensors</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{sensors.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Online Devices</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {sensors.filter((s) => s.status === "online").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg AQI</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {Math.round(sensors.reduce((sum, s) => sum + s.aqi, 0) / sensors.length)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Alerts</p>
              <p className="text-2xl font-bold text-red-400 mt-1">3</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Badge className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="col-span-2 bg-zinc-900 border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Kolkata Sensor Map</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-400">Live Updates</span>
            </div>
          </div>

          <div className="relative bg-zinc-800" style={{ height: "600px" }}>
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgb(161 161 170 / 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgb(161 161 170 / 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              ></div>

              {/* Map title */}
              <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur px-3 py-2 rounded-lg border border-zinc-700">
                <p className="text-sm font-semibold text-zinc-100">Kolkata Metropolitan Area</p>
                <p className="text-xs text-zinc-400">Environmental Monitoring Network</p>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur px-3 py-2 rounded-lg border border-zinc-700 space-y-1">
                <p className="text-xs font-semibold text-zinc-300 mb-2">AQI Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-zinc-400">Good (0-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-zinc-400">Moderate (51-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-zinc-400">Poor (101-150)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-zinc-400">Dangerous (151+)</span>
                </div>
              </div>

              {/* Sensor Markers */}
              {sensors.map((sensor, index) => {
                const aqiColor = getAQIColor(sensor.aqi);
                // Position sensors relative to map
                const positions = [
                  { top: "35%", left: "40%" }, // Salt Lake
                  { top: "25%", left: "60%" }, // New Town
                  { top: "35%", left: "48%" }, // Sector V
                  { top: "15%", left: "55%" }, // Rajarhat
                  { top: "55%", left: "25%" }, // Park Street
                ];

                return (
                  <div
                    key={sensor.id}
                    className="absolute cursor-pointer group"
                    style={positions[index]}
                    onClick={() => setSelectedSensor(sensor)}
                  >
                    {/* Pulse effect */}
                    <div
                      className={`absolute inset-0 ${aqiColor.bg} rounded-full animate-ping opacity-75`}
                      style={{ width: "24px", height: "24px" }}
                    ></div>

                    {/* Marker */}
                    <div
                      className={`relative ${aqiColor.bg} rounded-full border-2 border-zinc-900 flex items-center justify-center transition-transform group-hover:scale-125`}
                      style={{ width: "24px", height: "24px" }}
                    >
                      <MapPin className="w-3 h-3 text-white" />
                    </div>

                    {/* Label */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur px-2 py-1 rounded border border-zinc-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-medium text-zinc-100">{sensor.location}</p>
                      <p className={`text-xs ${aqiColor.text}`}>AQI: {sensor.aqi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Latest Activity</h2>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "600px" }}>
            {sensors.map((sensor) => {
              const aqiColor = getAQIColor(sensor.aqi);
              return (
                <div
                  key={sensor.id}
                  className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${aqiColor.bg} rounded-full`}></div>
                      <span className="text-sm font-medium text-zinc-100">{sensor.location}</span>
                    </div>
                    <Badge className="bg-zinc-700 text-zinc-300 text-xs">{sensor.id}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">AQI</span>
                      <span className={`font-medium ${aqiColor.text}`}>{sensor.aqi}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Temperature</span>
                      <span className="text-zinc-300">{sensor.temperature}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Humidity</span>
                      <span className="text-zinc-300">{sensor.humidity}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{sensor.lastUpdate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Sensor Detail Dialog */}
      <Dialog open={!!selectedSensor} onOpenChange={() => setSelectedSensor(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Sensor Details
            </DialogTitle>
          </DialogHeader>

          {selectedSensor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Sensor ID</p>
                  <p className="text-sm font-medium text-zinc-100 mt-1">{selectedSensor.id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-zinc-100 mt-1">{selectedSensor.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 ${getAQIColor(selectedSensor.aqi).bg} rounded-full`}></div>
                    <p className="text-xs text-zinc-400">Air Quality Index</p>
                  </div>
                  <p className={`text-2xl font-bold ${getAQIColor(selectedSensor.aqi).text}`}>
                    {selectedSensor.aqi}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{getAQIColor(selectedSensor.aqi).label}</p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-3 h-3 text-orange-400" />
                    <p className="text-xs text-zinc-400">Temperature</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100">{selectedSensor.temperature}°C</p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <p className="text-xs text-zinc-400">Humidity</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100">{selectedSensor.humidity}%</p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="w-3 h-3 text-cyan-400" />
                    <p className="text-xs text-zinc-400">Water Level</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100">{selectedSensor.waterLevel}m</p>
                </Card>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                <div>
                  <p className="text-xs text-zinc-400">Device Status</p>
                  <p className="text-sm font-medium text-emerald-400 capitalize mt-1">
                    {selectedSensor.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Last Updated</p>
                  <p className="text-sm font-medium text-zinc-100 mt-1">{selectedSensor.lastUpdate}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
