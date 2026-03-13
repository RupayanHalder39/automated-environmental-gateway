import { Router } from "express";
import * as controller from "./sensor.controller";

// Routes for Dashboard (Real-Time Sensor Dashboard)
const router = Router();

router.get("/sensors", controller.listSensors);
router.get("/sensors/summary", controller.getSensorSummary);
router.get("/sensors/health", controller.getSensorHealth);
router.get("/sensors/latest", controller.getLatestByType);
router.get("/sensors/:id", controller.getSensorById);
router.get("/sensors/:id/latest", controller.getSensorLatest);

export default router;

