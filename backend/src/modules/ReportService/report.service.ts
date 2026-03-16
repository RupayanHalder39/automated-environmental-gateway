// ReportService: report generation and retrieval

import { db } from "../../utils/db";
import PDFDocument from "pdfkit";
import type { ReportDTO } from "../../types/report";
import { listSensors } from "../SensorService/sensor.service";
import { getHistoryAggregate } from "../HistoryService/history.service";
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

  const { from, to, rangeLabel } = deriveRange(report.dateRange);
  const sensors = await listSensors(true);
  const historySeries = await getHistoryAggregate({
    metric: "aqi",
    from,
    to,
    interval: "1day",
  });
  const buffer = await buildRichPdf(report, sensors, historySeries, rangeLabel);
  return { filename, buffer };
}

type PdfSensorRow = {
  id: string;
  location: string;
  type: string;
  value: string;
  lastUpdate: string;
};

type ReportSensors = Awaited<ReturnType<typeof listSensors>>;

function deriveRange(dateRange?: string) {
  const now = new Date();
  if (!dateRange) {
    return { from: new Date(now.getTime() - 7 * 86400000).toISOString(), to: now.toISOString(), rangeLabel: "Last 7 days" };
  }
  if (dateRange.toLowerCase().includes("last 24")) {
    return { from: new Date(now.getTime() - 1 * 86400000).toISOString(), to: now.toISOString(), rangeLabel: "Last 24 hours" };
  }
  if (dateRange.toLowerCase().includes("last 7")) {
    return { from: new Date(now.getTime() - 7 * 86400000).toISOString(), to: now.toISOString(), rangeLabel: "Last 7 days" };
  }
  if (dateRange.toLowerCase().includes("last 30")) {
    return { from: new Date(now.getTime() - 30 * 86400000).toISOString(), to: now.toISOString(), rangeLabel: "Last 30 days" };
  }
  const parts = dateRange.split(" - ");
  if (parts.length === 2) {
    const start = new Date(parts[0]);
    const end = new Date(parts[1]);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return { from: start.toISOString(), to: end.toISOString(), rangeLabel: `${parts[0]} - ${parts[1]}` };
    }
  }
  return { from: new Date(now.getTime() - 7 * 86400000).toISOString(), to: now.toISOString(), rangeLabel: dateRange };
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function summarizeSensors(sensors: ReportSensors): PdfSensorRow[] {
  return sensors
    .slice(0, 20)
    .map((sensor) => ({
      id: sensor.id,
      location: sensor.location,
      type: sensor.sensorType || "AQI",
      value:
        sensor.sensorType === "Temperature"
          ? `${sensor.temperature}°C`
          : sensor.sensorType === "Humidity"
            ? `${sensor.humidity}%`
            : sensor.sensorType === "Water Level"
              ? `${sensor.waterLevel}m`
              : `${sensor.aqi}`,
      lastUpdate: formatDate(sensor.lastUpdate),
    }));
}

function buildAqiSeries(history: any[]) {
  return history
    .map((row) => {
      const values = Object.entries(row)
        .filter(([key]) => key !== "date")
        .map(([, value]) => Number(value))
        .filter((value) => Number.isFinite(value));
      if (!values.length) return null;
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return { date: row.date, value: avg };
    })
    .filter(Boolean) as { date: string; value: number }[];
}

function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, title: string, value: string, accent: string) {
  doc
    .roundedRect(x, y, 160, 60, 8)
    .fillAndStroke("#0f172a", "#334155");
  doc.fillColor(accent).fontSize(10).text(title, x + 12, y + 10);
  doc.fillColor("#e2e8f0").fontSize(16).text(value, x + 12, y + 28);
}

function drawLineChart(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, series: { date: string; value: number }[]) {
  doc.roundedRect(x, y, width, height, 8).stroke("#334155");
  if (series.length === 0) {
    doc.fillColor("#94a3b8").fontSize(10).text("No chart data available", x + 12, y + height / 2);
    return;
  }
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = 24;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = series.map((point, idx) => {
    const ratio = max === min ? 0.5 : (point.value - min) / (max - min);
    return {
      x: x + padding + (chartWidth * idx) / (series.length - 1 || 1),
      y: y + padding + chartHeight - ratio * chartHeight,
    };
  });
  doc.strokeColor("#1d4ed8").lineWidth(2);
  points.forEach((pt, idx) => {
    if (idx === 0) doc.moveTo(pt.x, pt.y);
    else doc.lineTo(pt.x, pt.y);
  });
  doc.stroke();
  doc.fillColor("#94a3b8").fontSize(9).text(`Min ${min.toFixed(1)} • Max ${max.toFixed(1)}`, x + padding, y + height - 16);
}

function drawTable(doc: PDFKit.PDFDocument, x: number, y: number, rows: PdfSensorRow[]) {
  const colWidths = [80, 120, 90, 80, 160];
  const headers = ["Sensor ID", "Location", "Type", "Value", "Last Update"];
  doc.fillColor("#e2e8f0").fontSize(10);
  headers.forEach((header, idx) => {
    doc.text(header, x + colWidths.slice(0, idx).reduce((a, b) => a + b, 0), y, { width: colWidths[idx] });
  });
  let cursorY = y + 16;
  doc.strokeColor("#1f2937").lineWidth(1);
  rows.forEach((row) => {
    doc.moveTo(x, cursorY - 4).lineTo(x + colWidths.reduce((a, b) => a + b, 0), cursorY - 4).stroke();
    const cells = [row.id, row.location, row.type, row.value, row.lastUpdate];
    cells.forEach((cell, idx) => {
      doc.fillColor("#cbd5f5").fontSize(9).text(cell, x + colWidths.slice(0, idx).reduce((a, b) => a + b, 0), cursorY, {
        width: colWidths[idx],
      });
    });
    cursorY += 18;
  });
}

function buildRichPdf(
  report: ReportDTO,
  sensors: ReportSensors,
  history: any[],
  rangeLabel: string
): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fillColor("#0f172a");
    doc.fontSize(20).text("Automated Environmental Gateway Report", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#64748b").text(`Generated: ${formatDate(report.generated)}`);
    doc.moveDown(1);

    doc.fillColor("#e2e8f0").fontSize(12).text(report.name);
    doc.fillColor("#94a3b8").fontSize(10).text(`Report ID: ${report.id}`);
    doc.fillColor("#94a3b8").fontSize(10).text(`Type: ${report.type} • Zone: ${report.zone}`);
    doc.fillColor("#94a3b8").fontSize(10).text(`Date Range: ${rangeLabel}`);
    doc.moveDown(1);

    drawCard(doc, 40, 170, "Average AQI", String(report.avgAqi), "#38bdf8");
    drawCard(doc, 220, 170, "Highest Pollution", report.highestPollution || "N/A", "#f97316");
    drawCard(doc, 400, 170, "Water Alerts", String(report.waterAlerts), "#facc15");

    doc.moveDown(6);
    doc.fontSize(12).fillColor("#e2e8f0").text("AQI Trend (Avg across locations)");
    drawLineChart(doc, 40, 260, 520, 160, buildAqiSeries(history));

    doc.addPage();
    doc.fillColor("#e2e8f0").fontSize(12).text("Sensor Snapshot");
    doc.moveDown(0.5);
    drawTable(doc, 40, 120, summarizeSensors(sensors));

    doc.end();
  });
}
