import { Request, Response, NextFunction } from "express";
import * as apiKeyService from "./apiKey.service";
import type { ApiKeyDTO } from "../../types/apiKey";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /api-keys
export async function listApiKeys(req: Request, res: Response, next: NextFunction) {
  // Purpose: List API keys for Public API management UI.
  try {
    const data = await apiKeyService.listApiKeys();
    const response: ApiResponse<ApiKeyDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /api-keys
export async function createApiKey(req: Request, res: Response, next: NextFunction) {
  // Purpose: Generate a new API key and return it once.
  try {
    const data = await apiKeyService.createApiKey(req.body);
    const response: ApiResponse<ApiKeyDTO> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /api-keys/:id/disable
export async function disableApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await apiKeyService.disableApiKey(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /api-keys/:id/rotate
export async function rotateApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await apiKeyService.rotateApiKey(id);
    const response: ApiResponse<ApiKeyDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /public/aqi?location=...
export async function getPublicAqi(req: Request, res: Response, next: NextFunction) {
  // Purpose: Public AQI endpoint aligned to Figma docs.
  try {
    const data = await apiKeyService.getPublicAqi(req.query);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /public/sensors
export async function getPublicSensors(req: Request, res: Response, next: NextFunction) {
  // Purpose: Public sensors list aligned to Figma docs.
  try {
    const data = await apiKeyService.getPublicSensors();
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /public/historical?metric=...&days=...
export async function getPublicHistorical(req: Request, res: Response, next: NextFunction) {
  // Purpose: Public historical data endpoint aligned to Figma docs.
  try {
    const data = await apiKeyService.getPublicHistorical(req.query);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

