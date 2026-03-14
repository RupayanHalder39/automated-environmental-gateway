import { Request, Response, NextFunction } from "express";
import { DEV_MODE } from "../../config";
import { ingestDevReadings } from "../../services/devData";
import type { ApiResponse } from "../../types/response";

// POST /dev/ingest
export async function ingest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!DEV_MODE) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "DEV_MODE is disabled" },
      });
    }

    const readings = Array.isArray(req.body?.readings) ? req.body.readings : [];
    const result = ingestDevReadings(readings);
    const response: ApiResponse<typeof result> = { data: result };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
