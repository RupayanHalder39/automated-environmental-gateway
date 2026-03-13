import { Request, Response, NextFunction } from "express";
import * as reportService from "./report.service";
import type { ReportDTO } from "../../types/report";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /reports
export async function listReports(req: Request, res: Response, next: NextFunction) {
  // Purpose: List generated reports for Reports UI.
  try {
    const data = await reportService.listReports();
    const response: ApiResponse<ReportDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /reports/:id
export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await reportService.getReportById(id);
    const response: ApiResponse<ReportDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /reports
export async function createReport(req: Request, res: Response, next: NextFunction) {
  // Purpose: Trigger report generation.
  try {
    const data = await reportService.createReport(req.body);
    const response: ApiResponse<ReportDTO> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

