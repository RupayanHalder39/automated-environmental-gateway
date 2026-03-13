# DeviceService Plan

**Module Name**
DeviceService

**Mapped UI Tab**
Device Health

**Why this step exists (plain language)**
We need to track which devices are online, healthy, and properly reporting. This service powers fleet health views and troubleshooting.

**How it maps to UI (plain language)**
The Device Health tab shows device status, last seen timestamps, and diagnostic metrics. DeviceService provides those summaries and per-device drilldowns.

**Scalability and performance considerations (plain language)**
Device health queries must be fast and paginated. Heartbeats are time-series, so we only query recent records and rely on indexed time filters.

## UI Field Mapping (Figma Alignment)
Figma `DeviceHealth.tsx` uses the following device fields:
- id -> `devices.device_code`
- location -> `devices.location_name`
- status -> derived from `devices.status` or `devices.last_seen_at` (online/offline/maintenance)
- lastHeartbeat -> latest `device_heartbeats.heartbeat_at`
- signalStrength -> `device_heartbeats.signal_strength`
- batteryLevel -> `device_heartbeats.battery_pct`
- maintenance -> derived flag from device status or explicit maintenance metadata

## API Endpoints to Implement
- GET /devices
- GET /devices/:id
- GET /devices/:id/heartbeats?range=24h
- GET /devices/health/summary
- PATCH /devices/:id/status

## Data Flow / DB Queries
- devices table for metadata and current status
- device_heartbeats for recent diagnostics
- sensors table for device inventory

Example query patterns:
- Latest heartbeat per device
- Heartbeat history for a single device within a short range

## Shared Utils Needed
- dateRangeBuilder
- paginationBuilder
- healthStatusCalculator (derive operational status)

## Frontend Consumption
- Device Health list uses /devices and /devices/health/summary
- Device detail screen uses /devices/:id and /devices/:id/heartbeats

## Best Practices Built In
- Separate controller, service, routes
- Validate status changes and payloads
- Use pagination and filters (status, location)
- Avoid deep heartbeat scans by range limits

