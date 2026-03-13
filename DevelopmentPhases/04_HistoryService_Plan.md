# HistoryService Plan

**Module Name**
HistoryService

**Mapped UI Tab**
Historical Data

**Why this step exists (plain language)**
Teams need historical trends for compliance, audits, and analysis. This service provides long-range queries while keeping performance predictable.

**How it maps to UI (plain language)**
The Historical Data tab shows charts, filters, and time-window comparisons. HistoryService is the backend for all historical chart data and exports.

**Scalability and performance considerations (plain language)**
Historical queries can become large. We must enforce time ranges, leverage partition pruning, and use server-side aggregation instead of returning raw data when not needed.

## UI Field Mapping (Figma Alignment)
Figma `HistoricalData.tsx` expects:
- dateRange: `24hours`, `7days`, `30days`, `custom`
- metric: `aqi`, `temperature`, `humidity`, `waterLevel`
- location: `all`, `saltlake`, `newtown`, `sectorv`
- summary cards: Average, Highest, Lowest, and Number of Alerts Triggered

Mapping to DB:
- Metrics come from `sensor_readings` columns
- Location from `devices.location_name`
- Alerts triggered from `alerts` filtered by time window and location

## API Endpoints to Implement
- GET /history/readings?sensor_id=...&from=...&to=...
- GET /history/aggregate?metric=...&from=...&to=...&interval=1h&location=...
- GET /history/devices/:id/aggregate?from=...&to=...
- GET /history/export?metric=...&from=...&to=...&location=...

## Data Flow / DB Queries
- sensor_readings partitions by recorded_at
- Optional use of materialized views for common aggregates

Example query patterns:
- Range scan on recorded_at with partition pruning
- Aggregation by hour/day using date_trunc

## Shared Utils Needed
- dateRangeBuilder
- aggregationIntervalResolver
- paginationBuilder (for exports)

## Frontend Consumption
- Charts call /history/aggregate
- Detailed tables call /history/readings
- Exports call /history/export (async if large)

## Best Practices Built In
- Enforce max time window per request
- Use aggregate endpoints for charts
- Cache or precompute heavy aggregates
- Always order by recorded_at DESC when listing

