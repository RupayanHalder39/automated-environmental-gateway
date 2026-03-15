import { Request, Response, NextFunction } from "express";
import * as locationService from "./location.service";
import type { ApiResponse } from "../../types/response";
import type { LocationDTO } from "../../types/location";

// GET /locations
export async function listLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await locationService.listLocations();
    const response: ApiResponse<LocationDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
