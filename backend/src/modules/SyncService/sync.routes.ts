import { Router } from "express";
import * as controller from "./sync.controller";

const router = Router();

router.post("/sync/batches", controller.createBatch);
router.get("/sync/batches", controller.listBatches);
router.get("/sync/batches/:id", controller.getBatchById);
router.post("/sync/batches/:id/ingest", controller.ingestBatch);

export default router;

