import { Request, Response, NextFunction } from "express";
import * as syncService from "./sync.service";
import type { SyncBatchDTO } from "../../types/sync";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// POST /sync/batches
export async function createBatch(req: Request, res: Response, next: NextFunction) {
  // Purpose: Create a new bulk sync batch before ingesting data.
  try {
    const data = await syncService.createBatch(req.body);
    const response: ApiResponse<typeof data> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sync/batches
export async function listBatches(req: Request, res: Response, next: NextFunction) {
  // Purpose: List recent bulk sync batches for monitoring UI.
  try {
    const data = await syncService.listBatches();
    const response: ApiResponse<SyncBatchDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sync/batches/:id
export async function getBatchById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await syncService.getBatchById(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /sync/batches/:id/ingest
export async function ingestBatch(req: Request, res: Response, next: NextFunction) {
  // Purpose: Accept bulk readings and insert into sensor_readings.
  try {
    const { id } = req.params;
    const data = await syncService.ingestBatch(id, req.body);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

