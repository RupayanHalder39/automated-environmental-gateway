# SystemService Plan

**Module Name**
SystemService

**Mapped UI Tab**
System Status

**Why this step exists (plain language)**
Operations need a live health overview: API uptime, ingestion status, and queue/backlog indicators. SystemService provides this system-level view.

**How it maps to UI (plain language)**
The System Status tab shows overall health and recent system events. SystemService powers those dashboards.

**Scalability and performance considerations (plain language)**
These endpoints must be fast and lightweight, using cached metrics and simple counts.

## UI Field Mapping (Figma Alignment)
Figma `SystemStatus.tsx` uses services:
- name, status (running/stopped/degraded), uptime, cpu, memory
- Deployment info: Docker, Environment, Version

DB mapping:
- These are operational metrics, sourced from system monitoring rather than DB

## API Endpoints to Implement
- GET /system/status
- GET /system/metrics
- GET /system/ingestion

## Data Flow / DB Queries
- devices for online/offline counts
- sensor_readings for last ingest timestamps
- bulk_sync_batches for ingestion health

Example query patterns:
- Count of devices by status
- Latest recorded_at across partitions

## Shared Utils Needed
- healthSummaryBuilder
- metricCache (optional)

## Frontend Consumption
- System Status tiles use /system/status
- Metrics chart uses /system/metrics

## Best Practices Built In
- Return cached snapshots
- Avoid deep history scans
- Keep endpoints read-only

