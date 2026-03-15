export interface RuleDTO {
  id: string;
  name: string;
  conditions: {
    metric: string;
    operator: string;
    threshold: number;
  }[];
  locationIds: string[];
  actionIds: string[];
  status: "active" | "disabled";
  lastTriggered: string;
}
