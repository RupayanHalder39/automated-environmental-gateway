import { Request, Response, NextFunction } from "express";
import * as alertService from "./alert.service";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /alerts?status=active
export async function listAlerts(req: Request, res: Response, next: NextFunction) {
  // Purpose: List alerts for Alerts tab.
  try {
    const data = await alertService.listAlerts(req.query);
    const response: ApiResponse<AlertDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /alerts/:id
export async function getAlertById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await alertService.getAlertById(id);
    const response: ApiResponse<AlertDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /alerts/:id/acknowledge
export async function acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await alertService.acknowledgeAlert(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /alerts/:id/resolve
export async function resolveAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await alertService.resolveAlert(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /alerts/summary
export async function getAlertSummary(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide summary cards counts.
  try {
    const data = await alertService.getAlertSummary();
    const response: ApiResponse<AlertSummaryDTO> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /alerts/trigger
export async function triggerAlerts(req: Request, res: Response, next: NextFunction) {
  // Purpose: Trigger alerts for a new reading when rules are met.
  // This mirrors real-time ingestion behavior for the AlertService.
  try {
    const data = await alertService.triggerAlertsForReading(req.body);
    const response: ApiResponse<typeof data> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

