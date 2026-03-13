import { Router } from "express";
import * as controller from "./apiKey.controller";

const router = Router();

router.get("/api-keys", controller.listApiKeys);
router.post("/api-keys", controller.createApiKey);
router.patch("/api-keys/:id/disable", controller.disableApiKey);
router.patch("/api-keys/:id/rotate", controller.rotateApiKey);

// Public API endpoints (aliases for Figma docs)
router.get("/public/aqi", controller.getPublicAqi);
router.get("/public/sensors", controller.getPublicSensors);
router.get("/public/historical", controller.getPublicHistorical);

export default router;

