export interface DeviceDTO {
  id: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  lastHeartbeat: string;
  signalStrength: number;
  batteryLevel: number;
  maintenance: boolean;
}

export interface DeviceHealthSummaryDTO {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  maintenanceCount: number;
}

