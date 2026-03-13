import { Request, Response } from "express";
import * as historyService from "./history.service";
import type { HistoryPointDTO, HistorySummaryDTO } from "../../types/history";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /history/readings?sensor_id=...&from=...&to=...
export async function getHistoryReadings(req: Request, res: Response) {
  // Purpose: Provide raw time-series for detailed views or exports.
  const data = await historyService.getHistoryReadings(req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /history/aggregate?metric=...&from=...&to=...&interval=1h&location=...
export async function getHistoryAggregate(req: Request, res: Response) {
  // Purpose: Provide aggregated chart data for Historical Data tab.
  const data = await historyService.getHistoryAggregate(req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /history/devices/:id/aggregate?from=...&to=...
export async function getDeviceAggregate(req: Request, res: Response) {
  // Purpose: Device-specific historical aggregation.
  const { id } = req.params;
  const data = await historyService.getDeviceAggregate(id, req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /history/export?metric=...&from=...&to=...&location=...
export async function exportHistory(req: Request, res: Response) {
  // Purpose: Export historical data; may be async for large ranges.
  const data = await historyService.exportHistory(req.query);
  res.status(501).json({ message: "Not implemented", data });
}
