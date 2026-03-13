import { Request, Response } from "express";
import * as ruleService from "./rule.service";
import type { RuleDTO } from "../../types/rule";

// DTOs are imported from /backend/src/types to keep Figma-aligned shapes consistent.

// GET /rules
export async function listRules(req: Request, res: Response) {
  // Purpose: List all rules for Rules Engine page.
  const data = await ruleService.listRules();
  res.status(501).json({ message: "Not implemented", data });
}

// GET /rules/:id
export async function getRuleById(req: Request, res: Response) {
  const { id } = req.params;
  const data = await ruleService.getRuleById(id);
  res.status(501).json({ message: "Not implemented", data });
}

// POST /rules
export async function createRule(req: Request, res: Response) {
  // Purpose: Create a new alert rule.
  const data = await ruleService.createRule(req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// PATCH /rules/:id
export async function updateRule(req: Request, res: Response) {
  const { id } = req.params;
  const data = await ruleService.updateRule(id, req.body);
  res.status(501).json({ message: "Not implemented", data });
}

// DELETE /rules/:id (soft delete)
export async function deleteRule(req: Request, res: Response) {
  const { id } = req.params;
  const data = await ruleService.deleteRule(id);
  res.status(501).json({ message: "Not implemented", data });
}
