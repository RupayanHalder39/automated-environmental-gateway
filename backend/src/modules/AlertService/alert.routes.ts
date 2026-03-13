import { Router } from "express";
import * as controller from "./alert.controller";

const router = Router();

router.get("/alerts", controller.listAlerts);
router.get("/alerts/summary", controller.getAlertSummary);
router.get("/alerts/:id", controller.getAlertById);
router.patch("/alerts/:id/acknowledge", controller.acknowledgeAlert);
router.patch("/alerts/:id/resolve", controller.resolveAlert);
router.post("/alerts/trigger", controller.triggerAlerts);

export default router;

