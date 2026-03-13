import { Router } from "express";
import * as controller from "./system.controller";

const router = Router();

router.get("/system/status", controller.getSystemStatus);
router.get("/system/metrics", controller.getSystemMetrics);
router.get("/system/ingestion", controller.getIngestionStatus);

export default router;

