// DTOs for SensorService (Dashboard)
// Maps to Figma Dashboard Sensor interface and related UI cards.

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
  id: string; // sensors.sensor_code
  location: string; // devices.location_name
  locationId?: string; // devices.location_id
  sensorType?: SensorType; // sensors.sensor_type
  lat: number; // devices.latitude
  lng: number; // devices.longitude
  aqi: number; // sensor_readings.aqi
  temperature: number; // sensor_readings.temperature_c
  humidity: number; // sensor_readings.humidity_pct
  waterLevel: number; // sensor_readings.water_level_cm (convert to meters if UI uses m)
  lastUpdate: string; // formatted recorded_at
  status: "online" | "offline" | "inactive"; // derived from device health
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
