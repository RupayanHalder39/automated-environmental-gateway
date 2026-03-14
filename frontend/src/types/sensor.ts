export interface SensorDTO {
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

export interface SensorSummaryDTO {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  averageAqi: number;
  lastRefreshed: string;
}

