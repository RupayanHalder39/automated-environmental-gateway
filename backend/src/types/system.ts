// DTOs for SystemService (System Status)
// Maps to Figma SystemStatus services grid.

export interface SystemServiceDTO {
  name: string;
  status: "running" | "stopped" | "degraded";
  uptime: string;
  cpu: string;
  memory: string;
}

export interface SystemStatusDTO {
  overallStatus: string;
  uptime: string;
  services: SystemServiceDTO[];
  environment: string;
  version: string;
  deployment: string;
}

