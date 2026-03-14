// ReportService: report generation and retrieval

import { db } from "../../utils/db";
import type { ReportDTO } from "../../types/report";
import { DEV_MODE } from "../../config";
import {
  createDevReport,
  getDevReportById,
  listDevReports,
  deleteDevReport,
} from "../../services/devData";

type PdfPayload = {
  filename: string;
  buffer: Buffer;
};

export async function listReports(): Promise<ReportDTO[]> {
  // DEV_MODE: return generated reports without DB access.
  if (DEV_MODE) return listDevReports();

  const result = await db.query(
    `SELECT id, name, report_type, generated_at, meta_json
     FROM reports
     ORDER BY generated_at DESC`
  );

  return (result.rows as any[]).map((row: any) => ({
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
  // DEV_MODE: return generated report by id.
  if (DEV_MODE) return getDevReportById(id);

  const result = await db.query(
    `SELECT id, name, report_type, generated_at, meta_json
     FROM reports
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
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
  // DEV_MODE: create in-memory report only.
  if (DEV_MODE) return createDevReport(payload);

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

  const row = result.rows[0] as any;
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

export async function deleteReport(id: string): Promise<ReportDTO | null> {
  // DEV_MODE: delete in-memory report only.
  if (DEV_MODE) return deleteDevReport(id);

  const result = await db.query(
    `DELETE FROM reports
     WHERE id = $1
     RETURNING id, name, report_type, generated_at, meta_json`,
    [id]
  );

  if (!result.rows.length) return null;
  const row = result.rows[0] as any;
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

export async function downloadReportPdf(id: string): Promise<PdfPayload | null> {
  const report = await getReportById(id);
  if (!report) return null;

  const safeName = (report.name || "report")
    .replace(/[^a-z0-9-_]+/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60) || "report";
  const filename = `${safeName}-${report.id}.pdf`;

  const lines = [
    "Automated Environmental Gateway Report",
    `Report ID: ${report.id}`,
    `Name: ${report.name}`,
    `Type: ${report.type}`,
    `Zone: ${report.zone}`,
    `Date Range: ${report.dateRange}`,
    `Generated: ${report.generated}`,
    `Average AQI: ${report.avgAqi}`,
    `Highest Pollution: ${report.highestPollution}`,
    `Water Alerts: ${report.waterAlerts}`,
  ];

  const buffer = buildSimplePdf(lines);
  return { filename, buffer };
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]): Buffer {
  const contentLines = lines.map((line, index) => {
    const y = 760 - index * 16;
    return `1 0 0 1 50 ${y} Tm (${escapePdfText(line)}) Tj`;
  });

  const content = `BT
/F1 12 Tf
${contentLines.join("\n")}
ET`;

  const length = Buffer.byteLength(content, "utf8");
  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj"
  );
  objects.push(`4 0 obj << /Length ${length} >> stream\n${content}\nendstream endobj`);
  objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");

  let pdf = "%PDF-1.4\n";
  let byteLength = Buffer.byteLength(pdf, "utf8");
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(byteLength);
    const chunk = `${obj}\n`;
    pdf += chunk;
    byteLength += Buffer.byteLength(chunk, "utf8");
  }

  const xrefOffset = byteLength;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  offsets.forEach((offset) => {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  pdf += xref + trailer;

  return Buffer.from(pdf, "utf8");
}
