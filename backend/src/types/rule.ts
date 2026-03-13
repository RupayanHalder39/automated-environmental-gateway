// DTOs for RuleService (Rules Engine)
// Maps to Figma RulesEngine Rule interface.

export interface RuleDTO {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  location: string;
  action: string;
  status: "active" | "disabled";
  lastTriggered: string;
}

