import "dotenv/config";
import { Pool } from "pg";
import app from "./app";

// Purpose: central bootstrap for the backend server.
// This is where environment config, DB connectivity, and the HTTP server come together.
// Note: logging, request tracing, and global error handling are configured in app.ts
// so they apply uniformly to every module route.

// ---- PostgreSQL connection ----
// We use a connection pool for scalability under concurrent requests.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyDatabaseConnection() {
  // Purpose: fail fast if DB is unreachable.
  // This simple query confirms the connection and avoids silent runtime errors later.
  const result = await pool.query("SELECT NOW() AS now");
  return result.rows[0];
}

async function startServer() {
  try {
    const dbCheck = await verifyDatabaseConnection();
    // Plain-language log: confirms DB is reachable.
    console.log("Database connection established at:", dbCheck.now);

    // Purpose: Start the HTTP server after DB is ready.
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  } catch (err) {
    // If DB connection fails, exit immediately so orchestration can restart.
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
}

// ---- Notes for future implementation ----
// Each module will use the following tables:
// SensorService -> sensors, devices, sensor_readings
// DeviceService -> devices, device_heartbeats
// HistoryService -> sensor_readings, alerts, devices
// RuleService -> alert_rules
// AlertService -> alerts, alert_rules, devices, sensors
// AnomalyService -> anomaly_logs, sensors, devices
// SyncService -> bulk_sync_batches, sensor_readings
// ApiKeyService -> api_keys
// ReportService -> reports, sensor_readings, alerts
// SystemService -> devices, sensor_readings, bulk_sync_batches (plus system metrics)
// UserService -> users, user_settings (future extension)

startServer();

// Export pool for services to reuse when DB logic is implemented.
export { pool };
