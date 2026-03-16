import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { createSensor, deleteSensor, fetchSensorLatest, fetchSensors, updateSensor } from "../services/sensorService";
import type { SensorDTO } from "../types/sensor";
import { EmptyState } from "../components/EmptyState";
import { fetchLocations } from "../services/locationService";
import type { LocationDTO } from "../types/location";
import { Eye, Trash2, Plus } from "lucide-react";

type SensorFormState = {
  id: string;
  locationId: string;
  sensorType: string;
  status: "online" | "offline" | "inactive";
};

const sensorSchema = z.object({
  id: z.string().min(1, "Sensor ID is required"),
  locationId: z.string().min(1, "Location is required"),
  sensorType: z.string().min(1, "Sensor type is required"),
  status: z.enum(["online", "offline", "inactive"]),
});

export function Sensors() {
  const [sensors, setSensors] = useState<SensorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorDTO | null>(null);
  const [formState, setFormState] = useState<SensorFormState>({
    id: "",
    locationId: "",
    sensorType: "AQI",
    status: "online",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [detailSensor, setDetailSensor] = useState<SensorDTO | null>(null);
  const [detailTelemetry, setDetailTelemetry] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decommissioningId, setDecommissioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchSensors(true)
      .then((res) => setSensors(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLocations()
      .then((res) => setLocations(res.data || []))
      .catch(() => setLocations([]));
  }, []);

  const locationLabel = (id?: string) =>
    locations.find((loc) => loc.id === id)?.name || "Unknown";

  const openCreate = () => {
    setEditingSensor(null);
    setFormState({
      id: "",
      locationId: locations[0]?.id || "",
      sensorType: "AQI",
      status: "online",
    });
    setIsFormOpen(true);
  };

  const openEdit = (sensor: SensorDTO) => {
    const locationId = sensor.locationId || locations.find((loc) => loc.name === sensor.location)?.id || "";
    setEditingSensor(sensor);
    setFormState({
      id: sensor.id,
      locationId,
      sensorType: sensor.sensorType || "AQI",
      status: sensor.status,
    });
    setIsFormOpen(true);
  };

  const openDetails = async (sensor: SensorDTO) => {
    setDetailSensor(sensor);
    setDetailTelemetry(null);
    setDetailLoading(true);
    try {
      const res = await fetchSensorLatest(sensor.id);
      setDetailTelemetry(res.data || null);
    } catch {
      setDetailTelemetry(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async () => {
    const duplicate = !editingSensor && sensors.some((sensor) => sensor.id === formState.id);
    const parsed = sensorSchema.safeParse(formState);
    if (!parsed.success || duplicate) {
      return;
    }
    setApiError(null);
    setIsSaving(true);
    try {
      if (editingSensor) {
        const res = await updateSensor(editingSensor.id, {
          locationId: formState.locationId,
          sensorType: formState.sensorType,
          status: formState.status,
        });
        const updated = res.data as SensorDTO | null;
        if (updated) {
          setSensors((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      } else {
        const res = await createSensor(formState);
        const created = res.data as SensorDTO;
        setSensors((prev) => [created, ...prev]);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setApiError(err.message || "Failed to save sensor");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecommission = async (sensorId: string) => {
    setDecommissioningId(sensorId);
    setApiError(null);
    try {
      const res = await deleteSensor(sensorId);
      const updated = res.data as SensorDTO | null;
      if (updated) {
        setSensors((prev) => prev.map((s) => (s.id === sensorId ? updated : s)));
      } else {
        setSensors((prev) => prev.filter((s) => s.id !== sensorId));
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to decommission sensor");
    } finally {
      setDecommissioningId(null);
    }
  };

  const onlineCount = useMemo(
    () => sensors.filter((sensor) => sensor.status === "online").length,
    [sensors]
  );
  const offlineCount = sensors.filter((sensor) => sensor.status === "offline").length;
  const inactiveCount = sensors.filter((sensor) => sensor.status === "inactive").length;

  const parsedValidation = sensorSchema.safeParse(formState);
  const validationErrors = parsedValidation.success ? null : parsedValidation.error.flatten().fieldErrors;
  const duplicateId = !editingSensor && formState.id && sensors.some((sensor) => sensor.id === formState.id);
  const isFormValid = parsedValidation.success && !duplicateId;

  return (
    <div className="p-6 space-y-6">
      {loading && <p className="text-xs text-zinc-400">Loading sensors...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load sensors: {apiError}</p>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Sensors</h1>
          <p className="text-zinc-400 mt-1">Live sensor inventory and latest readings</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add New Sensor
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
        <Card className="bg-zinc-800 border-zinc-700 p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">Inactive</p>
          <p className="text-2xl font-bold text-zinc-300 mt-1">{inactiveCount}</p>
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
            <div className="p-4 text-xs uppercase tracking-wide text-zinc-500 grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr_1.2fr_1.4fr_0.9fr_0.3fr] gap-4">
              <span className="whitespace-nowrap">Sensor ID</span>
              <span className="whitespace-nowrap">Location</span>
              <span className="whitespace-nowrap">Status</span>
              <span className="whitespace-nowrap">Type</span>
              <span className="whitespace-nowrap">Current Value</span>
              <span className="whitespace-nowrap">Last Update</span>
              <span className="whitespace-nowrap">Details</span>
              <span className="whitespace-nowrap text-right"> </span>
            </div>
            {sensors.map((sensor) => (
              <div
                key={sensor.id}
                className={`p-4 grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr_1.2fr_1.4fr_0.9fr_0.3fr] gap-4 items-center ${sensor.status === "inactive" ? "opacity-60" : ""}`}
              >
                <span className="text-zinc-100 font-medium whitespace-nowrap">{sensor.id}</span>
                <span className="text-zinc-100 whitespace-nowrap">{sensor.location}</span>
                <div className="flex items-center">
                  <Badge
                    className={
                      sensor.status === "inactive"
                        ? "bg-zinc-700 text-zinc-300 border border-zinc-600"
                        : sensor.healthStatus === "fault"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : sensor.healthStatus === "warning"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }
                  >
                    {sensor.status === "inactive" ? "inactive" : sensor.healthStatus || "healthy"}
                  </Badge>
                </div>
                <span className="text-zinc-100 whitespace-nowrap">{sensor.sensorType || "AQI"}</span>
                <span className="text-zinc-100 whitespace-nowrap">
                  {sensor.sensorType === "Temperature"
                    ? `${sensor.temperature}°C`
                    : sensor.sensorType === "Humidity"
                      ? `${sensor.humidity}%`
                      : sensor.sensorType === "Water Level"
                        ? `${sensor.waterLevel}m`
                        : sensor.aqi}
                </span>
                <span className="text-zinc-100 leading-tight">
                  <span className="block whitespace-nowrap">{format(new Date(sensor.lastUpdate), "PP")}</span>
                  <span className="block text-xs text-zinc-400 whitespace-nowrap">
                    {format(new Date(sensor.lastUpdate), "p")}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 whitespace-nowrap"
                  onClick={() => openDetails(sensor)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 ${
                      sensor.status !== "inactive" ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    disabled={sensor.status !== "inactive" || decommissioningId === sensor.id}
                    onClick={() => handleDecommission(sensor.id)}
                    title={
                      sensor.status !== "inactive"
                        ? "Only inactive sensors can be deleted"
                        : "Delete sensor"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSensor ? "Edit Sensor" : "Add New Sensor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Sensor ID</label>
              <Input
                value={formState.id}
                onChange={(e) => setFormState({ ...formState, id: e.target.value })}
                placeholder="e.g., SEN-010"
                className="bg-white text-black placeholder:text-zinc-400"
                disabled={!!editingSensor}
              />
              {validationErrors?.id && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.id[0]}</p>
              )}
              {duplicateId && (
                <p className="text-xs text-red-400 mt-1">Sensor ID must be unique</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Location</label>
                <select
                  value={formState.locationId}
                  onChange={(e) => setFormState({ ...formState, locationId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {validationErrors?.locationId && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.locationId[0]}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Sensor Type</label>
                <select
                  value={formState.sensorType}
                  onChange={(e) => setFormState({ ...formState, sensorType: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2"
                >
                  <option value="AQI">AQI</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Humidity">Humidity</option>
                  <option value="Water Level">Water Level</option>
                </select>
                {validationErrors?.sensorType && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.sensorType[0]}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Initial Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as SensorFormState["status"] })}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSaving || !isFormValid}
              >
                {editingSensor ? "Save Sensor" : "Create Sensor"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailSensor} onOpenChange={(open) => !open && setDetailSensor(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sensor Details</DialogTitle>
          </DialogHeader>
          {detailSensor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Sensor ID</p>
                  <p className="text-zinc-100">{detailSensor.id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Location UUID</p>
                  <p className="text-zinc-100">{detailSensor.locationId || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Sensor Type</p>
                  <p className="text-zinc-100">{detailSensor.sensorType || "AQI"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Location</p>
                  <p className="text-zinc-100">{detailSensor.location}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Connectivity</p>
                  <p className="text-zinc-100">{detailSensor.status}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Health Status</p>
                  <p className="text-zinc-100">{detailSensor.healthStatus || "healthy"}</p>
                </div>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
                <p className="text-sm text-zinc-300 mb-2">Current Value</p>
                {detailLoading ? (
                  <p className="text-xs text-zinc-400">Loading telemetry...</p>
                ) : detailTelemetry ? (
                  <div className="text-sm">
                    {detailSensor.sensorType === "Temperature" && (
                      <span>Temperature: {detailTelemetry.temperature_c ?? "--"}°C</span>
                    )}
                    {detailSensor.sensorType === "Humidity" && (
                      <span>Humidity: {detailTelemetry.humidity_pct ?? "--"}%</span>
                    )}
                    {detailSensor.sensorType === "Water Level" && (
                      <span>Water Level: {detailTelemetry.water_level_cm ?? "--"} cm</span>
                    )}
                    {detailSensor.sensorType === "AQI" && (
                      <span>AQI: {detailTelemetry.aqi ?? "--"}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No telemetry available.</p>
                )}
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
                <p className="text-sm text-zinc-300 mb-2">Hardware Metadata</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Firmware: {detailSensor.metadata?.firmware || "v1.0.0"}</span>
                  <span>
                    Last Calibration:{" "}
                    {detailSensor.metadata?.lastCalibration
                      ? format(new Date(detailSensor.metadata.lastCalibration), "PP")
                      : "Unknown"}
                  </span>
                  <span className="col-span-2">
                    Hardware Metadata:{" "}
                    {detailSensor.metadata?.hardwareMetadata
                      ? typeof detailSensor.metadata.hardwareMetadata === "string"
                        ? detailSensor.metadata.hardwareMetadata
                        : `Model ${detailSensor.metadata.hardwareMetadata.model ?? "N/A"} • Batch ${detailSensor.metadata.hardwareMetadata.batch ?? "N/A"}`
                      : "Unknown"}
                  </span>
                </div>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
                <p className="text-sm text-zinc-300 mb-2">Type-Specific Details</p>
                {detailSensor.metadata?.typeDetails?.aqi && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Fan RPM: {detailSensor.metadata.typeDetails.aqi.fan_rpm}</span>
                    <span>Laser Health: {detailSensor.metadata.typeDetails.aqi.laser_health_percent}%</span>
                  </div>
                )}
                {detailSensor.metadata?.typeDetails?.temperature && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Thermal Drift Rate: {detailSensor.metadata.typeDetails.temperature.thermal_drift_rate}</span>
                    <span>Probe Type: {detailSensor.metadata.typeDetails.temperature.probe_type}</span>
                  </div>
                )}
                {detailSensor.metadata?.typeDetails?.humidity && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Heater Status: {detailSensor.metadata.typeDetails.humidity.heater_status ? "On" : "Off"}</span>
                    <span>Risk Level: {detailSensor.metadata.typeDetails.humidity.saturation_risk_level}</span>
                  </div>
                )}
                {detailSensor.metadata?.typeDetails?.waterLevel && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Echo Quality: {detailSensor.metadata.typeDetails.waterLevel.echo_quality_db} dB</span>
                    <span>Mounting Offset: {detailSensor.metadata.typeDetails.waterLevel.mounting_offset_mm} mm</span>
                  </div>
                )}
                {!detailSensor.metadata?.typeDetails && (
                  <p className="text-xs text-zinc-400">No type-specific details available.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
