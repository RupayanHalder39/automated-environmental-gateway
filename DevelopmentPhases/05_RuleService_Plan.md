# RuleService Plan

**Module Name**
RuleService

**Mapped UI Tab**
Rules Engine

**Why this step exists (plain language)**
The system needs configurable logic to detect unsafe environmental conditions. RuleService manages those rules cleanly.

**How it maps to UI (plain language)**
The Rules Engine tab allows admins to create, update, and disable alert rules. RuleService provides CRUD and validation.

**Scalability and performance considerations (plain language)**
Rules must be quickly retrievable during streaming evaluations. Keep active rules cached and validate changes strictly.

## UI Field Mapping (Figma Alignment)
Figma `RulesEngine.tsx` uses:
- id, name
- metric (AQI, Temperature, Humidity, Water Level)
- operator (`>`, `<`, `>=`, `<=`)
- threshold (number)
- location (All Locations / specific zone)
- action (Send Notification, Trigger Warning, Create Alert Log)
- status (active/disabled)
- lastTriggered (display only)

DB mapping:
- name -> `alert_rules.name`
- metric -> `alert_rules.sensor_type`
- operator/threshold/location/action -> `alert_rules.condition_json`
- status -> `alert_rules.is_active`
- lastTriggered -> derived from most recent `alerts.triggered_at` for the rule

## API Endpoints to Implement
- GET /rules
- GET /rules/:id
- POST /rules
- PATCH /rules/:id
- DELETE /rules/:id (soft delete via is_active)

## Data Flow / DB Queries
- alert_rules table for all rule definitions

Example query patterns:
- List active rules by sensor_type
- Validate condition_json before persist

## Shared Utils Needed
- ruleValidator (validate condition_json)
- paginationBuilder

## Frontend Consumption
- Rules UI uses /rules for list and /rules/:id for details
- Create/edit flows use POST/PATCH

## Best Practices Built In
- Validate condition_json server-side
- Use soft delete (is_active)
- Ensure rules are typed by sensor_type

