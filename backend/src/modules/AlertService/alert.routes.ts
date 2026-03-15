// backend/src/modules/AlertService/alert.routes.ts
import { Router } from "express";
import * as controller from "./alert.controller";
import * as validator from "./alert.validators";
import { isAuthenticated, hasRole } from "../../middleware/auth";

const router = Router();

// All alert routes require a user to be authenticated.
router.use("/alerts", isAuthenticated);

// --- Routes ---

router.get(
    "/alerts",
    validator.validateListAlerts,
    controller.listAlerts
);

router.get(
    "/alerts/summary",
    controller.getAlertSummary
);

router.get(
    "/alerts/:id",
    validator.validateIdParam,
    controller.getAlertById
);

router.patch(
    "/alerts/:id/acknowledge",
    hasRole(["admin", "manager"]), // Example: only admins or managers can acknowledge
    validator.validateIdParam,
    controller.acknowledgeAlert
);

router.patch(
    "/alerts/:id/resolve",
    hasRole(["admin", "manager"]), // Example: only admins or managers can resolve
    validator.validateIdParam,
    controller.resolveAlert
);

// This is an internal/dev endpoint, but should still be protected.
router.post(
    "/alerts/trigger",
    hasRole(["admin"]), // Example: only admins can trigger alerts manually
    validator.validateTriggerPayload,
    controller.triggerAlerts
);

export default router;

