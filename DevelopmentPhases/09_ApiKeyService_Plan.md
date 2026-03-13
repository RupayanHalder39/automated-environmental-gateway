# ApiKeyService Plan

**Module Name**
ApiKeyService

**Mapped UI Tab**
Public API

**Why this step exists (plain language)**
External consumers need controlled access to read data. This service manages API keys, scopes, and rotation.

**How it maps to UI (plain language)**
The Public API tab shows API key lists, usage, and rate limit settings. ApiKeyService powers those actions and underpins public endpoints.

**Scalability and performance considerations (plain language)**
Key validation must be fast. Use hashed keys and indexes. Avoid storing raw keys.

## UI Field Mapping (Figma Alignment)
Figma `PublicAPI.tsx` uses:
- apiKeys: id, name, key, created, lastUsed, requests
- rate limits: Requests per Minute, Requests per Hour
- endpoints: `/api/v1/aqi?location=SaltLake`, `/api/v1/sensors`, `/api/v1/historical?metric=temperature&days=7`
- usageData: date, requests

DB mapping:
- id -> `api_keys.id`
- name -> `api_keys.name`
- key -> returned only on create; stored hashed in `api_keys.key_hash`
- created -> `api_keys.created_at`
- lastUsed -> `api_keys.last_used_at`
- requests -> derived from API gateway metrics (future extension)

Note: The design prompt also mentions `/public/aqi?location=SaltLake`. We can support `/public/*` as an alias to `/api/v1/*` for compatibility.

## API Endpoints to Implement
- GET /api-keys
- POST /api-keys
- PATCH /api-keys/:id/disable
- PATCH /api-keys/:id/rotate
- GET /public/aqi?location=...
- GET /public/sensors
- GET /public/historical?metric=...&days=...

## Data Flow / DB Queries
- api_keys table for key metadata
- sensor_readings and sensors for public data

Example query patterns:
- Active keys by name
- Update is_active and last_used_at

## Shared Utils Needed
- keyHasher
- scopeValidator
- paginationBuilder

## Frontend Consumption
- Key list uses /api-keys
- Create flow uses POST /api-keys
- Disable/rotate uses PATCH endpoints

## Best Practices Built In
- Never store raw keys
- Validate scopes
- Provide key only once on creation

