import { Request, Response } from "express";
import * as userService from "./user.service";
import type { UserProfileDTO, NotificationSettingsDTO, SystemSettingsDTO } from "../../types/user";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /users
export async function listUsers(req: Request, res: Response) {
  // Purpose: List users for Settings tab (optional module).
  const data = await userService.listUsers();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /users/:id
export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await userService.getUserById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// POST /users
export async function createUser(req: Request, res: Response) {
  const data = await userService.createUser(req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /users/:id
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const data = await userService.updateUser(id, req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /users/:id/disable
export async function disableUser(req: Request, res: Response) {
  const { id } = req.params;
  const data = await userService.disableUser(id);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /settings/notifications
export async function updateNotificationSettings(req: Request, res: Response) {
  const data = await userService.updateNotificationSettings(req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /settings/system
export async function updateSystemSettings(req: Request, res: Response) {
  const data = await userService.updateSystemSettings(req.body);
  res.status(501).json({ message: "Not implemented", data });
}
