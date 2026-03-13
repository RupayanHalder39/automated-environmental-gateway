import { Request, Response } from "express";
import * as anomalyService from "./anomaly.service";
import type { AnomalyDTO, AnomalySummaryDTO } from "../../types/anomaly";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /anomalies?range=24h
export async function listAnomalies(req: Request, res: Response) {
  // Purpose: Provide anomalies list for Data Sanity tab.
  const data = await anomalyService.listAnomalies(req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /anomalies/:id
export async function getAnomalyById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await anomalyService.getAnomalyById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /anomalies/summary
export async function getAnomalySummary(req: Request, res: Response) {
  const data = await anomalyService.getAnomalySummary();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /anomalies/by-sensor/:sensor_id
export async function getAnomaliesBySensor(req: Request, res: Response) {
  const { sensor_id } = req.params;
  const data = await anomalyService.getAnomaliesBySensor(sensor_id);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /anomalies/settings
export async function updateAnomalySettings(req: Request, res: Response) {
  // Purpose: Toggle anomaly filter and auto-reject settings.
  const data = await anomalyService.updateAnomalySettings(req.body);
  res.status(501).json({ message: "Not implemented", data });
}
