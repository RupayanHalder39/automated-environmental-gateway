# AlertService Plan

**Module Name**
AlertService

**Mapped UI Tab**
Alerts

**Why this step exists (plain language)**
When conditions exceed safe thresholds, teams must be notified and able to manage alerts. This service delivers that workflow.

**How it maps to UI (plain language)**
The Alerts tab shows an alert inbox with severity filters and acknowledgment actions. AlertService powers those lists and actions.

**Scalability and performance considerations (plain language)**
Alert lists should be indexed by status and time. Use pagination and avoid loading old alerts by default.

## UI Field Mapping (Figma Alignment)
Figma `Alerts.tsx` uses:
- id
- type: critical | warning | info
- message
- location
- timestamp
- status: active | resolved | dismissed
- value (formatted metric)

DB mapping:
- id -> `alerts.id` (optionally format as ALT-### for display)
- type -> `alerts.severity` (critical/high -> CRITICAL, warning -> HIGH/MEDIUM, info -> LOW)
- message -> `alerts.message`
- location -> `devices.location_name` or `alerts.context_json.location`
- timestamp -> `alerts.triggered_at`
- status -> `alerts.status` (OPEN/RESOLVED/SUPPRESSED mapped to active/resolved/dismissed)
- value -> `alerts.context_json.value`

## API Endpoints to Implement
- GET /alerts?status=active
- GET /alerts/:id
- PATCH /alerts/:id/acknowledge
- PATCH /alerts/:id/resolve
- GET /alerts/summary

## Data Flow / DB Queries
- alerts table for alert instances
- alert_rules for context
- sensors/devices for metadata joins

Example query patterns:
- Alerts by status ordered by triggered_at DESC
- Summary counts by severity

## Shared Utils Needed
- paginationBuilder
- alertStatusValidator

## Frontend Consumption
- Alerts list uses /alerts
- Alert detail view uses /alerts/:id
- Buttons call /alerts/:id/acknowledge or /resolve

## Best Practices Built In
- Enforce valid status transitions
- Return minimal metadata for list views
- Use indexes on status and triggered_at

