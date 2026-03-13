import { Request, Response, NextFunction } from "express";
import * as systemService from "./system.service";
import type { SystemStatusDTO } from "../../types/system";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /system/status
export async function getSystemStatus(req: Request, res: Response, next: NextFunction) {
  // Purpose: Overall status card and service list.
  try {
    const data = await systemService.getSystemStatus();
    const response: ApiResponse<SystemStatusDTO> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /system/metrics
export async function getSystemMetrics(req: Request, res: Response, next: NextFunction) {
  // Purpose: System-level metrics for charts.
  try {
    const data = await systemService.getSystemMetrics();
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /system/ingestion
export async function getIngestionStatus(req: Request, res: Response, next: NextFunction) {
  // Purpose: Track ingestion health and recent activity.
  try {
    const data = await systemService.getIngestionStatus();
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

