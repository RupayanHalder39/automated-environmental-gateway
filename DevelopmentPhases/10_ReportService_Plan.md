# ReportService Plan

**Module Name**
ReportService

**Mapped UI Tab**
Reports

**Why this step exists (plain language)**
Reports summarize environmental data for stakeholders and compliance. This service manages report generation and retrieval.

**How it maps to UI (plain language)**
The Reports tab lists generated reports and allows users to download. ReportService provides list and generate actions.

**Scalability and performance considerations (plain language)**
Report generation can be heavy. Run asynchronously and store metadata. Use pre-aggregated data where possible.

## UI Field Mapping (Figma Alignment)
Figma `Reports.tsx` uses:
- id, name, type, zone, dateRange, generated
- avgAqi, highestPollution, waterAlerts

DB mapping:
- id -> `reports.id`
- name -> `reports.name`
- type -> `reports.report_type`
- zone/dateRange -> `reports.meta_json`
- generated -> `reports.generated_at`
- avgAqi/highestPollution/waterAlerts -> `reports.meta_json`

## API Endpoints to Implement
- GET /reports
- GET /reports/:id
- POST /reports

## Data Flow / DB Queries
- reports table for metadata
- sensor_readings for source data

Example query patterns:
- List reports ordered by generated_at
- Insert report record with status GENERATING

## Shared Utils Needed
- reportScheduler
- dateRangeBuilder
- paginationBuilder

## Frontend Consumption
- Reports list uses /reports
- Create flow uses POST /reports
- Detail uses /reports/:id

## Best Practices Built In
- Async generation with status updates
- Limit report sizes and time windows
- Store file_path for downloads

