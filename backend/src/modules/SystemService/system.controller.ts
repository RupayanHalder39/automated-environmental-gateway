import { Request, Response } from "express";
import * as systemService from "./system.service";
import type { SystemServiceDTO, SystemStatusDTO } from "../../types/system";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /system/status
export async function getSystemStatus(req: Request, res: Response) {
  // Purpose: Overall status card and service list.
  const data = await systemService.getSystemStatus();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /system/metrics
export async function getSystemMetrics(req: Request, res: Response) {
  // Purpose: System-level metrics for charts.
  const data = await systemService.getSystemMetrics();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /system/ingestion
export async function getIngestionStatus(req: Request, res: Response) {
  // Purpose: Track ingestion health and recent activity.
  const data = await systemService.getIngestionStatus();
  res.status(501).json({ message: "Not implemented", data });
}
