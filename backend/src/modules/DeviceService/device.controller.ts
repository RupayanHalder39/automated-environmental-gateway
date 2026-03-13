import { Request, Response, NextFunction } from "express";
import * as deviceService from "./device.service";
import type { DeviceDTO, DeviceHealthSummaryDTO } from "../../types/device";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /devices
export async function listDevices(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide device list and filters for Device Health tab.
  try {
    const data = await deviceService.listDevices();
    const response: ApiResponse<DeviceDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /devices/:id
export async function getDeviceById(req: Request, res: Response, next: NextFunction) {
  // Purpose: Provide device detail panel data.
  try {
    const { id } = req.params;
    const data = await deviceService.getDeviceById(id);
    const response: ApiResponse<DeviceDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /devices/:id/heartbeats?range=24h
export async function getDeviceHeartbeats(req: Request, res: Response, next: NextFunction) {
  // Purpose: Show recent health metrics for a device.
  try {
    const { id } = req.params;
    const { range } = req.query as { range?: string };
    const data = await deviceService.getDeviceHeartbeats(id, range);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /devices/health/summary
export async function getDeviceHealthSummary(req: Request, res: Response, next: NextFunction) {
  // Purpose: Summary cards for Device Health dashboard.
  try {
    const data = await deviceService.getDeviceHealthSummary();
    const response: ApiResponse<DeviceHealthSummaryDTO> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /devices/:id/status
export async function updateDeviceStatus(req: Request, res: Response, next: NextFunction) {
  // Purpose: Update device operational status (maintenance, decommission, etc.).
  try {
    const { id } = req.params;
    const data = await deviceService.updateDeviceStatus(id, req.body);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

