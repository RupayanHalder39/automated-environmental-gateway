import { Request, Response, NextFunction } from "express";
import * as ruleService from "./rule.service";
import type { RuleDTO } from "../../types/rule";
import type { ApiResponse } from "../../types/response";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /rules
export async function listRules(req: Request, res: Response, next: NextFunction) {
  // Purpose: List all rules for Rules Engine page.
  try {
    const data = await ruleService.listRules();
    const response: ApiResponse<RuleDTO[]> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// GET /rules/:id
export async function getRuleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await ruleService.getRuleById(id);
    const response: ApiResponse<RuleDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /rules
export async function createRule(req: Request, res: Response, next: NextFunction) {
  // Purpose: Create a new alert rule.
  try {
    const data = await ruleService.createRule(req.body);
    const response: ApiResponse<RuleDTO> = { data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /rules/:id
export async function updateRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await ruleService.updateRule(id, req.body);
    const response: ApiResponse<RuleDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// PATCH /rules/:id/toggle
export async function toggleRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await ruleService.toggleRule(id);
    const response: ApiResponse<RuleDTO | null> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// DELETE /rules/:id (soft delete)
export async function deleteRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await ruleService.deleteRule(id);
    const response: ApiResponse<typeof data> = { data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
