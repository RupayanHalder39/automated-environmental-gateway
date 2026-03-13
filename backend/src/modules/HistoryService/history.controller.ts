import { Request, Response, NextFunction } from "express";
import * as historyService from "./history.service";
import type { HistoryPointDTO } from "../../types/history";
import type { ApiResponse, PaginatedResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /history/readings?sensor_id=...&from=...&to=...
export async function getHistoryReadings(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide raw time-series for detailed views or exports.
  try {
    const { sensor_id, from, to } = req.query as any;
    if (!sensor_id || !from || !to) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "sensor_id, from, to are required" } });
    }

    const result = await historyService.getHistoryReadings(req.query);
    const response: PaginatedResponse<any[]> = {
      data: result.rows,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /history/aggregate?metric=...&from=...&to=...&interval=1h&location=...
export async function getHistoryAggregate(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide aggregated chart data for Historical Data tab.
  try {
    const data = await historyService.getHistoryAggregate(req.query);
    const response: ApiResponse<HistoryPointDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /history/devices/:id/aggregate?from=...&to=...
export async function getDeviceAggregate(req: Request, res: Response, next: NextFunction) {
  // Purpose: Device-specific historical aggregation.
  try {
    const { id } = req.params;
    const data = await historyService.getDeviceAggregate(id, req.query);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /history/export?metric=...&from=...&to=...&location=...
export async function exportHistory(req: Request, res: Response, next: NextFunction) {
  // Purpose: Export historical data; may be async for large ranges.
  try {
    const data = await historyService.exportHistory(req.query);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

