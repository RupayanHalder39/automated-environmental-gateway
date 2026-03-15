// backend/src/modules/AlertService/alert.validators.ts
import { Request, Response, NextFunction } from "express";

const VALID_STATUSES = ["active", "resolved", "acknowledged"];

export const validateListAlerts = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    if (status && (typeof status !== 'string' || !VALID_STATUSES.includes(status))) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: `Invalid status parameter. Must be one of: ${VALID_STATUSES.join(", ")}`,
            },
        });
    }

    next();
};

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // A simple check for a non-empty string. In a real app, you might validate for UUID, CUID, etc.
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: "A valid 'id' route parameter is required.",
            },
        });
    }
    
    next();
}

export const validateTriggerPayload = (req: Request, res: Response, next: NextFunction) => {
    const { sensorCode, deviceCode, metric, value } = req.body;

    if (typeof sensorCode !== 'string' || !sensorCode) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'sensorCode is required and must be a string' } });
    }
    if (typeof deviceCode !== 'string' || !deviceCode) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'deviceCode is required and must be a string' } });
    }
    if (typeof metric !== 'string' || !metric) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'metric is required and must be a string' } });
    }
    if (typeof value !== 'number') {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'value is required and must be a number' } });
    }

    next();
};
