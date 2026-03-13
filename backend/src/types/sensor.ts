// DTOs for SensorService (Dashboard)
// Maps to Figma Dashboard Sensor interface and related UI cards.

export interface SensorDTO {
  id: string; // sensors.sensor_code
  location: string; // devices.location_name
  lat: number; // devices.latitude
  lng: number; // devices.longitude
  aqi: number; // sensor_readings.aqi
  temperature: number; // sensor_readings.temperature_c
  humidity: number; // sensor_readings.humidity_pct
  waterLevel: number; // sensor_readings.water_level_cm (convert to meters if UI uses m)
  lastUpdate: string; // formatted recorded_at
  status: "online" | "offline"; // derived from device health
}

export interface SensorSummaryDTO {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  averageAqi: number;
  lastRefreshed: string;
}

