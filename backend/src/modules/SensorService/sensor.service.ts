// SensorService: business logic for dashboard sensor data
// This file exists to keep controllers thin and focused on HTTP concerns.

export async function listSensors() {
  // Should return SensorDTO[] with latest readings.
  // DB: sensors + devices + sensor_readings (latest per sensor)
  return null;
}

export async function getSensorById(id: string) {
  // Should return SensorDTO for a single sensor.
  // DB: sensors + devices
  return null;
}

export async function getSensorLatest(id: string) {
  // Should return latest metric values for a sensor.
  // DB: sensor_readings ordered by recorded_at desc
  return null;
}

export async function getLatestByType(type?: string) {
  // Should return city-level latest value for given metric type.
  // DB: sensor_readings filtered by sensor_type
  return null;
}

export async function getSensorSummary(range?: string) {
  // Should return SensorSummaryDTO for dashboard cards.
  // DB: sensor_readings with time window aggregation
  return null;
}

export async function getSensorHealth() {
  // Should return counts of online/offline sensors.
  // DB: sensors + devices.last_seen_at
  return null;
}

