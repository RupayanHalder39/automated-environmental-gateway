import { Request, Response, NextFunction } from "express";
import * as userService from "./user.service";
import type { UserProfileDTO, NotificationSettingsDTO, SystemSettingsDTO } from "../../types/user";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /users
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  // Purpose: List users for Settings tab (optional module).
  try {
    const data = await userService.listUsers();
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /users/:id
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await userService.getUserById(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /users
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await userService.createUser(req.body);
    const response: ApiResponse<typeof data> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /users/:id
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await userService.updateUser(id, req.body);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /users/:id/disable
export async function disableUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await userService.disableUser(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /settings/notifications
export async function updateNotificationSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await userService.updateNotificationSettings(req.body as NotificationSettingsDTO & { userId: string });
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /settings/system
export async function updateSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await userService.updateSystemSettings(req.body as SystemSettingsDTO & { userId: string });
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

