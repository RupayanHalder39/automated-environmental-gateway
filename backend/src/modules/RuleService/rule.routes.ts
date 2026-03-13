import { Router } from "express";
import * as controller from "./rule.controller";

const router = Router();

router.get("/rules", controller.listRules);
router.get("/rules/:id", controller.getRuleById);
router.post("/rules", controller.createRule);
router.patch("/rules/:id", controller.updateRule);
router.delete("/rules/:id", controller.deleteRule);

export default router;

