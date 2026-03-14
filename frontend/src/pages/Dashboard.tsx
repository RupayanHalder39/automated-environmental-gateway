import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

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
  const avgAqi =
    sensors.length > 0
      ? Math.round(sensors.reduce((sum, s) => sum + s.aqi, 0) / sensors.length)
      : 0;

  const mapMarkers = useMemo(
    () =>
      sensors.filter((sensor) => Number.isFinite(sensor.lat) && Number.isFinite(sensor.lng)),
    [sensors],
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [22.5726, 88.3639],
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 18,
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      // Ensure Leaflet measures the container after mount.
      setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      mapMarkers.forEach((sensor) => {
        const aqiColor = getAQIColor(sensor.aqi);
        const color =
          aqiColor.bg === "bg-emerald-500"
            ? "#10b981"
            : aqiColor.bg === "bg-yellow-500"
              ? "#f59e0b"
              : aqiColor.bg === "bg-orange-500"
                ? "#f97316"
                : "#ef4444";

        const iconHtml = `
          <div class=\"sensor-pin\">
            <div class=\"sensor-pin__dot\" style=\"background:${color}\"></div>
          </div>
        `;

        const marker = L.marker([sensor.lat, sensor.lng], {
          icon: L.divIcon({
            className: "sensor-pin-wrapper",
            html: iconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
        }).bindPopup(
          `<strong>${sensor.location}</strong><br/>AQI: ${sensor.aqi}<br/>Temp: ${sensor.temperature}°C`
        );

        marker.on("click", () => setSelectedSensor(sensor));
        marker.addTo(markersLayerRef.current!);
      });
    }

    if (mapRef.current && mapMarkers.length > 0) {
      const bounds = L.latLngBounds(mapMarkers.map((s) => [s.lat, s.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [mapMarkers]);

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
              <p className="text-2xl font-bold text-yellow-400 mt-1">{avgAqi}</p>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,1.2fr)]">
        {/* Interactive Map */}
        <Card className="min-w-0 bg-zinc-900 border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Kolkata Sensor Map</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-400">Live Updates</span>
            </div>
          </div>

          <div className="relative bg-zinc-800" style={{ height: "600px" }}>
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Map title */}
              <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur px-3 py-2 rounded-lg border border-zinc-700 pointer-events-auto">
                <p className="text-sm font-semibold text-zinc-100">Kolkata Metropolitan Area</p>
                <p className="text-xs text-zinc-400">Environmental Monitoring Network</p>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur px-3 py-2 rounded-lg border border-zinc-700 space-y-1 pointer-events-auto">
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
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="min-w-0 bg-zinc-900 border-zinc-800">
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
