// Dev data generator and in-memory store for DEV_MODE=true.
// This keeps frontend screens functional without a live sensor pipeline or DB.

import type { SensorDTO, SensorSummaryDTO } from "../types/sensor";
import type { DeviceDTO, DeviceHealthSummaryDTO } from "../types/device";
import type { AlertDTO, AlertSummaryDTO } from "../types/alert";
import type { AnomalyDTO, AnomalySummaryDTO } from "../types/anomaly";
import type { RuleDTO } from "../types/rule";
import type { ReportDTO } from "../types/report";
import type { SystemStatusDTO, SystemServiceDTO } from "../types/system";
import type { ApiKeyDTO } from "../types/apiKey";

const DEV_LOCATIONS = [
  { id: "b7d6a4b2-73f6-4f2d-9d8a-5a4e5bb8e9a1", slug: "salt-lake", name: "Salt Lake", lat: 22.5726, lng: 88.4197 },
  { id: "b1e6f9a9-b9d8-4d9d-9a0b-2e50c2a6b7dd", slug: "new-town", name: "New Town", lat: 22.5897, lng: 88.4753 },
  { id: "3c4a45f0-2a83-4c40-9f1e-2f8a8a4d9e6d", slug: "sector-v", name: "Sector V", lat: 22.5726, lng: 88.4324 },
  { id: "c7d6f2ad-3d6d-4bd7-8a4b-1b3f9e2b4f7a", slug: "rajarhat", name: "Rajarhat", lat: 22.6208, lng: 88.4504 },
  { id: "6d2b3c5a-12c4-4f2d-9d6e-1a3c5b7d9e8f", slug: "park-street", name: "Park Street", lat: 22.5543, lng: 88.3519 },
];

const DEV_DEVICES = ["GW-001", "GW-002", "GW-003", "GW-004", "GW-005"]; 
const DEV_SENSORS = ["SEN-001", "SEN-002", "SEN-003", "SEN-004", "SEN-005"]; 

type DevReading = {
  sensorCode: string;
  recordedAt: string;
  aqi: number;
  temperature: number;
  humidity: number;
  waterLevelCm: number;
};

type DevSensor = {
  sensorCode: string;
  deviceCode: string;
  location: string;
  locationId: string;
  lat: number;
  lng: number;
};

type DevDevice = {
  deviceCode: string;
  location: string;
  locationId: string;
  status: "online" | "offline" | "maintenance";
  lastHeartbeat: string;
  signalStrength: number;
  batteryLevel: number;
  maintenance: boolean;
};

type DevState = {
  seeded: boolean;
  sensors: DevSensor[];
  devices: DevDevice[];
  readingsBySensor: Map<string, DevReading>;
  historyBySensor: Map<string, DevReading[]>;
  alerts: AlertDTO[];
  anomalies: AnomalyDTO[];
  rules: RuleDTO[];
  reports: ReportDTO[];
  apiKeys: ApiKeyDTO[];
  batches: any[];
  ingestionCount: number;
  lastIngest: string | null;
};

const devState: DevState = {
  seeded: false,
  sensors: [],
  devices: [],
  readingsBySensor: new Map(),
  historyBySensor: new Map(),
  alerts: [],
  anomalies: [],
  rules: [],
  reports: [],
  apiKeys: [],
  batches: [],
  ingestionCount: 0,
  lastIngest: null,
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function nowIso() {
  return new Date().toISOString();
}

function seedDevData() {
  if (devState.seeded) return;

  devState.devices = DEV_DEVICES.map((deviceCode, index) => {
    const location = DEV_LOCATIONS[index % DEV_LOCATIONS.length];
    return {
      deviceCode,
      location: location.name,
      locationId: location.id,
      status: "online",
      lastHeartbeat: nowIso(),
      signalStrength: Math.round(randomBetween(65, 98)),
      batteryLevel: Math.round(randomBetween(40, 100)),
      maintenance: false,
    };
  });

  devState.sensors = DEV_SENSORS.map((sensorCode, index) => {
    const location = DEV_LOCATIONS[index % DEV_LOCATIONS.length];
    const deviceCode = DEV_DEVICES[index % DEV_DEVICES.length];
    return {
      sensorCode,
      deviceCode,
      location: location.name,
      locationId: location.id,
      lat: location.lat,
      lng: location.lng,
    };
  });

  devState.rules = [
    {
      id: "RULE-001",
      name: "High AQI Alert",
      conditions: [{ metric: "AQI", operator: ">", threshold: 150 }],
      locationIds: DEV_LOCATIONS.map((loc) => loc.id),
      actionIds: ["notification"],
      status: "active",
      lastTriggered: "",
    },
    {
      id: "RULE-002",
      name: "Water Level Watch",
      conditions: [{ metric: "WATER_LEVEL", operator: ">", threshold: 500 }],
      locationIds: [DEV_LOCATIONS.find((loc) => loc.slug === "sector-v")?.id || ""].filter(Boolean),
      actionIds: ["log"],
      status: "active",
      lastTriggered: "",
    },
  ];

  devState.reports = [
    {
      id: "REP-001",
      name: "Weekly City Health Report",
      type: "Weekly Summary",
      zone: "All Zones",
      dateRange: "Last 7 days",
      generated: new Date().toLocaleString(),
      avgAqi: 92,
      highestPollution: "Park Street",
      waterAlerts: 3,
    },
  ];

  devState.apiKeys = [
    {
      id: "KEY-001",
      name: "Local Dev Key",
      created: new Date().toLocaleDateString(),
      lastUsed: "",
      requests: 0,
    },
  ];

  devState.alerts = [];
  devState.anomalies = [];

  devState.batches = [
    {
      id: "BATCH-001",
      source: "GW-003",
      total_records: 1200,
      inserted_records: 1148,
      failed_records: 52,
      status: "COMPLETED",
      started_at: nowIso(),
      finished_at: nowIso(),
    },
  ];

  // Seed a baseline reading for each sensor.
  devState.sensors.forEach((sensor) => {
    const reading = generateReading(sensor.sensorCode);
    devState.readingsBySensor.set(sensor.sensorCode, reading);
    devState.historyBySensor.set(sensor.sensorCode, [reading]);
  });

  devState.seeded = true;
}

function generateReading(sensorCode: string): DevReading {
  const baseAqi = clamp(randomBetween(40, 160), 10, 260);
  const baseTemp = clamp(randomBetween(22, 35), 10, 45);
  const baseHumidity = clamp(randomBetween(45, 85), 20, 95);
  const baseWater = clamp(randomBetween(80, 320), 10, 600);

  return {
    sensorCode,
    recordedAt: nowIso(),
    aqi: Math.round(baseAqi),
    temperature: Number(baseTemp.toFixed(1)),
    humidity: Math.round(baseHumidity),
    waterLevelCm: Math.round(baseWater),
  };
}

function ensureSensor(sensorCode: string) {
  seedDevData();
  const existing = devState.sensors.find((s) => s.sensorCode === sensorCode);
  if (existing) return existing;
  const fallbackLocation = DEV_LOCATIONS[devState.sensors.length % DEV_LOCATIONS.length];
  const deviceCode = DEV_DEVICES[devState.sensors.length % DEV_DEVICES.length];
  const sensor: DevSensor = {
    sensorCode,
    deviceCode,
    location: fallbackLocation.name,
    locationId: fallbackLocation.id,
    lat: fallbackLocation.lat,
    lng: fallbackLocation.lng,
  };
  devState.sensors.push(sensor);
  return sensor;
}

export function ingestDevReadings(readings: Partial<DevReading>[]) {
  seedDevData();
  const inserted = [] as DevReading[];

  readings.forEach((reading) => {
    if (!reading.sensorCode) return;
    const sensor = ensureSensor(reading.sensorCode);
    const current = devState.readingsBySensor.get(sensor.sensorCode);

    const next: DevReading = {
      sensorCode: sensor.sensorCode,
      recordedAt: reading.recordedAt || nowIso(),
      aqi: Math.round(reading.aqi ?? current?.aqi ?? randomBetween(40, 160)),
      temperature: Number((reading.temperature ?? current?.temperature ?? randomBetween(22, 35)).toFixed(1)),
      humidity: Math.round(reading.humidity ?? current?.humidity ?? randomBetween(45, 85)),
      waterLevelCm: Math.round(reading.waterLevelCm ?? current?.waterLevelCm ?? randomBetween(80, 320)),
    };

    devState.readingsBySensor.set(sensor.sensorCode, next);

    const history = devState.historyBySensor.get(sensor.sensorCode) || [];
    history.unshift(next);
    devState.historyBySensor.set(sensor.sensorCode, history.slice(0, 500));

    const device = devState.devices.find((d) => d.deviceCode === sensor.deviceCode);
    if (device) {
      device.lastHeartbeat = next.recordedAt;
      device.signalStrength = clamp(device.signalStrength + Math.round(randomBetween(-3, 3)), 20, 100);
      device.batteryLevel = clamp(device.batteryLevel + Math.round(randomBetween(-1, 1)), 5, 100);
    }

    if (next.aqi > 160) {
      devState.alerts.unshift({
        id: `ALT-${Date.now()}`,
        type: "critical",
        message: `High AQI detected at ${sensor.location}`,
        location: sensor.location,
        timestamp: next.recordedAt,
        status: "active",
        value: `AQI: ${next.aqi}`,
      });
    }

    inserted.push(next);
  });

  devState.ingestionCount += inserted.length;
  devState.lastIngest = nowIso();

  return { inserted: inserted.length, failed: readings.length - inserted.length };
}

export function listDevSensors(): SensorDTO[] {
  seedDevData();
  return devState.sensors.map((sensor) => {
    const reading = devState.readingsBySensor.get(sensor.sensorCode) || generateReading(sensor.sensorCode);
    return {
      id: sensor.sensorCode,
      location: sensor.location,
      lat: sensor.lat,
      lng: sensor.lng,
      aqi: reading.aqi,
      temperature: reading.temperature,
      humidity: reading.humidity,
      waterLevel: Number((reading.waterLevelCm / 100).toFixed(2)),
      lastUpdate: reading.recordedAt,
      status: "online",
    };
  });
}

export function getDevSensorById(id: string): SensorDTO | null {
  const sensor = listDevSensors().find((s) => s.id === id);
  return sensor || null;
}

export function getDevSensorLatest(id: string) {
  seedDevData();
  const reading = devState.readingsBySensor.get(id);
  if (!reading) return null;
  return {
    recorded_at: reading.recordedAt,
    aqi: reading.aqi,
    temperature_c: reading.temperature,
    humidity_pct: reading.humidity,
    water_level_cm: reading.waterLevelCm,
  };
}

export function getDevLatestByType(type?: string) {
  seedDevData();
  const values = Array.from(devState.readingsBySensor.values());
  if (values.length === 0) return null;
  const latest = values[0];
  const metric = type || "aqi";
  const value =
    metric === "temperature"
      ? latest.temperature
      : metric === "humidity"
        ? latest.humidity
        : metric === "waterLevel"
          ? latest.waterLevelCm
          : latest.aqi;
  return { value, recorded_at: latest.recordedAt };
}

export function getDevSensorSummary(): SensorSummaryDTO {
  seedDevData();
  const sensors = listDevSensors();
  const total = sensors.length;
  const online = sensors.filter((s) => s.status === "online").length;
  const avg = total ? sensors.reduce((sum, s) => sum + s.aqi, 0) / total : 0;
  return {
    totalSensors: total,
    onlineSensors: online,
    offlineSensors: total - online,
    averageAqi: Number(avg.toFixed(1)),
    lastRefreshed: nowIso(),
  };
}

export function getDevSensorHealth() {
  seedDevData();
  const total = devState.sensors.length;
  return { online: total, offline: 0 };
}

export function listDevDevices(): DeviceDTO[] {
  seedDevData();
  return devState.devices.map((device) => ({
    id: device.deviceCode,
    location: device.location,
    status: device.status,
    lastHeartbeat: device.lastHeartbeat,
    signalStrength: device.signalStrength,
    batteryLevel: device.batteryLevel,
    maintenance: device.maintenance,
  }));
}

export function getDevDeviceById(id: string): DeviceDTO | null {
  return listDevDevices().find((d) => d.id === id) || null;
}

export function getDevDeviceHeartbeats(id: string) {
  seedDevData();
  const device = devState.devices.find((d) => d.deviceCode === id);
  if (!device) return [];
  return [
    {
      heartbeat_at: device.lastHeartbeat,
      status: device.status === "offline" ? "OFFLINE" : "OK",
      signal_strength: device.signalStrength,
      battery_pct: device.batteryLevel,
    },
  ];
}

export function getDevDeviceHealthSummary(): DeviceHealthSummaryDTO {
  seedDevData();
  const total = devState.devices.length;
  const maintenance = devState.devices.filter((d) => d.maintenance).length;
  const online = devState.devices.filter((d) => d.status === "online").length;
  const offline = total - online - maintenance;
  return {
    totalDevices: total,
    onlineCount: online,
    offlineCount: offline,
    maintenanceCount: maintenance,
  };
}

export function updateDevDeviceStatus(id: string, status?: string) {
  seedDevData();
  const device = devState.devices.find((d) => d.deviceCode === id);
  if (!device) return null;
  if (status === "MAINTENANCE") {
    device.status = "maintenance";
    device.maintenance = true;
  } else if (status === "ACTIVE") {
    device.status = "online";
    device.maintenance = false;
  } else {
    device.status = "offline";
  }
  return device;
}

export function getDevHistoryReadings(sensorId: string, page: number, pageSize: number) {
  seedDevData();
  const history = devState.historyBySensor.get(sensorId) || [];
  const total = history.length;
  const offset = (page - 1) * pageSize;
  const rows = history.slice(offset, offset + pageSize).map((r) => ({
    recorded_at: r.recordedAt,
    aqi: r.aqi,
    temperature_c: r.temperature,
    humidity_pct: r.humidity,
    water_level_cm: r.waterLevelCm,
  }));
  return { rows, total, page, pageSize };
}

export function getDevHistoryAggregate(metric?: string) {
  seedDevData();
  const metricKey = metric || "aqi";
  const points: Record<string, any> = {};

  devState.sensors.forEach((sensor) => {
    const history = devState.historyBySensor.get(sensor.sensorCode) || [];
    history.slice(0, 24).forEach((entry) => {
      const dateKey = entry.recordedAt;
      if (!points[dateKey]) points[dateKey] = { date: dateKey };
      const value =
        metricKey === "temperature"
          ? entry.temperature
          : metricKey === "humidity"
            ? entry.humidity
            : metricKey === "waterLevel"
              ? entry.waterLevelCm
              : entry.aqi;
      points[dateKey][sensor.location] = value;
    });
  });

  return Object.values(points).slice(0, 30);
}

export function getDevDeviceAggregate(id: string) {
  seedDevData();
  const sensorCodes = devState.sensors.filter((s) => s.deviceCode === id).map((s) => s.sensorCode);
  const series: { date: string; value: number }[] = [];
  sensorCodes.forEach((sensorCode) => {
    const history = devState.historyBySensor.get(sensorCode) || [];
    history.slice(0, 24).forEach((entry) => {
      series.push({ date: entry.recordedAt, value: entry.aqi });
    });
  });
  return series;
}

export function listDevAlerts(status?: string): AlertDTO[] {
  seedDevData();
  if (!status) return devState.alerts;
  return devState.alerts.filter((alert) => alert.status === status);
}

export function getDevAlertById(id: string): AlertDTO | null {
  seedDevData();
  return devState.alerts.find((a) => a.id === id) || null;
}

export function getDevAlertSummary(): AlertSummaryDTO {
  seedDevData();
  const active = devState.alerts.filter((a) => a.status === "active").length;
  const critical = devState.alerts.filter((a) => a.type === "critical").length;
  return { active, critical, resolvedToday: 0 };
}

export function acknowledgeDevAlert(id: string) {
  seedDevData();
  const alert = devState.alerts.find((a) => a.id === id);
  if (!alert) return null;
  alert.status = "resolved";
  return alert;
}

export function resolveDevAlert(id: string) {
  return acknowledgeDevAlert(id);
}

export function triggerDevAlert(payload: { sensorCode?: string; deviceCode?: string; metric?: string; value?: number }) {
  seedDevData();
  const sensor = devState.sensors.find((s) => s.sensorCode === payload.sensorCode) || devState.sensors[0];
  const alert: AlertDTO = {
    id: `ALT-${Date.now()}`,
    type: "warning",
    message: `${payload.metric || "metric"} threshold breached`,
    location: sensor?.location || "Unknown",
    timestamp: nowIso(),
    status: "active",
    value: `${payload.metric || "value"}: ${payload.value ?? "--"}`,
  };
  devState.alerts.unshift(alert);
  return alert;
}

export function listDevAnomalies(): AnomalyDTO[] {
  seedDevData();
  return devState.anomalies;
}

export function getDevAnomalyById(id: string): AnomalyDTO | null {
  seedDevData();
  return devState.anomalies.find((a) => a.id === id) || null;
}

export function getDevAnomalySummary(): AnomalySummaryDTO {
  seedDevData();
  const high = devState.anomalies.filter((a) => a.severity === "high").length;
  const medium = devState.anomalies.filter((a) => a.severity === "medium").length;
  return { totalRejected: devState.anomalies.length, highSeverity: high, mediumSeverity: medium };
}

export function getDevAnomaliesBySensor(sensorId: string): AnomalyDTO[] {
  seedDevData();
  return devState.anomalies.filter((a) => a.sensorId === sensorId);
}

export function createDevAnomaly(payload: Partial<AnomalyDTO>) {
  seedDevData();
  const anomaly: AnomalyDTO = {
    id: `ANO-${Date.now()}`,
    sensorId: payload.sensorId || devState.sensors[0]?.sensorCode || "SEN-001",
    invalidValue: payload.invalidValue || "",
    expectedRange: payload.expectedRange || "",
    timestamp: nowIso(),
    reason: payload.reason || "",
    severity: payload.severity || "low",
  };
  devState.anomalies.unshift(anomaly);
  return anomaly;
}

export function listDevRules(): RuleDTO[] {
  seedDevData();
  return devState.rules;
}

export function listDevLocations() {
  return DEV_LOCATIONS.map(({ id, name, slug }) => ({ id, name, slug }));
}

export function getDevRuleById(id: string): RuleDTO | null {
  seedDevData();
  return devState.rules.find((r) => r.id === id) || null;
}

export function createDevRule(payload: Partial<RuleDTO>) {
  seedDevData();
  const rule: RuleDTO = {
    id: `RULE-${Date.now()}`,
    name: payload.name || "New Rule",
    conditions: payload.conditions || [{ metric: "AQI", operator: ">", threshold: 100 }],
    locationIds: payload.locationIds || ["all"],
    actionIds: payload.actionIds || ["notification"],
    status: payload.status || "active",
    lastTriggered: "",
  };
  devState.rules.unshift(rule);
  return rule;
}

export function updateDevRule(id: string, payload: Partial<RuleDTO>) {
  seedDevData();
  const rule = devState.rules.find((r) => r.id === id);
  if (!rule) return null;
  Object.assign(rule, payload);
  return rule;
}

export function deleteDevRule(id: string) {
  seedDevData();
  const rule = devState.rules.find((r) => r.id === id);
  if (!rule) return null;
  rule.status = "disabled";
  return rule;
}

export function listDevReports(): ReportDTO[] {
  seedDevData();
  return devState.reports;
}

export function getDevReportById(id: string): ReportDTO | null {
  seedDevData();
  return devState.reports.find((r) => r.id === id) || null;
}

export function createDevReport(payload: Partial<ReportDTO>) {
  seedDevData();
  const report: ReportDTO = {
    id: `REP-${Date.now()}`,
    name: payload.name || "Generated Report",
    type: payload.type || "Weekly Summary",
    zone: payload.zone || "All Zones",
    dateRange: payload.dateRange || "Last 7 days",
    generated: nowIso(),
    avgAqi: payload.avgAqi ?? 90,
    highestPollution: payload.highestPollution || "Sector V",
    waterAlerts: payload.waterAlerts ?? 2,
  };
  devState.reports.unshift(report);
  return report;
}

export function deleteDevReport(id: string) {
  seedDevData();
  const index = devState.reports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const [removed] = devState.reports.splice(index, 1);
  return removed;
}

export function listDevApiKeys(): ApiKeyDTO[] {
  seedDevData();
  return devState.apiKeys;
}

export function createDevApiKey(name: string) {
  seedDevData();
  const key: ApiKeyDTO = {
    id: `KEY-${Date.now()}`,
    name,
    key: `dev-${Math.random().toString(36).slice(2, 10)}`,
    created: nowIso(),
    lastUsed: "",
    requests: 0,
  };
  devState.apiKeys.unshift(key);
  return key;
}

export function disableDevApiKey(id: string) {
  seedDevData();
  const key = devState.apiKeys.find((k) => k.id === id);
  return key || null;
}

export function rotateDevApiKey(id: string) {
  seedDevData();
  const key = devState.apiKeys.find((k) => k.id === id);
  if (!key) return null;
  key.key = `dev-${Math.random().toString(36).slice(2, 10)}`;
  return key;
}

export function getDevPublicSensors() {
  return listDevSensors().map((sensor) => ({
    sensor_code: sensor.id,
    location_name: sensor.location,
    latitude: sensor.lat,
    longitude: sensor.lng,
  }));
}

export function getDevPublicAqi() {
  const sensors = listDevSensors();
  const avg = sensors.length ? sensors.reduce((sum, s) => sum + s.aqi, 0) / sensors.length : 0;
  return { value: Number(avg.toFixed(1)), recorded_at: nowIso() };
}

export function getDevPublicHistorical(metric: string) {
  return getDevHistoryAggregate(metric);
}

export function getDevSystemStatus(): SystemStatusDTO {
  seedDevData();
  const services: SystemServiceDTO[] = [
    { name: "Ingestion Pipeline", status: "running", uptime: "99.9%", cpu: "23%", memory: "48%" },
    { name: "Rules Engine", status: "running", uptime: "99.5%", cpu: "19%", memory: "41%" },
    { name: "Alerts Processor", status: "degraded", uptime: "98.7%", cpu: "35%", memory: "62%" },
  ];

  return {
    overallStatus: "Operational",
    uptime: "24 days",
    services,
    environment: "DEV",
    version: "0.1.0",
    deployment: "Local",
  };
}

export function getDevSystemMetrics() {
  return {
    cpu: "23%",
    memory: "48%",
    disk: "62%",
    requestsPerMin: devState.ingestionCount,
  };
}

export function getDevIngestionStatus() {
  return {
    lastIngest: devState.lastIngest,
    totalIngested: devState.ingestionCount,
    status: "OK",
  };
}

export function listDevBatches() {
  seedDevData();
  return devState.batches;
}

export function createDevBatch(source?: string) {
  seedDevData();
  const batch = {
    id: `BATCH-${Date.now()}`,
    source: source || "unknown",
    total_records: 0,
    inserted_records: 0,
    failed_records: 0,
    status: "IN_PROGRESS",
    started_at: nowIso(),
    finished_at: null,
  };
  devState.batches.unshift(batch);
  return batch;
}

export function getDevBatchById(id: string) {
  seedDevData();
  return devState.batches.find((b) => b.id === id) || null;
}

export function updateDevBatchCounts(id: string, total: number, inserted: number, failed: number) {
  seedDevData();
  const batch = devState.batches.find((b) => b.id === id);
  if (!batch) return null;
  batch.total_records += total;
  batch.inserted_records += inserted;
  batch.failed_records += failed;
  batch.status = failed > 0 ? "PARTIAL" : "COMPLETED";
  batch.finished_at = nowIso();
  return batch;
}
