import { Request, Response, NextFunction } from "express";
import * as sensorService from "./sensor.service";
import type { SensorDTO, SensorSummaryDTO } from "../../types/sensor";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /sensors
export async function listSensors(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide dashboard list/map markers for all sensors with latest readings.
  // UI Mapping: Dashboard sensor cards and map markers.
  // Frontend Consumption: Used by map + list widgets.
  try {
    const data = await sensorService.listSensors();
    const response: ApiResponse<SensorDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sensors/:id
export async function getSensorById(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide metadata for a single sensor for detail panels.
  // UI Mapping: Sensor detail popup.
  try {
    const { id } = req.params;
    const data = await sensorService.getSensorById(id);
    const response: ApiResponse<SensorDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sensors/:id/latest
export async function getSensorLatest(req: Request, res: Response, next: NextFunction) {
  // Purpose: Fetch latest reading for a specific sensor.
  // UI Mapping: Sensor popup metrics (AQI, temperature, humidity, water level).
  try {
    const { id } = req.params;
    const data = await sensorService.getSensorLatest(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sensors/latest?type=aqi|temperature|humidity|waterLevel
export async function getLatestByType(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide last-known values for dashboard tiles by metric type.
  // UI Mapping: Top-level metric tiles.
  try {
    const { type } = req.query as { type?: string };
    const data = await sensorService.getLatestByType(type);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sensors/summary?range=15m
export async function getSensorSummary(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide quick stats for dashboard summary cards.
  // UI Mapping: Overview cards at top of dashboard.
  try {
    const { range } = req.query as { range?: string };
    const data = await sensorService.getSensorSummary(range);
    const response: ApiResponse<SensorSummaryDTO> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /sensors/health
export async function getSensorHealth(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide health/status counts for quick monitoring.
  // UI Mapping: Dashboard health indicators.
  try {
    const data = await sensorService.getSensorHealth();
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

