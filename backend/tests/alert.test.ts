import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for AlertService

describe("AlertService", () => {
  const deviceCode = "TEST-GW-ALERT";
  const sensorCode = "TEST-SEN-ALERT";

  beforeAll(async () => {
    const deviceResult = await db.query(
      `INSERT INTO devices (device_code, name, location_name, status, last_seen_at, created_at, updated_at)
       VALUES ($1, 'Alert Gateway', 'Park Street', 'ACTIVE', NOW(), NOW(), NOW())
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

    await request(app).post("/api/v1/rules").send({
      name: "AQI Trigger",
      metric: "AQI",
      operator: ">",
      threshold: 50,
      location: "Park Street",
      action: "Trigger Warning",
    });
  });

  it("POST /api/v1/alerts/trigger creates alerts", async () => {
    const res = await request(app).post("/api/v1/alerts/trigger").send({
      sensorCode,
      deviceCode,
      metric: "AQI",
      value: 90,
    });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/alerts returns alerts list", async () => {
    const res = await request(app).get("/api/v1/alerts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

