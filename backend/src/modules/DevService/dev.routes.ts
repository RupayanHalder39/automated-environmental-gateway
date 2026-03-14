import { Router } from "express";
import * as controller from "./dev.controller";

const router = Router();

// Dev-only ingestion endpoint for synthetic sensor readings.
router.post("/dev/ingest", controller.ingest);

export default router;
