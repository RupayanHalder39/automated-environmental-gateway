# SyncService Plan

**Module Name**
SyncService

**Mapped UI Tab**
Bulk Data Sync

**Why this step exists (plain language)**
Some gateways may upload data in bulk after being offline. This service manages safe, traceable ingestion.

**How it maps to UI (plain language)**
The Bulk Data Sync tab shows ingestion batches, success rates, and errors. SyncService provides batch status and ingestion endpoints.

**Scalability and performance considerations (plain language)**
Bulk syncs can be huge. Use batching, streaming inserts, and conflict handling. Keep ingestion idempotent.

## UI Field Mapping (Figma Alignment)
Figma `BulkDataSync.tsx` uses:
- batchLogs: id, deviceId, packets, received, rejected, duration, timestamp, status
- syncData chart: time, received, rejected

DB mapping:
- id -> `bulk_sync_batches.id` (optionally BATCH-### display)
- deviceId -> `devices.device_code` or `bulk_sync_batches.source`
- packets -> `bulk_sync_batches.total_records`
- received -> `bulk_sync_batches.inserted_records`
- rejected -> `bulk_sync_batches.failed_records`
- duration -> `finished_at - started_at`
- timestamp -> `started_at`
- status -> `bulk_sync_batches.status`

## API Endpoints to Implement
- POST /sync/batches
- GET /sync/batches
- GET /sync/batches/:id
- POST /sync/batches/:id/ingest

## Data Flow / DB Queries
- bulk_sync_batches for batch metadata
- sensor_readings insert path with source = BULK_SYNC

Example query patterns:
- Create batch and track counters
- Insert readings in chunks using COPY or multi-row inserts

## Shared Utils Needed
- batchValidator
- ingestChunker
- conflictResolver (handles duplicates)

## Frontend Consumption
- Batch list uses /sync/batches
- Details uses /sync/batches/:id
- Upload workflow uses /sync/batches/:id/ingest

## Best Practices Built In
- Validate schema before ingest
- Use idempotent inserts (ON CONFLICT DO NOTHING)
- Update batch counters with transactions

