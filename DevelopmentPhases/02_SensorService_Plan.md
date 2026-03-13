# SensorService Plan

**Module Name**
SensorService

**Mapped UI Tab**
Dashboard (Real-Time Sensor Dashboard)

**Why this step exists (plain language)**
The dashboard needs fast, reliable snapshots of live environmental conditions. This service delivers recent sensor readings, aggregates, and status summaries without requiring the UI to know database details.

**How it maps to UI (plain language)**
The Dashboard tab surfaces current AQI, temperature, humidity, and water level for the city and key zones. SensorService is the backend source for those live tiles, the map markers, and the sensor details popup.

**Scalability and performance considerations (plain language)**
This service hits the highest-traffic endpoints. We must optimize for fast reads and avoid large scans, using indexed lookups and short time windows (last 5 to 30 minutes). Cache hot aggregates if needed.

## UI Field Mapping (Figma Alignment)
Figma `Dashboard.tsx` uses the following sensor fields:
- id -> `sensors.sensor_code`
- location -> `devices.location_name`
- lat / lng -> `devices.latitude` / `devices.longitude`
- aqi -> `sensor_readings.aqi` (latest)
- temperature -> `sensor_readings.temperature_c`
- humidity -> `sensor_readings.humidity_pct`
- waterLevel -> `sensor_readings.water_level_cm` (convert to meters if UI shows `m`)
- lastUpdate -> `sensor_readings.recorded_at` (format as relative time)
- status -> derived from `devices.status` or `devices.last_seen_at`

## API Endpoints to Implement
- GET /sensors
- GET /sensors/:id
- GET /sensors/:id/latest
- GET /sensors/latest?type=aqi|temperature|humidity|waterLevel
- GET /sensors/summary?range=15m
- GET /sensors/health

## Data Flow / DB Queries
- devices -> sensors (metadata joins)
- sensors -> sensor_readings (latest per sensor)
- Optional rollups from sensor_readings for last 5/15/60 minutes

Example query patterns:
- Latest reading per sensor (sensor_id, recorded_at DESC)
- Aggregated metrics by sensor_type for a time window

## Shared Utils Needed
- dateRangeBuilder (parses query time ranges)
- paginationBuilder (for large sensor lists)
- metricNormalizer (standardizes units or types)

## Frontend Consumption
- Dashboard cards call /sensors/latest and /sensors/summary
- Map or zone widgets query /sensors?type=...&status=...
- Sensor popup calls /sensors/:id/latest

## Best Practices Built In
- Separate controller, service, routes
- Validate query params (range, sensor_type)
- Pagination for lists
- Time-window limits to avoid wide scans
- Use indexed filters on sensor_id and recorded_at

