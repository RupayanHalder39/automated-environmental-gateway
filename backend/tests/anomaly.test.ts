import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for AnomalyService

describe("AnomalyService", () => {
  const deviceCode = "TEST-GW-ANOM";
  const sensorCode = "TEST-SEN-ANOM";

  beforeAll(async () => {
    const deviceResult = await db.query(
      `INSERT INTO devices (device_code, name, location_name, status, last_seen_at, created_at, updated_at)
       VALUES ($1, 'Anom Gateway', 'Sector V', 'ACTIVE', NOW(), NOW(), NOW())
       ON CONFLICT (device_code) DO UPDATE SET
         location_name = EXCLUDED.location_name,
         status = EXCLUDED.status,
         last_seen_at = EXCLUDED.last_seen_at,
         updated_at = NOW()
       RETURNING id`,
      [deviceCode]
    );
    const deviceId = deviceResult.rows[0].id;

    await db.query(
      `INSERT INTO sensors (device_id, sensor_code, sensor_type, unit, is_active, created_at, updated_at)
       VALUES ($1, $2, 'AQI', 'µg/m3', true, NOW(), NOW())
       ON CONFLICT (sensor_code) DO UPDATE SET
         device_id = EXCLUDED.device_id,
         updated_at = NOW()`,
      [deviceId, sensorCode]
    );
  });

  it("POST /api/v1/anomalies creates anomaly", async () => {
    const res = await request(app).post("/api/v1/anomalies").send({
      sensorId: sensorCode,
      anomalyType: "SPIKE",
      severity: "HIGH",
      invalidValue: "AQI: 850",
      expectedRange: "0 - 500",
      reason: "AQI exceeds sensor max",
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
  });

  it("GET /api/v1/anomalies returns list", async () => {
    const res = await request(app).get("/api/v1/anomalies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

