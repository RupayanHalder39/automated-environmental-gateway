// backend/src/modules/AlertService/alert.service.ts
import * as repository from "./alert.repository";
import type { AlertDTO, AlertSummaryDTO } from "../../types/alert";
import { NotFoundError } from "../../utils/errors";

type AlertStatusQuery = "active" | "resolved" | "acknowledged";
type AlertStatusDb = "OPEN" | "RESOLVED" | "ACKNOWLEDGED";

const statusMap: Record<AlertStatusQuery, AlertStatusDb> = {
    active: "OPEN",
    resolved: "RESOLVED",
    acknowledged: "ACKNOWLEDGED",
};

/**
 * Retrieves a list of alerts, optionally filtered by status.
 * @param status - The status to filter alerts by.
 * @returns A promise that resolves to an array of AlertDTOs.
 */
export async function listAlerts(status?: AlertStatusQuery): Promise<AlertDTO[]> {
    const dbStatus = status ? statusMap[status] : undefined;
    return repository.findAlerts(dbStatus);
}

/**
 * Retrieves a single alert by its ID.
 * @param id - The ID of the alert to retrieve.
 * @returns A promise that resolves to an AlertDTO, or throws a NotFoundError if not found.
 */
export async function getAlertById(id: string): Promise<AlertDTO> {
    const alert = await repository.findAlertById(id);
    if (!alert) {
        throw new NotFoundError(`Alert with ID ${id} not found.`);
    }
    return alert;
}

/**
 * Acknowledges an alert.
 * @param id - The ID of the alert to acknowledge.
 * @returns A promise that resolves to true if the alert was acknowledged.
 */
export async function acknowledgeAlert(id: string): Promise<boolean> {
    const success = await repository.updateAlertStatus(id, "ACKNOWLEDGED");
    if (!success) {
        throw new NotFoundError(`Alert with ID ${id} not found or already acknowledged.`);
    }
    return true;
}

/**
 * Resolves an alert.
 * @param id - The ID of the alert to resolve.
 * @returns A promise that resolves to true if the alert was resolved.
 */
export async function resolveAlert(id: string): Promise<boolean> {
    const success = await repository.updateAlertStatus(id, "RESOLVED");
    if (!success) {
        throw new NotFoundError(`Alert with ID ${id} not found or already resolved.`);
    }
    return true;
}

/**
 * Retrieves a summary of alerts.
 * @returns A promise that resolves to an AlertSummaryDTO.
 */
export async function getAlertSummary(): Promise<AlertSummaryDTO> {
    return repository.getSummary();
}

/**
 * Triggers alerts for a new sensor reading based on defined rules.
 * @param payload - The sensor reading payload.
 * @returns A promise that resolves to an array of created alerts.
 */
export async function triggerAlertsForReading(payload: {
    sensorCode: string;
    deviceCode: string;
    metric: string;
    value: number;
}): Promise<any[]> {
    return repository.createAlertsForReading(payload);
}
