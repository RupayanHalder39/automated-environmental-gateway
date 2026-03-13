import { Request, Response, NextFunction } from "express";
import * as anomalyService from "./anomaly.service";
import type { AnomalyDTO, AnomalySummaryDTO } from "../../types/anomaly";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /anomalies?range=24h
export async function listAnomalies(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide anomalies list for Data Sanity tab.
  try {
    const data = await anomalyService.listAnomalies(req.query);
    const response: ApiResponse<AnomalyDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /anomalies/:id
export async function getAnomalyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await anomalyService.getAnomalyById(id);
    const response: ApiResponse<AnomalyDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /anomalies/summary
export async function getAnomalySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await anomalyService.getAnomalySummary();
    const response: ApiResponse<AnomalySummaryDTO> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /anomalies/by-sensor/:sensor_id
export async function getAnomaliesBySensor(req: Request, res: Response, next: NextFunction) {
  try {
    const { sensor_id } = req.params;
    const data = await anomalyService.getAnomaliesBySensor(sensor_id);
    const response: ApiResponse<AnomalyDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /anomalies
export async function createAnomaly(req: Request, res: Response, next: NextFunction) {
  // Purpose: Log a new anomaly detected by validation rules.
  try {
    const data = await anomalyService.createAnomaly(req.body);
    const response: ApiResponse<AnomalyDTO> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /anomalies/settings
export async function updateAnomalySettings(req: Request, res: Response, next: NextFunction) {
  // Purpose: Toggle anomaly filter and auto-reject settings.
  try {
    const data = await anomalyService.updateAnomalySettings(req.body);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

