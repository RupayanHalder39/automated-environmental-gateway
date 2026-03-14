// SyncService: bulk ingestion workflow

import { db } from "../../utils/db";
import { DEV_MODE } from "../../config";
import {
  createDevBatch,
  getDevBatchById,
  listDevBatches,
  updateDevBatchCounts,
} from "../../services/devData";

export async function createBatch(payload: { source?: string }) {
  // DEV_MODE: create in-memory batch only.
  if (DEV_MODE) return createDevBatch(payload.source);

  // Creates a new bulk sync batch before ingestion starts.
  const result = await db.query(
    `INSERT INTO bulk_sync_batches (source, started_at, status, total_records, inserted_records, failed_records)
     VALUES ($1, NOW(), 'IN_PROGRESS', 0, 0, 0)
     RETURNING *`,
    [payload.source || "unknown"]
  );
  return result.rows[0];
}

export async function listBatches() {
  // DEV_MODE: return generated batch logs.
  if (DEV_MODE) return listDevBatches();

  const result = await db.query(
    `SELECT * FROM bulk_sync_batches ORDER BY started_at DESC LIMIT 200`
  );
  return result.rows;
}

export async function getBatchById(id: string) {
  // DEV_MODE: return generated batch by id.
  if (DEV_MODE) return getDevBatchById(id);

  const result = await db.query(
    `SELECT * FROM bulk_sync_batches WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function ingestBatch(id: string, payload: { readings?: any[] }) {
  // DEV_MODE: update in-memory batch stats only.
  if (DEV_MODE) {
    const readings = payload.readings || [];
    const inserted = readings.length;
    const failed = 0;
    updateDevBatchCounts(id, readings.length, inserted, failed);
    return { inserted, failed };
  }

  // Inserts readings and updates batch counters.
  const readings = payload.readings || [];
  if (readings.length === 0) {
    return { inserted: 0, failed: 0 };
  }

  let inserted = 0;
  let failed = 0;

  await db.query("BEGIN");
  try {
    for (const r of readings) {
      try {
        const sensorRes = await db.query(
          `SELECT id, device_id FROM sensors WHERE sensor_code = $1`,
          [r.sensorCode]
        );
        const sensorRow = sensorRes.rows[0];
        if (!sensorRow) {
          failed++;
          continue;
        }

        await db.query(
          `INSERT INTO sensor_readings
           (sensor_id, device_id, recorded_at, received_at, aqi, temperature_c, humidity_pct, water_level_cm, quality_flag, source)
           VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, 'OK', 'BULK_SYNC')
           ON CONFLICT (sensor_id, recorded_at) DO NOTHING`,
          [
            sensorRow.id,
            sensorRow.device_id,
            r.recorded_at || new Date().toISOString(),
            r.aqi || null,
            r.temperature || null,
            r.humidity || null,
            r.waterLevelCm || null,
          ]
        );
        inserted++;
      } catch {
        failed++;
      }
    }

    await db.query(
      `UPDATE bulk_sync_batches
       SET total_records = total_records + $2,
           inserted_records = inserted_records + $3,
           failed_records = failed_records + $4,
           status = CASE WHEN $4 > 0 THEN 'PARTIAL' ELSE 'COMPLETED' END,
           finished_at = NOW()
       WHERE id = $1`,
      [id, readings.length, inserted, failed]
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }

  return { inserted, failed };
}
