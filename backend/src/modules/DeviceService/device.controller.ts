import { Request, Response } from "express";
import * as deviceService from "./device.service";
import type { DeviceDTO, DeviceHealthSummaryDTO } from "../../types/device";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /devices
export async function listDevices(req: Request, res: Response) {
  // Purpose: Provide device list and filters for Device Health tab.
  const data = await deviceService.listDevices();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /devices/:id
export async function getDeviceById(req: Request, res: Response) {
  // Purpose: Provide device detail panel data.
  const { id } = req.params;
  const data = await deviceService.getDeviceById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /devices/:id/heartbeats?range=24h
export async function getDeviceHeartbeats(req: Request, res: Response) {
  // Purpose: Show recent health metrics for a device.
  const { id } = req.params;
  const { range } = req.query as { range?: string };
  const data = await deviceService.getDeviceHeartbeats(id, range);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /devices/health/summary
export async function getDeviceHealthSummary(req: Request, res: Response) {
  // Purpose: Summary cards for Device Health dashboard.
  const data = await deviceService.getDeviceHealthSummary();
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /devices/:id/status
export async function updateDeviceStatus(req: Request, res: Response) {
  // Purpose: Update device operational status (maintenance, decommission, etc.).
  const { id } = req.params;
  const data = await deviceService.updateDeviceStatus(id, req.body);
  res.status(501).json({ message: "Not implemented", data });
}
