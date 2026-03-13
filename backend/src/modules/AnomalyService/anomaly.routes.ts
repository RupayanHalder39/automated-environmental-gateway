import { Router } from "express";
import * as controller from "./anomaly.controller";

const router = Router();

router.get("/anomalies", controller.listAnomalies);
router.get("/anomalies/summary", controller.getAnomalySummary);
router.get("/anomalies/:id", controller.getAnomalyById);
router.get("/anomalies/by-sensor/:sensor_id", controller.getAnomaliesBySensor);
router.patch("/anomalies/settings", controller.updateAnomalySettings);

export default router;

