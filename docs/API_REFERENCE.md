# Automated Environmental Gateway API Reference

This consolidated reference is built from the DevelopmentPhases plans and aligned to the approved Figma UI. It is intended for implementation and frontend integration.
DTOs live in `/Users/rupayan/automated-environmental-gateway/backend/src/types` and are referenced by all controllers.

## Conventions
- Base path: `/api/v1`
- Response envelope: `{ data, error }`
- All DTO names match Figma field names to reduce frontend mapping.

---

## 1) SensorService (Dashboard)
**UI Tab:** Dashboard

### Endpoints
- `GET /api/v1/sensors`
- `GET /api/v1/sensors/:id`
- `GET /api/v1/sensors/:id/latest`
- `GET /api/v1/sensors/latest?type=aqi|temperature|humidity|waterLevel`
- `GET /api/v1/sensors/summary?range=15m`
- `GET /api/v1/sensors/health`

### Example Response (SensorDTO)
```json
{
  "data": {
    "id": "SEN-001",
    "location": "Salt Lake",
    "lat": 22.5726,
    "lng": 88.4197,
    "aqi": 45,
    "temperature": 28,
    "humidity": 65,
    "waterLevel": 2.3,
    "lastUpdate": "2 min ago",
    "status": "online"
  }
}
```

### DB Tables
- `sensors`, `devices`, `sensor_readings`

---

## 2) DeviceService (Device Health)
**UI Tab:** Device Health

### Endpoints
- `GET /api/v1/devices`
- `GET /api/v1/devices/:id`
- `GET /api/v1/devices/:id/heartbeats?range=24h`
- `GET /api/v1/devices/health/summary`
- `PATCH /api/v1/devices/:id/status`

### Example Response (DeviceDTO)
```json
{
  "data": {
    "id": "GW-001",
    "location": "Salt Lake",
    "status": "online",
    "lastHeartbeat": "30 seconds ago",
    "signalStrength": 95,
    "batteryLevel": 87,
    "maintenance": false
  }
}
```

### DB Tables
- `devices`, `device_heartbeats`

---

## 3) HistoryService (Historical Data)
**UI Tab:** Historical Data

### Endpoints
- `GET /api/v1/history/readings?sensor_id=...&from=...&to=...`
- `GET /api/v1/history/aggregate?metric=...&from=...&to=...&interval=1h&location=...`
- `GET /api/v1/history/devices/:id/aggregate?from=...&to=...`
- `GET /api/v1/history/export?metric=...&from=...&to=...&location=...`

### Example Response (HistorySummaryDTO)
```json
{
  "data": {
    "average": 92.4,
    "highest": 165,
    "lowest": 41,
    "alertsTriggered": 12,
    "metric": "aqi",
    "unit": ""
  }
}
```

### DB Tables
- `sensor_readings`, `alerts`, `devices`

---

## 4) RuleService (Rules Engine)
**UI Tab:** Rules Engine

### Endpoints
- `GET /api/v1/rules`
- `GET /api/v1/rules/:id`
- `POST /api/v1/rules`
- `PATCH /api/v1/rules/:id`
- `DELETE /api/v1/rules/:id`

### Example Response (RuleDTO)
```json
{
  "data": {
    "id": "RULE-001",
    "name": "High Water Level Alert",
    "metric": "Water Level",
    "operator": ">",
    "threshold": 5,
    "location": "Sector V",
    "action": "Send Notification",
    "status": "active",
    "lastTriggered": "2 hours ago"
  }
}
```

### DB Tables
- `alert_rules`

---

## 5) AlertService (Alerts)
**UI Tab:** Alerts

### Endpoints
- `GET /api/v1/alerts?status=active`
- `GET /api/v1/alerts/:id`
- `PATCH /api/v1/alerts/:id/acknowledge`
- `PATCH /api/v1/alerts/:id/resolve`
- `GET /api/v1/alerts/summary`

### Example Response (AlertDTO)
```json
{
  "data": {
    "id": "ALT-001",
    "type": "critical",
    "message": "Dangerous AQI Level Detected",
    "location": "Park Street",
    "timestamp": "2026-03-13 14:32:15",
    "status": "active",
    "value": "AQI: 165"
  }
}
```

### DB Tables
- `alerts`, `alert_rules`, `devices`, `sensors`

---

## 6) AnomalyService (Data Sanity)
**UI Tab:** Data Sanity

### Endpoints
- `GET /api/v1/anomalies?range=24h`
- `GET /api/v1/anomalies/:id`
- `GET /api/v1/anomalies/summary`
- `GET /api/v1/anomalies/by-sensor/:sensor_id`
- `PATCH /api/v1/anomalies/settings`

### Example Response (AnomalyDTO)
```json
{
  "data": {
    "id": "ANO-001",
    "sensorId": "SEN-003",
    "invalidValue": "Temperature: 500°C",
    "expectedRange": "0°C - 50°C",
    "timestamp": "2026-03-13 14:23:45",
    "reason": "Temperature spike beyond physical limits",
    "severity": "high"
  }
}
```

### DB Tables
- `anomaly_logs`, `sensors`, `devices`

---

## 7) SyncService (Bulk Data Sync)
**UI Tab:** Bulk Data Sync

### Endpoints
- `POST /api/v1/sync/batches`
- `GET /api/v1/sync/batches`
- `GET /api/v1/sync/batches/:id`
- `POST /api/v1/sync/batches/:id/ingest`

### Example Response (SyncBatchDTO)
```json
{
  "data": {
    "id": "BATCH-001",
    "deviceId": "GW-003",
    "packets": 1200,
    "received": 1148,
    "rejected": 52,
    "duration": "3.2s",
    "timestamp": "2026-03-13 12:05:23",
    "status": "completed"
  }
}
```

### DB Tables
- `bulk_sync_batches`, `sensor_readings`

---

## 8) ApiKeyService (Public API)
**UI Tab:** Public API

### Endpoints
- `GET /api/v1/api-keys`
- `POST /api/v1/api-keys`
- `PATCH /api/v1/api-keys/:id/disable`
- `PATCH /api/v1/api-keys/:id/rotate`
- `GET /api/v1/public/aqi?location=SaltLake`
- `GET /api/v1/public/sensors`
- `GET /api/v1/public/historical?metric=temperature&days=7`

### Example Response (ApiKeyDTO)
```json
{
  "data": {
    "id": "1",
    "name": "Production API Key",
    "key": "aeg_prod_k8s9d7f6a5s4d3f2g1h",
    "created": "2026-02-15",
    "lastUsed": "2 hours ago",
    "requests": 15420
  }
}
```

### DB Tables
- `api_keys` (+ future API gateway usage logs)

---

## 9) ReportService (Reports)
**UI Tab:** Reports

### Endpoints
- `GET /api/v1/reports`
- `GET /api/v1/reports/:id`
- `POST /api/v1/reports`

### Example Response (ReportDTO)
```json
{
  "data": {
    "id": "REP-001",
    "name": "Weekly City Health Report - March Week 1",
    "type": "Weekly Summary",
    "zone": "All Zones",
    "dateRange": "Mar 1 - Mar 7, 2026",
    "generated": "2026-03-08",
    "avgAqi": 92,
    "highestPollution": "Park Street",
    "waterAlerts": 3
  }
}
```

### DB Tables
- `reports`, `sensor_readings`, `alerts`

---

## 10) SystemService (System Status)
**UI Tab:** System Status

### Endpoints
- `GET /api/v1/system/status`
- `GET /api/v1/system/metrics`
- `GET /api/v1/system/ingestion`

### Example Response (SystemStatusDTO)
```json
{
  "data": {
    "overallStatus": "All Systems Operational",
    "uptime": "15 days 8 hours",
    "services": [
      { "name": "Sensor Gateway Service", "status": "running", "uptime": "15 days 8 hours", "cpu": "12%", "memory": "340 MB" }
    ],
    "environment": "Production",
    "version": "v2.4.1",
    "deployment": "Docker"
  }
}
```

### DB Tables
- `devices`, `sensor_readings`, `bulk_sync_batches` (plus system metrics source)

---

## 11) UserService (Settings)
**UI Tab:** Settings

### Endpoints
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `PATCH /api/v1/users/:id/disable`
- `PATCH /api/v1/settings/notifications`
- `PATCH /api/v1/settings/system`

### Example Response (UserProfileDTO)
```json
{
  "data": {
    "fullName": "Admin User",
    "email": "admin@gateway.io",
    "organization": "Kolkata Smart City Initiative"
  }
}
```

### DB Tables
- `users`, `user_settings` (future extension)
