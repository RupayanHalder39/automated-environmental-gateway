// DTOs for DeviceService (Device Health)
// Maps to Figma DeviceHealth Device interface.

export interface DeviceDTO {
  id: string; // devices.device_code
  location: string; // devices.location_name
  status: "online" | "offline" | "maintenance";
  lastHeartbeat: string; // latest device_heartbeats.heartbeat_at
  signalStrength: number; // device_heartbeats.signal_strength
  batteryLevel: number; // device_heartbeats.battery_pct
  maintenance: boolean; // derived flag
}

export interface DeviceHealthSummaryDTO {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  maintenanceCount: number;
}

