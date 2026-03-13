import request from "supertest";
import app from "../src/app";
import { db } from "../src/utils/db";

// Integration tests for SyncService

describe("SyncService", () => {
  const deviceCode = "TEST-GW-SYNC";
  const sensorCode = "TEST-SEN-SYNC";
  let batchId: string;

  beforeAll(async () => {
    const deviceResult = await db.query(
      `INSERT INTO devices (device_code, name, location_name, status, last_seen_at, created_at, updated_at)
       VALUES ($1, 'Sync Gateway', 'New Town', 'ACTIVE', NOW(), NOW(), NOW())
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

  it("POST /api/v1/sync/batches creates batch", async () => {
    const res = await request(app).post("/api/v1/sync/batches").send({ source: deviceCode });
    expect(res.status).toBe(201);
    batchId = res.body.data.id;
  });

  it("POST /api/v1/sync/batches/:id/ingest ingests readings", async () => {
    const res = await request(app)
      .post(`/api/v1/sync/batches/${batchId}/ingest`)
      .send({
        readings: [
          { sensorCode, recorded_at: new Date().toISOString(), aqi: 75 },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

