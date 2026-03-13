import { Router } from "express";
import * as controller from "./device.controller";

const router = Router();

router.get("/devices", controller.listDevices);
router.get("/devices/health/summary", controller.getDeviceHealthSummary);
router.get("/devices/:id", controller.getDeviceById);
router.get("/devices/:id/heartbeats", controller.getDeviceHeartbeats);
router.patch("/devices/:id/status", controller.updateDeviceStatus);

export default router;

