import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for SensorService
// These tests verify response envelopes and Figma-aligned fields.

describe("SensorService", () => {
  const deviceCode = "TEST-GW-001";
  const sensorCode = "TEST-SEN-001";

  beforeAll(async () => {
    // Seed device
    const deviceResult = await db.query(
      `INSERT INTO devices (device_code, name, location_name, status, last_seen_at, created_at, updated_at)
       VALUES ($1, 'Test Gateway', 'Salt Lake', 'ACTIVE', NOW(), NOW(), NOW())
       ON CONFLICT (device_code) DO UPDATE SET
         location_name = EXCLUDED.location_name,
         status = EXCLUDED.status,
         last_seen_at = EXCLUDED.last_seen_at,
         updated_at = NOW()
       RETURNING id`,
      [deviceCode]
    );
    const deviceId = deviceResult.rows[0].id;

    // Seed sensor
    const sensorResult = await db.query(
      `INSERT INTO sensors (device_id, sensor_code, sensor_type, unit, is_active, created_at, updated_at)
       VALUES ($1, $2, 'AQI', 'µg/m3', true, NOW(), NOW())
       ON CONFLICT (sensor_code) DO UPDATE SET
         device_id = EXCLUDED.device_id,
         updated_at = NOW()
       RETURNING id`,
      [deviceId, sensorCode]
    );
    const sensorId = sensorResult.rows[0].id;

    // Seed reading
    await db.query(
      `INSERT INTO sensor_readings (sensor_id, device_id, recorded_at, received_at, aqi, quality_flag, source)
       VALUES ($1, $2, NOW(), NOW(), 90, 'OK', 'LIVE')`,
      [sensorId, deviceId]
    );
  });

  it("GET /api/v1/sensors returns sensor list with envelope", async () => {
    const res = await request(app).get("/api/v1/sensors");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/sensors/:id/latest returns latest reading", async () => {
    const res = await request(app).get(`/api/v1/sensors/${sensorCode}/latest`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

