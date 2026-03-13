import { Request, Response } from "express";
import * as apiKeyService from "./apiKey.service";
import type { ApiKeyDTO } from "../../types/apiKey";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /api-keys
export async function listApiKeys(req: Request, res: Response) {
  // Purpose: List API keys for Public API management UI.
  const data = await apiKeyService.listApiKeys();
  res.status(501).json({ message: "Not implemented", data });
}

// POST /api-keys
export async function createApiKey(req: Request, res: Response) {
  // Purpose: Generate a new API key and return it once.
  const data = await apiKeyService.createApiKey(req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /api-keys/:id/disable
export async function disableApiKey(req: Request, res: Response) {
  const { id } = req.params;
  const data = await apiKeyService.disableApiKey(id);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /api-keys/:id/rotate
export async function rotateApiKey(req: Request, res: Response) {
  const { id } = req.params;
  const data = await apiKeyService.rotateApiKey(id);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /public/aqi?location=...
export async function getPublicAqi(req: Request, res: Response) {
  // Purpose: Public AQI endpoint aligned to Figma docs.
  const data = await apiKeyService.getPublicAqi(req.query);
  res.status(501).json({ message: "Not implemented", data });
}

// GET /public/sensors
export async function getPublicSensors(req: Request, res: Response) {
  // Purpose: Public sensors list aligned to Figma docs.
  const data = await apiKeyService.getPublicSensors();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /public/historical?metric=...&days=...
export async function getPublicHistorical(req: Request, res: Response) {
  // Purpose: Public historical data endpoint aligned to Figma docs.
  const data = await apiKeyService.getPublicHistorical(req.query);
  res.status(501).json({ message: "Not implemented", data });
}
