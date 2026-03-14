import express, { Request, Response, NextFunction } from "express";

// Routers for each module (one-to-one with UI tabs)
import sensorRoutes from "./modules/SensorService/sensor.routes";
import deviceRoutes from "./modules/DeviceService/device.routes";
import historyRoutes from "./modules/HistoryService/history.routes";
import ruleRoutes from "./modules/RuleService/rule.routes";
import alertRoutes from "./modules/AlertService/alert.routes";
import anomalyRoutes from "./modules/AnomalyService/anomaly.routes";
import syncRoutes from "./modules/SyncService/sync.routes";
import apiKeyRoutes from "./modules/ApiKeyService/apiKey.routes";
import reportRoutes from "./modules/ReportService/report.routes";
import systemRoutes from "./modules/SystemService/system.routes";
import userRoutes from "./modules/UserService/user.routes";
import devRoutes from "./modules/DevService/dev.routes";

const app = express();

// ---- Core middleware ----
// Purpose: Parse JSON bodies so controllers can read req.body safely.
// Note: express.json is built-in; we avoid legacy body-parser dependency.
app.use(express.json({ limit: "2mb" }));

// Purpose: Basic request logging placeholder.
// Replace with structured logging (pino/winston) in production.
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Example: log method, path, and trace id (if present)
  // This keeps debugging and audit trails consistent.
  next();
});

// Purpose: Request tracing placeholder.
// In production, inject/propagate a trace ID for distributed tracing.
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Example: req.headers["x-request-id"] or generated UUID
  next();
});

// ---- Router mounting ----
// We mount under /api/v1 to keep versioning explicit and stable.
// Each router maps directly to a UI tab in the Figma design.

// Dashboard -> SensorService
app.use("/api/v1", sensorRoutes);

// Device Health -> DeviceService
app.use("/api/v1", deviceRoutes);

// Historical Data -> HistoryService
app.use("/api/v1", historyRoutes);

// Rules Engine -> RuleService
app.use("/api/v1", ruleRoutes);

// Alerts -> AlertService
app.use("/api/v1", alertRoutes);

// Data Sanity -> AnomalyService
app.use("/api/v1", anomalyRoutes);

// Bulk Data Sync -> SyncService
app.use("/api/v1", syncRoutes);

// Public API -> ApiKeyService
// Note: this router also serves /public/* endpoints for Figma alignment.
app.use("/api/v1", apiKeyRoutes);

// Reports -> ReportService
app.use("/api/v1", reportRoutes);

// System Status -> SystemService
app.use("/api/v1", systemRoutes);

// Settings -> UserService (optional)
app.use("/api/v1", userRoutes);

// Dev-only ingestion endpoint for synthetic data.
app.use("/api/v1", devRoutes);

// ---- 404 handler ----
// Purpose: Catch unhandled routes and return a consistent error envelope.
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// ---- Global error handler ----
// Purpose: Centralize error responses and avoid leaking internal details.
// This is structured last so any thrown errors bubble here.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // In production, log err to an error monitoring system.
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "Unexpected error",
    },
  });
});

export default app;
