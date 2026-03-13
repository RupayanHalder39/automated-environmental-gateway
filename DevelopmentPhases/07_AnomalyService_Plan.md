# AnomalyService Plan

**Module Name**
AnomalyService

**Mapped UI Tab**
Data Sanity

**Why this step exists (plain language)**
We must detect data spikes, gaps, and drift to keep analytics trustworthy. This service exposes anomaly data and explains why it occurred.

**How it maps to UI (plain language)**
The Data Sanity tab shows anomalies by sensor and time. AnomalyService provides lists, drilldowns, and summary counts.

**Scalability and performance considerations (plain language)**
Anomalies can be frequent. Use time filters and indexed lookups. Avoid full scans and default to recent windows.

## UI Field Mapping (Figma Alignment)
Figma `DataSanity.tsx` uses:
- id
- sensorId
- invalidValue
- expectedRange
- timestamp
- reason
- severity (high | medium | low)
- toggle flags: anomalyFilterEnabled, autoRejectEnabled

DB mapping:
- id -> `anomaly_logs.id` (optionally format ANO-### for display)
- sensorId -> `sensors.sensor_code`
- invalidValue / expectedRange / reason -> `anomaly_logs.details_json`
- timestamp -> `anomaly_logs.detected_at`
- severity -> `anomaly_logs.severity`

## API Endpoints to Implement
- GET /anomalies?range=24h
- GET /anomalies/:id
- GET /anomalies/summary
- GET /anomalies/by-sensor/:sensor_id
- PATCH /anomalies/settings (enable/disable filtering)

## Data Flow / DB Queries
- anomaly_logs table
- Optional joins to sensors and devices

Example query patterns:
- Anomalies by sensor and time
- Aggregate counts by anomaly_type

## Shared Utils Needed
- dateRangeBuilder
- paginationBuilder
- anomalyTypeNormalizer

## Frontend Consumption
- Data Sanity list uses /anomalies
- Drilldown uses /anomalies/:id or /anomalies/by-sensor/:sensor_id
- Settings toggles use /anomalies/settings

## Best Practices Built In
- Require time range or default to last 24h
- Index by sensor_id and detected_at
- Return minimal data for list views

