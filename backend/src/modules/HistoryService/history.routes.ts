import { Router } from "express";
import * as controller from "./history.controller";

const router = Router();

router.get("/history/readings", controller.getHistoryReadings);
router.get("/history/aggregate", controller.getHistoryAggregate);
router.get("/history/devices/:id/aggregate", controller.getDeviceAggregate);
router.get("/history/export", controller.exportHistory);

export default router;

