import { Request, Response } from "express";
import * as syncService from "./sync.service";
import type { SyncBatchDTO } from "../../types/sync";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// POST /sync/batches
export async function createBatch(req: Request, res: Response) {
  // Purpose: Create a new bulk sync batch before ingesting data.
  const data = await syncService.createBatch(req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /sync/batches
export async function listBatches(req: Request, res: Response) {
  // Purpose: List recent bulk sync batches for monitoring UI.
  const data = await syncService.listBatches();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /sync/batches/:id
export async function getBatchById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await syncService.getBatchById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// POST /sync/batches/:id/ingest
export async function ingestBatch(req: Request, res: Response) {
  // Purpose: Accept bulk readings and insert into sensor_readings.
  const { id } = req.params;
  const data = await syncService.ingestBatch(id, req.body);
  res.status(501).json({ message: "Not implemented", data });
}
