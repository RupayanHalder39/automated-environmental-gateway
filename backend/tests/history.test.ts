import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for HistoryService

describe("HistoryService", () => {
  const deviceCode = "TEST-GW-001";
  const sensorCode = "TEST-SEN-001";

  beforeAll(async () => {
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

    await db.query(
      `INSERT INTO sensor_readings (sensor_id, device_id, recorded_at, received_at, aqi, quality_flag, source)
       VALUES ($1, $2, NOW() - INTERVAL '1 hour', NOW(), 70, 'OK', 'LIVE')`,
      [sensorId, deviceId]
    );
  });

  it("GET /api/v1/history/readings returns readings with pagination", async () => {
    const from = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();
    const res = await request(app)
      .get("/api/v1/history/readings")
      .query({ sensor_id: sensorCode, from, to });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.page).toBeDefined();
  });

  it("GET /api/v1/history/aggregate returns chart data", async () => {
    const from = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();
    const res = await request(app)
      .get("/api/v1/history/aggregate")
      .query({ metric: "aqi", from, to, interval: "1h" });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

