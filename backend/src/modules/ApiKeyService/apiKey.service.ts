// ApiKeyService: key management and public endpoints

import { db } from "../../utils/db";
import { keyHasher, generateApiKey } from "../../utils/keyHasher";
import type { ApiKeyDTO } from "../../types/apiKey";

export async function listApiKeys(): Promise<ApiKeyDTO[]> {
  const result = await db.query(
    `SELECT id, name, created_at, last_used_at
     FROM api_keys
     WHERE is_active = true
     ORDER BY created_at DESC`
  );

  return (result.rows as any[]).map((row: any) => ({
    id: row.id,
    name: row.name,
    created: row.created_at ? new Date(row.created_at).toISOString() : "",
    lastUsed: row.last_used_at ? new Date(row.last_used_at).toISOString() : "",
    requests: 0,
  }));
}

export async function createApiKey(payload: { name?: string; scopes?: string[] }) {
  const rawKey = generateApiKey();
  const hash = keyHasher(rawKey);
  const result = await db.query(
    `INSERT INTO api_keys (name, key_hash, scopes, is_active, created_at)
     VALUES ($1, $2, $3, true, NOW())
     RETURNING id, name, created_at`,
    [payload.name || "API Key", hash, payload.scopes || ["read:sensors"]]
  );

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    key: rawKey,
    created: new Date(result.rows[0].created_at).toISOString(),
    lastUsed: "",
    requests: 0,
  } as ApiKeyDTO;
}

export async function disableApiKey(id: string) {
  const result = await db.query(
    `UPDATE api_keys SET is_active = false WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function rotateApiKey(id: string) {
  const rawKey = generateApiKey();
  const hash = keyHasher(rawKey);
  const result = await db.query(
    `UPDATE api_keys SET key_hash = $2, last_used_at = NULL WHERE id = $1 RETURNING id, name, created_at`,
    [id, hash]
  );

  if (!result.rows.length) return null;
  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    key: rawKey,
    created: new Date(result.rows[0].created_at).toISOString(),
    lastUsed: "",
    requests: 0,
  } as ApiKeyDTO;
}

export async function getPublicAqi(query: any) {
  // Return latest AQI for a location.
  const { location } = query;
  const result = await db.query(
    `SELECT sr.aqi, sr.recorded_at, d.location_name
     FROM sensor_readings sr
     JOIN devices d ON d.id = sr.device_id
     WHERE d.location_name = $1
     ORDER BY sr.recorded_at DESC
     LIMIT 1`,
    [location]
  );
  return result.rows[0] ?? null;
}

export async function getPublicSensors() {
  const result = await db.query(
    `SELECT s.sensor_code, d.location_name, d.latitude, d.longitude
     FROM sensors s
     JOIN devices d ON d.id = s.device_id
     WHERE s.is_active = true`
  );
  return result.rows;
}

export async function getPublicHistorical(query: any) {
  const { metric = "temperature", days = 7 } = query;
  const column = metric === "humidity" ? "humidity_pct" : metric === "waterLevel" ? "water_level_cm" : metric === "temperature" ? "temperature_c" : "aqi";
  const result = await db.query(
    `SELECT recorded_at, ${column} AS value
     FROM sensor_readings
     WHERE recorded_at > NOW() - ($1 || ' days')::interval
     ORDER BY recorded_at DESC`,
    [Number(days)]
  );
  return result.rows;
}
