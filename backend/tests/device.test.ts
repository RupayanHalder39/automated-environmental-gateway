import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for DeviceService

describe("DeviceService", () => {
  const deviceCode = "TEST-GW-001";

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

    await db.query(
      `INSERT INTO device_heartbeats (device_id, heartbeat_at, status, signal_strength, battery_pct)
       VALUES ($1, NOW(), 'OK', 90, 95)`,
      [deviceId]
    );
  });

  it("GET /api/v1/devices returns device list", async () => {
    const res = await request(app).get("/api/v1/devices");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/devices/:id returns device detail", async () => {
    const res = await request(app).get(`/api/v1/devices/${deviceCode}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

