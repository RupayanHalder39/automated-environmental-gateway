export type SensorHealthStatus = "healthy" | "warning" | "fault";
export type SensorType = "AQI" | "Temperature" | "Humidity" | "Water Level";

export interface SensorAssetMetadata {
  firmware: string;
  lastCalibration: string;
  hardwareMetadata: Record<string, string> | string;
  typeDetails: {
    aqi?: {
      fan_rpm: number;
      laser_health_percent: number;
    };
    temperature?: {
      thermal_drift_rate: number;
      probe_type: "Internal" | "External";
    };
    humidity?: {
      heater_status: boolean;
      saturation_risk_level: "low" | "medium" | "high";
    };
    waterLevel?: {
      echo_quality_db: number;
      mounting_offset_mm: number;
    };
  };
}

export interface SensorDTO {
  id: string;
  location: string;
  locationId?: string;
  sensorType?: SensorType;
  lat: number;
  lng: number;
  aqi: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  lastUpdate: string;
  status: "online" | "offline" | "inactive";
  healthStatus?: SensorHealthStatus;
  metadata?: SensorAssetMetadata;
}

export interface SensorSummaryDTO {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  averageAqi: number;
  lastRefreshed: string;
}
