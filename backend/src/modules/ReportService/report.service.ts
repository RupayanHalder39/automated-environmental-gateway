// ReportService: report generation and retrieval

import { db } from "../../utils/db";
import type { ReportDTO } from "../../types/report";

export async function listReports(): Promise<ReportDTO[]> {
  const result = await db.query(
    `SELECT id, name, report_type, generated_at, meta_json
     FROM reports
     ORDER BY generated_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.report_type,
    zone: row.meta_json?.zone || "All Zones",
    dateRange: row.meta_json?.dateRange || "",
    generated: row.generated_at ? new Date(row.generated_at).toISOString() : "",
    avgAqi: Number(row.meta_json?.avgAqi || 0),
    highestPollution: row.meta_json?.highestPollution || "",
    waterAlerts: Number(row.meta_json?.waterAlerts || 0),
  }));
}

export async function getReportById(id: string): Promise<ReportDTO | null> {
  const result = await db.query(
    `SELECT id, name, report_type, generated_at, meta_json
     FROM reports
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.report_type,
    zone: row.meta_json?.zone || "All Zones",
    dateRange: row.meta_json?.dateRange || "",
    generated: row.generated_at ? new Date(row.generated_at).toISOString() : "",
    avgAqi: Number(row.meta_json?.avgAqi || 0),
    highestPollution: row.meta_json?.highestPollution || "",
    waterAlerts: Number(row.meta_json?.waterAlerts || 0),
  };
}

export async function createReport(payload: any): Promise<ReportDTO> {
  // Insert report metadata; actual generation happens asynchronously.
  const meta = {
    zone: payload.zone || "All Zones",
    dateRange: payload.dateRange || "",
    avgAqi: payload.avgAqi || 0,
    highestPollution: payload.highestPollution || "",
    waterAlerts: payload.waterAlerts || 0,
  };

  const result = await db.query(
    `INSERT INTO reports (name, report_type, period_start, period_end, generated_at, status, meta_json)
     VALUES ($1, $2, $3, $4, NOW(), 'READY', $5)
     RETURNING *`,
    [
      payload.name || "New Report",
      payload.type || "Custom Range",
      payload.periodStart || new Date().toISOString(),
      payload.periodEnd || new Date().toISOString(),
      meta,
    ]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.report_type,
    zone: row.meta_json?.zone || "All Zones",
    dateRange: row.meta_json?.dateRange || "",
    generated: row.generated_at ? new Date(row.generated_at).toISOString() : "",
    avgAqi: Number(row.meta_json?.avgAqi || 0),
    highestPollution: row.meta_json?.highestPollution || "",
    waterAlerts: Number(row.meta_json?.waterAlerts || 0),
  };
}

