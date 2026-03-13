import { Router } from "express";
import * as controller from "./report.controller";

const router = Router();

router.get("/reports", controller.listReports);
router.get("/reports/:id", controller.getReportById);
router.post("/reports", controller.createReport);

export default router;

