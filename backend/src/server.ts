import app from "./app";
import { PORT } from "./config";
import { db, testConnection } from "./utils/db";

// Purpose: central bootstrap for the backend server.
// This is where environment config, DB connectivity, and the HTTP server come together.
// Note: logging, request tracing, and global error handling are configured in app.ts
// so they apply uniformly to every module route.

async function startServer() {
  try {
    // Verify DB connection early so we fail fast if config is invalid.
    const dbCheck = await testConnection();
    // Plain-language log: confirms DB is reachable.
    console.log("Database connection established at:", dbCheck.now);

    // Purpose: Start the HTTP server after DB is ready.
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
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

// Export shared pool for services to reuse when DB logic is implemented.
export { db };
