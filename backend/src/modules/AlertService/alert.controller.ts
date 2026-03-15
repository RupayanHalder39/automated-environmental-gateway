// backend/src/modules/AlertService/alert.controller.ts
import { Request, Response, NextFunction } from "express";
import * as alertService from "./alert.service";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";
import type { ApiResponse } from "../../types/response";
import { NotFoundError } from "../../utils/errors";

export async function listAlerts(req: Request, res: Response, next: NextFunction) {
    try {
        const { status } = req.query as { status?: "active" | "resolved" | "acknowledged" };
        const data = await alertService.listAlerts(status);
        const response: ApiResponse<AlertDTO[]> = { data };
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export async function getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const data = await alertService.getAlertById(id);
        const response: ApiResponse<AlertDTO> = { data };
        res.json(response);
    } catch (err) {
        if (err instanceof NotFoundError) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
        }
        next(err);
    }
}

export async function acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        await alertService.acknowledgeAlert(id);
        res.status(204).send(); // No content response for successful update
    } catch (err) {
        if (err instanceof NotFoundError) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
        }
        next(err);
    }
}

export async function resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        await alertService.resolveAlert(id);
        res.status(204).send(); // No content response for successful update
    } catch (err) {
        if (err instanceof NotFoundError) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
        }
        next(err);
    }
}

export async function getAlertSummary(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await alertService.getAlertSummary();
        const response: ApiResponse<AlertSummaryDTO> = { data };
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export async function triggerAlerts(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await alertService.triggerAlertsForReading(req.body);
        const response: ApiResponse<any[]> = { data };
        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
}

