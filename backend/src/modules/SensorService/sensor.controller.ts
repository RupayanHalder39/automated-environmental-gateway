import { Request, Response } from "express";
import * as sensorService from "./sensor.service";
import type { SensorDTO, SensorSummaryDTO } from "../../types/sensor";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /sensors
export async function listSensors(req: Request, res: Response) {
  // Purpose: Provide dashboard list/map markers for all sensors with latest readings.
  // UI Mapping: Dashboard sensor cards and map markers.
  // Frontend Consumption: Used by map + list widgets.
  const data = await sensorService.listSensors();
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}

// GET /sensors/:id
export async function getSensorById(req: Request, res: Response) {
  // Purpose: Provide metadata for a single sensor for detail panels.
  // UI Mapping: Sensor detail popup.
  const { id } = req.params;
  const data = await sensorService.getSensorById(id);
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}

// GET /sensors/:id/latest
export async function getSensorLatest(req: Request, res: Response) {
  // Purpose: Fetch latest reading for a specific sensor.
  // UI Mapping: Sensor popup metrics (AQI, temperature, humidity, water level).
  const { id } = req.params;
  const data = await sensorService.getSensorLatest(id);
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}

// GET /sensors/latest?type=aqi|temperature|humidity|waterLevel
export async function getLatestByType(req: Request, res: Response) {
  // Purpose: Provide last-known values for dashboard tiles by metric type.
  // UI Mapping: Top-level metric tiles.
  const { type } = req.query as { type?: string };
  const data = await sensorService.getLatestByType(type);
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}

// GET /sensors/summary?range=15m
export async function getSensorSummary(req: Request, res: Response) {
  // Purpose: Provide quick stats for dashboard summary cards.
  // UI Mapping: Overview cards at top of dashboard.
  const { range } = req.query as { range?: string };
  const data = await sensorService.getSensorSummary(range);
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}

// GET /sensors/health
export async function getSensorHealth(req: Request, res: Response) {
  // Purpose: Provide health/status counts for quick monitoring.
  // UI Mapping: Dashboard health indicators.
  const data = await sensorService.getSensorHealth();
  res.status(501).json({
    message: "Not implemented",
    data,
  });
}
