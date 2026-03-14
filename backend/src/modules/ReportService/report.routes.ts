import { Router } from "express";
import * as controller from "./report.controller";

const router = Router();

router.get("/reports", controller.listReports);
router.get("/reports/:id", controller.getReportById);
router.get("/reports/:id/download", controller.downloadReportPdf);
router.post("/reports", controller.createReport);
router.delete("/reports/:id", controller.deleteReport);

export default router;
