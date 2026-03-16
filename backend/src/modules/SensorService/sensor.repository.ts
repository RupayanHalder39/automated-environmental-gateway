// backend/src/modules/SensorService/sensor.repository.ts
import { db } from "../../utils/db";
import type {
  SensorDTO,
  SensorSummaryDTO,
  SensorType,
  SensorHealthStatus,
} from "../../types/sensor";

// --- Types ---

type SensorQueryRow = {
  sensor_code: string;
  location_name: string;
  location_id: string | null;
  sensor_type: string | null;
  latitude: number | null;
  longitude: number | null;
  device_status: string;
  recorded_at: string | null;
  aqi: number | null;
  temperature_c: number | null;
  humidity_pct: number | null;
  water_level_cm: number | null;
};

// --- Mappers ---

function cmToMeters(value: number | null): number | null {
  if (value === null || value === undefined) return null;
  return Number((value / 100).toFixed(2));
}

function deriveHealthStatus(
  sensorType: SensorType | undefined,
  row: SensorQueryRow,
): SensorHealthStatus {
  if (sensorType === "Temperature") {
    const temp = row.temperature_c ?? 0;
    if (temp > 35) return "fault";
    if (temp > 30) return "warning";
    return "healthy";
  }
  if (sensorType === "Humidity") {
    const humidity = row.humidity_pct ?? 0;
    if (humidity > 85) return "fault";
    if (humidity > 70) return "warning";
    return "healthy";
  }
  if (sensorType === "Water Level") {
    const waterLevel = row.water_level_cm ?? 0;
    if (waterLevel > 300) return "fault";
    if (waterLevel > 200) return "warning";
    return "healthy";
  }
  const aqi = row.aqi ?? 0;
  if (aqi > 150) return "fault";
  if (aqi > 100) return "warning";
  return "healthy";
}

function rowToSensorDTO(row: SensorQueryRow): SensorDTO {
  return {
    id: row.sensor_code,
    location: row.location_name,
    locationId: row.location_id ?? undefined,
    sensorType: (row.sensor_type as SensorType | null) ?? undefined,
    lat: Number(row.latitude ?? 0),
    lng: Number(row.longitude ?? 0),
    aqi: row.aqi ?? 0,
    temperature: row.temperature_c ?? 0,
    humidity: row.humidity_pct ?? 0,
    waterLevel: cmToMeters(row.water_level_cm) ?? 0,
    lastUpdate: row.recorded_at ? new Date(row.recorded_at).toISOString() : "",
    status:
      row.device_status === "ACTIVE"
        ? "online"
        : row.device_status === "INACTIVE"
          ? "inactive"
          : "offline",
    healthStatus: deriveHealthStatus(row.sensor_type as SensorType | undefined, row),
  };
}


// --- Repository ---

export async function findSensors(includeInactive: boolean): Promise<SensorDTO[]> {
  const result = await db.query(
    `SELECT DISTINCT ON (s.id)
      s.sensor_code, d.location_name, d.location_id, s.sensor_type, d.latitude, d.longitude,
      d.status AS device_status, sr.recorded_at, sr.aqi, sr.temperature_c, sr.humidity_pct, sr.water_level_cm
     FROM sensors s
     JOIN devices d ON d.id = s.device_id
     LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id
     WHERE ($1::boolean IS TRUE OR d.status <> 'INACTIVE')
     ORDER BY s.id, sr.recorded_at DESC`,
    [includeInactive]
  );
  return result.rows.map(rowToSensorDTO);
}

export async function findSensorById(id: string): Promise<SensorDTO | null> {
    const result = await db.query(
        `SELECT DISTINCT ON (s.id)
          s.sensor_code, d.location_name, d.location_id, s.sensor_type, d.latitude, d.longitude,
          d.status AS device_status, sr.recorded_at, sr.aqi, sr.temperature_c, sr.humidity_pct, sr.water_level_cm
         FROM sensors s
         JOIN devices d ON d.id = s.device_id
         LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id
         WHERE s.sensor_code = $1
         ORDER BY s.id, sr.recorded_at DESC`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return rowToSensorDTO(result.rows[0]);
}

export async function getLatestReading(id: string): Promise<any> {
    const result = await db.query(
        `SELECT recorded_at, aqi, temperature_c, humidity_pct, water_level_cm
         FROM sensor_readings
         WHERE sensor_id = (SELECT id FROM sensors WHERE sensor_code = $1)
         ORDER BY recorded_at DESC
         LIMIT 1`,
        [id]
      );
      return result.rows[0] ?? null;
}

export async function getLatestReadingByType(type: string): Promise<any> {
    const column =
    type === "temperature"
      ? "temperature_c"
      : type === "humidity"
        ? "humidity_pct"
        : type === "waterLevel"
          ? "water_level_cm"
          : "aqi";

    const result = await db.query(
        `SELECT ${column} AS value, recorded_at
         FROM sensor_readings
         WHERE ${column} IS NOT NULL
         ORDER BY recorded_at DESC
         LIMIT 1`
    );
    return result.rows[0] ?? null;
}

export async function getSummary(range: string): Promise<SensorSummaryDTO> {
    const interval = range.endsWith("h") || range.endsWith("m") ? range : "15m";

    const [summaryResult, countsResult] = await Promise.all([
        db.query(
            `SELECT
               COUNT(DISTINCT s.id) AS total_sensors,
               AVG(sr.aqi) AS avg_aqi
             FROM sensors s
             LEFT JOIN sensor_readings sr
               ON sr.sensor_id = s.id AND sr.recorded_at > NOW() - $1::interval`,
            [interval]
        ),
        db.query(
            `SELECT
               SUM(CASE WHEN d.status = 'ACTIVE' THEN 1 ELSE 0 END) AS online,
               SUM(CASE WHEN d.status <> 'INACTIVE' THEN 1 ELSE 0 END) AS active_total,
               SUM(CASE WHEN d.status <> 'ACTIVE' AND d.status <> 'INACTIVE' THEN 1 ELSE 0 END) AS offline
             FROM sensors s
             JOIN devices d ON d.id = s.device_id`
        )
    ]);

    return {
        totalSensors: Number(countsResult.rows[0]?.active_total || 0),
        onlineSensors: Number(countsResult.rows[0]?.online || 0),
        offlineSensors: Number(countsResult.rows[0]?.offline || 0),
        averageAqi: Number(summaryResult.rows[0]?.avg_aqi || 0),
        lastRefreshed: new Date().toISOString(),
    };
}

export async function getHealth(): Promise<{ online: number; offline: number }> {
    const result = await db.query(
        `SELECT
           SUM(CASE WHEN d.status = 'ACTIVE' THEN 1 ELSE 0 END) AS online,
           SUM(CASE WHEN d.status <> 'ACTIVE' AND d.status <> 'INACTIVE' THEN 1 ELSE 0 END) AS offline
         FROM sensors s
         JOIN devices d ON d.id = s.device_id`
    );
    return {
        online: Number(result.rows[0]?.online || 0),
        offline: Number(result.rows[0]?.offline || 0),
    };
}
// Note: create, update, and delete operations would also go here.
// For brevity in this example, they are left in the service but should be moved here.
