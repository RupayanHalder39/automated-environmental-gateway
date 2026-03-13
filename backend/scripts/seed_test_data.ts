import { db } from "../src/utils/db";

// Purpose: Minimal seed data for local testing.
// Inserts a device, sensor, and sample alert so UI can display real data.

async function seed() {
  // Insert a device
  const deviceResult = await db.query(
    `INSERT INTO devices (device_code, name, location_name, status, created_at, updated_at)
     VALUES ('GW-001', 'Seed Gateway', 'Salt Lake', 'ACTIVE', NOW(), NOW())
     RETURNING id`
  );
  const deviceId = deviceResult.rows[0].id;

  // Insert a sensor
  const sensorResult = await db.query(
    `INSERT INTO sensors (device_id, sensor_code, sensor_type, unit, is_active, created_at, updated_at)
     VALUES ($1, 'SEN-001', 'AQI', 'µg/m3', true, NOW(), NOW())
     RETURNING id`,
    [deviceId]
  );
  const sensorId = sensorResult.rows[0].id;

  // Insert a reading
  await db.query(
    `INSERT INTO sensor_readings (sensor_id, device_id, recorded_at, received_at, aqi, quality_flag, source)
     VALUES ($1, $2, NOW(), NOW(), 85, 'OK', 'LIVE')`,
    [sensorId, deviceId]
  );

  // Insert an alert
  await db.query(
    `INSERT INTO alerts (sensor_id, device_id, triggered_at, status, severity, message)
     VALUES ($1, $2, NOW(), 'OPEN', 'MEDIUM', 'Seed alert for testing')`,
    [sensorId, deviceId]
  );

  console.log("Seed data inserted.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

