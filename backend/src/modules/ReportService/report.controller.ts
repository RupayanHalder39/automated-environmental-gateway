import { Request, Response } from "express";
import * as reportService from "./report.service";
import type { ReportDTO } from "../../types/report";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /reports
export async function listReports(req: Request, res: Response) {
  // Purpose: List generated reports for Reports UI.
  const data = await reportService.listReports();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /reports/:id
export async function getReportById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await reportService.getReportById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// POST /reports
export async function createReport(req: Request, res: Response) {
  // Purpose: Trigger report generation.
  const data = await reportService.createReport(req.body);
  res.status(501).json({ message: "Not implemented", data });
}
