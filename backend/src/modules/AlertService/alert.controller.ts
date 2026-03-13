import { Request, Response } from "express";
import * as alertService from "./alert.service";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /alerts?status=active
export async function listAlerts(req: Request, res: Response) {
  // Purpose: List alerts for Alerts tab.
  const data = await alertService.listAlerts(req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /alerts/:id
export async function getAlertById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await alertService.getAlertById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /alerts/:id/acknowledge
export async function acknowledgeAlert(req: Request, res: Response) {
  const { id } = req.params;
  const data = await alertService.acknowledgeAlert(id);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /alerts/:id/resolve
export async function resolveAlert(req: Request, res: Response) {
  const { id } = req.params;
  const data = await alertService.resolveAlert(id);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /alerts/summary
export async function getAlertSummary(req: Request, res: Response) {
  // Purpose: Provide summary cards counts.
  const data = await alertService.getAlertSummary();
  res.status(501).json({ message: "Not implemented", data });
}
