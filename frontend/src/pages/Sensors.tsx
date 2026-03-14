import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { fetchSensors } from "../services/sensorService";
import type { SensorDTO } from "../types/sensor";
import { EmptyState } from "../components/EmptyState";

export function Sensors() {
  const [sensors, setSensors] = useState<SensorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchSensors()
      .then((res) => setSensors(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const onlineCount = useMemo(
    () => sensors.filter((sensor) => sensor.status === "online").length,
    [sensors]
  );
  const offlineCount = sensors.length - onlineCount;

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "PPpp");
  };

  return (
    <div className="p-6 space-y-6">
      {loading && <p className="text-xs text-zinc-400">Loading sensors...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load sensors: {apiError}</p>}

      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Sensors</h1>
        <p className="text-zinc-400 mt-1">Live sensor inventory and latest readings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Sensors</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{sensors.length}</p>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Online</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{onlineCount}</p>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20 p-4">
          <p className="text-xs text-red-400/80 uppercase tracking-wide">Offline</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{offlineCount}</p>
        </Card>
      </div>

      {!loading && !apiError && sensors.length === 0 && (
        <EmptyState title="No sensors available" description="No sensor data has been ingested yet." />
      )}

      {sensors.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Sensor Inventory</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="p-6 flex flex-wrap items-center gap-6">
                <div className="min-w-[180px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Sensor ID</p>
                  <p className="text-zinc-100 font-medium">{sensor.id}</p>
                </div>
                <div className="min-w-[160px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Location</p>
                  <p className="text-zinc-100">{sensor.location}</p>
                </div>
                <div className="min-w-[120px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Status</p>
                  <Badge
                    className={
                      sensor.status === "online"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }
                  >
                    {sensor.status}
                  </Badge>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">AQI</p>
                  <p className="text-zinc-100">{sensor.aqi}</p>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Temperature</p>
                  <p className="text-zinc-100">{sensor.temperature}°C</p>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Humidity</p>
                  <p className="text-zinc-100">{sensor.humidity}%</p>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Water Level</p>
                  <p className="text-zinc-100">{sensor.waterLevel} m</p>
                </div>
                <div className="min-w-[220px]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Last Update</p>
                  <p className="text-zinc-100">{formatTimestamp(sensor.lastUpdate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
