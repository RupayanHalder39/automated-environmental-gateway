# Database Schema Documentation

This document explains the PostgreSQL schema for the Automated Environmental Gateway system. It is written for engineering, product, and interview discussions, and focuses on clarity, scalability, and how the schema supports high-frequency Industrial IoT workloads in Kolkata. Field names and UI terminology are aligned to the approved Figma design in `/Users/rupayan/AUTOMATED_ENVIRONMENTAL_GATEWAY_FigmaDesign`.

## Overview
The schema supports devices and sensors that stream environmental readings (AQI, temperature, humidity, water level). It also tracks device heartbeats, alerting, anomaly detection, bulk sync ingestion, reporting, and API keys.

Key goals:
- Scale to thousands of sensors sending readings every second
- Support fast time-series queries and historical analysis
- Keep alerting and anomaly pipelines auditable
- Maintain clear relationships between devices, sensors, and readings


## Table: devices
**Purpose**
Represents physical edge devices installed across Kolkata sites. A device can host multiple sensors.

**Columns**
- id (UUID, PK): Unique device identifier.
- device_code (TEXT, UNIQUE, NOT NULL): Human/ops-visible identifier like "GW-001".
- name (TEXT, NOT NULL): Friendly name.
- model (TEXT): Device model.
- firmware_version (TEXT): Current firmware.
- location_name (TEXT): Site label like "Salt Lake".
- latitude, longitude (NUMERIC): Coordinates.
- status (TEXT, NOT NULL): ACTIVE, INACTIVE, MAINTENANCE, DECOMMISSIONED.
- installed_at (TIMESTAMPTZ): Installation date.
- last_seen_at (TIMESTAMPTZ): Updated from heartbeats.
- created_at, updated_at (TIMESTAMPTZ): Row lifecycle.

**Keys**
- Primary key: id
- Unique: device_code

**Indexes**
- status for dashboards
- last_seen_at for health monitoring

**Relationships**
- One device -> many sensors
- One device -> many device_heartbeats
- One device -> many sensor_readings

**Example row**
```
{
  "id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "device_code": "GW-001",
  "name": "Sector V Gateway",
  "model": "AEG-X2",
  "firmware_version": "v2.3.1",
  "location_name": "Sector V",
  "latitude": 22.5726,
  "longitude": 88.4324,
  "status": "ACTIVE",
  "installed_at": "2025-11-05T04:00:00Z",
  "last_seen_at": "2026-03-14T03:15:12Z",
  "created_at": "2025-11-01T12:00:00Z",
  "updated_at": "2026-03-14T03:15:12Z"
}
```


## Table: sensors
**Purpose**
Represents a specific sensor attached to a device. Each sensor tracks a single metric type.

**Columns**
- id (UUID, PK): Unique sensor ID.
- device_id (UUID, FK -> devices.id): Owning device.
- sensor_code (TEXT, UNIQUE, NOT NULL): Unique code like "SEN-001".
- sensor_type (TEXT, NOT NULL): AQI, TEMPERATURE, HUMIDITY, WATER_LEVEL.
- unit (TEXT, NOT NULL): Measurement unit.
- min_value, max_value (NUMERIC): Expected limits for validation.
- calibration_json (JSONB): Calibration metadata.
- is_active (BOOLEAN, NOT NULL): Logical status.
- installed_at (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)

**Keys**
- Primary key: id
- Foreign key: device_id -> devices.id
- Unique: sensor_code

**Indexes**
- device_id (device drilldowns)
- sensor_type (type-based filtering)
- is_active

**Relationships**
- Many sensors -> one device
- One sensor -> many sensor_readings
- One sensor -> many alerts, anomaly_logs

**Example row**
```
{
  "id": "1e5d9c11-8e2a-4f17-9f5d-9130c7e4a1c2",
  "device_id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "sensor_code": "SEN-003",
  "sensor_type": "AQI",
  "unit": "µg/m3",
  "min_value": 0,
  "max_value": 500,
  "is_active": true,
  "installed_at": "2025-11-05T04:00:00Z",
  "created_at": "2025-11-01T12:00:00Z",
  "updated_at": "2026-03-14T03:15:12Z"
}
```


## Table: sensor_readings (partitioned time-series)
**Purpose**
Stores high-frequency sensor data. This is the largest table and is optimized for time-series queries.

**Columns**
- id (BIGSERIAL, PK): Surrogate key.
- sensor_id (UUID, FK -> sensors.id)
- device_id (UUID, FK -> devices.id)
- recorded_at (TIMESTAMPTZ, NOT NULL): When the reading was measured.
- received_at (TIMESTAMPTZ, NOT NULL): When it arrived at the backend.
- aqi (INTEGER)
- temperature_c (NUMERIC)
- humidity_pct (NUMERIC)
- water_level_cm (NUMERIC)
- quality_flag (TEXT): OK, ESTIMATED, OUTLIER, MISSING.
- source (TEXT): LIVE, BULK_SYNC, SIMULATED.

**Keys**
- Primary key: id
- Foreign keys: sensor_id -> sensors.id, device_id -> devices.id
- Unique constraint: (sensor_id, recorded_at) to avoid duplicates

**Indexes**
- (sensor_id, recorded_at DESC) for latest readings
- (device_id, recorded_at DESC) for device history
- BRIN on recorded_at for large scans

**Partitioning**
- Range partitioned by recorded_at (monthly or weekly)
- Example: sensor_readings_2026_03 for March 2026

**Relationships**
- Many readings -> one sensor
- Many readings -> one device

**Time-series optimization strategy**
- Partitioning reduces index size per partition
- BRIN index accelerates wide time scans
- Composite indexes on sensor_id and recorded_at accelerate time-window queries
- Unique constraint protects from duplicate ingestion

**Example row**
```
{
  "id": 98423321,
  "sensor_id": "1e5d9c11-8e2a-4f17-9f5d-9130c7e4a1c2",
  "device_id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "recorded_at": "2026-03-14T03:15:00Z",
  "received_at": "2026-03-14T03:15:01Z",
  "aqi": 172,
  "temperature_c": null,
  "humidity_pct": null,
  "water_level_cm": null,
  "quality_flag": "OK",
  "source": "LIVE"
}
```


## Table: device_heartbeats
**Purpose**
Tracks device health and uptime signals. Useful for operational monitoring.

**Columns**
- id (BIGSERIAL, PK)
- device_id (UUID, FK -> devices.id)
- heartbeat_at (TIMESTAMPTZ, NOT NULL)
- status (TEXT): OK, WARN, ERROR, OFFLINE
- cpu_temp_c (NUMERIC)
- battery_pct (NUMERIC)
- signal_strength (INTEGER)
- details_json (JSONB)

**Indexes**
- (device_id, heartbeat_at DESC) for latest health

**Relationships**
- Many heartbeats -> one device

**Example row**
```
{
  "id": 48112,
  "device_id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "heartbeat_at": "2026-03-14T03:15:12Z",
  "status": "OK",
  "cpu_temp_c": 48.2,
  "battery_pct": 97.5,
  "signal_strength": -71,
  "details_json": {"uptime_s": 86400}
}
```


## Table: alert_rules
**Purpose**
Defines rules to detect abnormal conditions for a sensor type.

**Columns**
- id (UUID, PK)
- name (TEXT, NOT NULL)
- sensor_type (TEXT, NOT NULL)
- condition_json (JSONB, NOT NULL): Rule logic, e.g. {"op": ">", "value": 150, "location": "Sector V", "action": "notification"}
- severity (TEXT): LOW, MEDIUM, HIGH, CRITICAL
- is_active (BOOLEAN, NOT NULL)
- created_by (TEXT)
- created_at, updated_at (TIMESTAMPTZ)

**Indexes**
- is_active for rule scans
- sensor_type for type-based evaluation

**Relationships**
- One rule -> many alerts

**Example row**
```
{
  "id": "2b9f8c34-4a2f-4306-8f75-7b8917a94ad1",
  "name": "Dangerous AQI Warning",
  "sensor_type": "AQI",
  "condition_json": {"op": ">=", "value": 200, "location": "All Locations", "action": "Trigger Warning"},
  "severity": "CRITICAL",
  "is_active": true,
  "created_by": "ops-admin",
  "created_at": "2026-01-10T08:00:00Z",
  "updated_at": "2026-01-10T08:00:00Z"
}
```


## Table: alerts
**Purpose**
Stores alert instances generated by rules or detectors.

**Columns**
- id (BIGSERIAL, PK)
- rule_id (UUID, FK -> alert_rules.id, nullable)
- sensor_id (UUID, FK -> sensors.id, nullable)
- device_id (UUID, FK -> devices.id, nullable)
- triggered_at (TIMESTAMPTZ, NOT NULL)
- status (TEXT): OPEN, ACKNOWLEDGED, RESOLVED, SUPPRESSED
- severity (TEXT): LOW, MEDIUM, HIGH, CRITICAL
- message (TEXT, NOT NULL)
- context_json (JSONB)
- resolved_at (TIMESTAMPTZ)

**Indexes**
- status for alert inbox
- triggered_at for sorting
- device_id for device-specific alerts

**Relationships**
- Many alerts -> one alert_rule
- Many alerts -> one sensor
- Many alerts -> one device

**Example row**
```
{
  "id": 733211,
  "rule_id": "2b9f8c34-4a2f-4306-8f75-7b8917a94ad1",
  "sensor_id": "1e5d9c11-8e2a-4f17-9f5d-9130c7e4a1c2",
  "device_id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "triggered_at": "2026-03-14T03:15:00Z",
  "status": "OPEN",
  "severity": "CRITICAL",
  "message": "Dangerous AQI Level Detected",
  "context_json": {"value": "AQI: 165", "location": "Park Street"}
}
```


## Table: anomaly_logs
**Purpose**
Captures anomalies detected by the Data Sanity module.

**Columns**
- id (BIGSERIAL, PK)
- sensor_id (UUID, FK -> sensors.id)
- device_id (UUID, FK -> devices.id)
- detected_at (TIMESTAMPTZ)
- anomaly_type (TEXT): SPIKE, FLATLINE, DRIFT, GAP
- severity (TEXT): LOW, MEDIUM, HIGH, CRITICAL
- reading_id (BIGINT, FK -> sensor_readings.id, nullable)
- details_json (JSONB)

**Indexes**
- (sensor_id, detected_at DESC)
- (device_id, detected_at DESC)

**Relationships**
- Many anomalies -> one sensor
- Many anomalies -> one device
- Optional link to a specific reading

**Example row**
```
{
  "id": 17888,
  "sensor_id": "1e5d9c11-8e2a-4f17-9f5d-9130c7e4a1c2",
  "device_id": "b3b7a88b-3f8e-4ab7-9f6f-1e7f7f1d2f1b",
  "detected_at": "2026-03-14T03:16:00Z",
  "anomaly_type": "SPIKE",
  "severity": "HIGH",
  "reading_id": 98423321,
  "details_json": {"invalidValue": "Temperature: 500°C", "expectedRange": "0°C - 50°C", "reason": "Temperature spike beyond physical limits"}
}
```


## Table: bulk_sync_batches
**Purpose**
Tracks bulk ingestion batches, typically for offline gateways or backfills.

**Columns**
- id (UUID, PK)
- source (TEXT, NOT NULL)
- started_at (TIMESTAMPTZ, NOT NULL)
- finished_at (TIMESTAMPTZ)
- status (TEXT): IN_PROGRESS, COMPLETED, FAILED, PARTIAL
- total_records, inserted_records, failed_records (BIGINT)
- error_summary (TEXT)

**Indexes**
- status for operational dashboards
- started_at for recent batch visibility

**Relationships**
- None directly; ingestion data links to sensor_readings by source = BULK_SYNC

**Example row**
```
{
  "id": "71c3b7e6-1a29-47e4-9b66-1dfe3f85f0a4",
  "source": "GW-003",
  "started_at": "2026-03-14T01:00:00Z",
  "finished_at": "2026-03-14T01:10:00Z",
  "status": "COMPLETED",
  "total_records": 120000,
  "inserted_records": 119800,
  "failed_records": 200
}
```


## Table: reports
**Purpose**
Stores generated reports and metadata for analytics and compliance.

**Columns**
- id (UUID, PK)
- name (TEXT, NOT NULL)
- report_type (TEXT, NOT NULL)
- period_start, period_end (TIMESTAMPTZ)
- generated_at (TIMESTAMPTZ)
- status (TEXT): READY, FAILED, GENERATING
- file_path (TEXT)
- meta_json (JSONB)

**Indexes**
- (report_type, generated_at DESC)

**Relationships**
- None (report content is derived from historical data)

**Example row**
```
{
  "id": "aa6dfb69-8d63-4e74-9e2d-6f4a1c1f2b6f",
  "name": "Weekly City Health Report - March Week 1",
  "report_type": "Weekly Summary",
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-08T00:00:00Z",
  "generated_at": "2026-03-08T00:10:00Z",
  "status": "READY",
  "file_path": "/reports/2026/03/08/weekly_city_health.pdf",
  "meta_json": {"zone": "All Zones", "avgAqi": 92, "highestPollution": "Park Street", "waterAlerts": 3}
}
```


## Table: api_keys
**Purpose**
Supports Public API access with scoped API keys.

**Columns**
- id (UUID, PK)
- name (TEXT, NOT NULL)
- key_hash (TEXT, UNIQUE, NOT NULL)
- scopes (TEXT[] NOT NULL)
- is_active (BOOLEAN, NOT NULL)
- last_used_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

**Indexes**
- is_active for key scanning
- expires_at for rotation logic

**Relationships**
- None (keys are access control artifacts)

**Example row**
```
{
  "id": "0c86b4b3-0c1a-4c60-8a0b-11f2e9a7f9f7",
  "name": "Production API Key",
  "key_hash": "$2b$12$6v...",
  "scopes": ["read:sensors", "read:readings"],
  "is_active": true,
  "last_used_at": "2026-03-14T03:05:00Z",
  "expires_at": "2027-03-14T00:00:00Z",
  "created_at": "2026-03-01T12:00:00Z"
}
```


## Relationships Summary
- devices 1 -> many sensors
- devices 1 -> many device_heartbeats
- devices 1 -> many sensor_readings
- sensors 1 -> many sensor_readings
- alert_rules 1 -> many alerts
- sensors 1 -> many alerts
- devices 1 -> many alerts
- sensors 1 -> many anomaly_logs
- sensor_readings 1 -> many anomaly_logs (optional link)


## Time-Series Optimization Summary
- Partition sensor_readings by recorded_at (monthly or weekly)
- Use BRIN for recorded_at for large scans
- Use composite indexes for sensor_id and recorded_at
- Keep readings table lean for high ingest
- Use quality_flag and source to preserve data lineage


## Figma Field Mapping (UI -> DB)
This section maps UI field names to backend tables/columns so API responses match the approved design language.

**Dashboard Sensor Card (Figma: Dashboard.tsx Sensor interface)**
- id -> sensors.sensor_code
- location -> devices.location_name
- lat/lng -> devices.latitude / devices.longitude
- aqi -> sensor_readings.aqi (latest)
- temperature -> sensor_readings.temperature_c (convert to °C)
- humidity -> sensor_readings.humidity_pct
- waterLevel -> sensor_readings.water_level_cm (convert to meters if UI shows "m")
- lastUpdate -> sensor_readings.recorded_at (formatted as relative time)
- status (online/offline) -> derived from devices.last_seen_at or devices.status

**Device Health Table (Figma: DeviceHealth.tsx Device interface)**
- id -> devices.device_code
- location -> devices.location_name
- status -> derived from devices.status and last_seen_at
- lastHeartbeat -> device_heartbeats.heartbeat_at (latest)
- signalStrength -> device_heartbeats.signal_strength
- batteryLevel -> device_heartbeats.battery_pct
- maintenance -> devices.status = MAINTENANCE or derived flag

**Alerts (Figma: Alerts.tsx Alert interface)**
- id -> alerts.id (or external ALT-### display id)
- type (critical/warning/info) -> alerts.severity
- message -> alerts.message
- location -> devices.location_name or context_json.location
- timestamp -> alerts.triggered_at
- status (active/resolved/dismissed) -> alerts.status (OPEN/RESOLVED/SUPPRESSED)
- value -> alerts.context_json.value

**Data Sanity (Figma: DataSanity.tsx AnomalyLog)**
- id -> anomaly_logs.id (or external ANO-### display id)
- sensorId -> sensors.sensor_code
- invalidValue/expectedRange/reason -> anomaly_logs.details_json
- timestamp -> anomaly_logs.detected_at
- severity -> anomaly_logs.severity

**Bulk Sync (Figma: BulkDataSync.tsx batchLogs)**
- id -> bulk_sync_batches.id (or external BATCH-### display id)
- deviceId -> devices.device_code or bulk_sync_batches.source
- packets -> bulk_sync_batches.total_records
- received -> bulk_sync_batches.inserted_records
- rejected -> bulk_sync_batches.failed_records
- duration -> finished_at - started_at
- timestamp -> bulk_sync_batches.started_at
- status -> bulk_sync_batches.status

**Public API Keys (Figma: PublicAPI.tsx apiKeys)**
- id -> api_keys.id
- name -> api_keys.name
- key -> returned only on creation; stored as hash in api_keys.key_hash
- created -> api_keys.created_at
- lastUsed -> api_keys.last_used_at
- requests -> derived from usage logs or API gateway metrics (future extension)

**Reports (Figma: Reports.tsx generatedReports)**
- id -> reports.id
- name -> reports.name
- type -> reports.report_type
- zone/dateRange -> reports.meta_json
- generated -> reports.generated_at
- avgAqi/highestPollution/waterAlerts -> reports.meta_json

**System Status (Figma: SystemStatus.tsx services)**
- name/status/uptime/cpu/memory -> system metrics cache or monitoring service, not stored in DB

**Settings (Figma: Settings.tsx)**
- Profile fields, notification toggles, and system configuration are planned for UserService and a future settings table

