import { Router } from "express";
import * as controller from "./user.controller";

const router = Router();

router.get("/users", controller.listUsers);
router.get("/users/:id", controller.getUserById);
router.post("/users", controller.createUser);
router.patch("/users/:id", controller.updateUser);
router.patch("/users/:id/disable", controller.disableUser);
router.patch("/settings/notifications", controller.updateNotificationSettings);
router.patch("/settings/system", controller.updateSystemSettings);

export default router;

