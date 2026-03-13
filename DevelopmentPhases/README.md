# Development Phases Overview

This folder contains implementation-ready plans for the Automated Environmental Gateway backend. Each module plan maps 1-to-1 with a UI tab, and all plans follow consistent conventions for controllers, services, and routes.

Figma alignment is based on `/Users/rupayan/AUTOMATED_ENVIRONMENTAL_GATEWAY_FigmaDesign`. Field names in the plans intentionally mirror UI labels and component interfaces.

## Overall Project Architecture
- Node.js + Express backend
- PostgreSQL for relational and time-series storage
- Services separated by domain (Sensors, Devices, History, Rules, Alerts, Anomalies, Sync, API Keys, Reports, System Status, Settings)
- Time-series performance optimized with partitions and indexed access

## UI to Service Mapping
1. Dashboard -> SensorService
2. Device Health -> DeviceService
3. Historical Data -> HistoryService
4. Rules Engine -> RuleService
5. Alerts -> AlertService
6. Data Sanity -> AnomalyService
7. Bulk Data Sync -> SyncService
8. Public API -> ApiKeyService
9. Reports -> ReportService
10. System Status -> SystemService
11. Settings -> UserService (optional)

## How to Use This Folder
- Start with `01_DatabaseSchema.md` for data model understanding
- Follow each module plan to implement routes, controllers, and services
- Use shared utilities consistently across modules
- Keep naming aligned with database tables and Figma field names

## Recommended Implementation Sequence
1. Database schema and migrations (`01_DatabaseSchema.md`)
2. SensorService (Dashboard needs live data first)
3. DeviceService (health monitoring)
4. HistoryService (historical analysis)
5. RuleService (rules definitions)
6. AlertService (alert lifecycle)
7. AnomalyService (data sanity)
8. SyncService (bulk ingestion)
9. ApiKeyService (public API)
10. ReportService (report generation)
11. SystemService (global health)
12. UserService (settings and governance)

## Shared Best Practices Across All Modules
- Separate controller, service, and routes
- Validate request payloads and query params
- Use consistent naming aligned to schema
- Apply pagination for lists
- Add structured error handling
- Protect time-series reads with time-window limits

