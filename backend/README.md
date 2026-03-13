# Automated Environmental Gateway Backend

This backend powers the Automated Environmental Gateway system. It is organized for fast onboarding, clear module boundaries, and production readiness.

## Quick Start
1. Install dependencies:
   - `npm install`
2. Copy env file and fill in values:
   - `cp .env.example .env`
3. Run the server:
   - `npm run start`

## Environment Variables (.env)
These values keep secrets/config outside code and allow easy environment changes.

- `PORT`: Express server port (default 3000)
- `PG_HOST`: PostgreSQL host
- `PG_PORT`: PostgreSQL port
- `PG_USER`: PostgreSQL username
- `PG_PASSWORD`: PostgreSQL password
- `PG_DATABASE`: PostgreSQL database name

## PostgreSQL Connection
The backend uses a shared connection pool in `src/utils/db.ts`. All modules will reuse this pool to avoid opening new connections per request, which keeps performance stable under load.

## Folder Structure
- `src/`: Application source code
- `src/app.ts`: Express app with middleware and router mounting
- `src/server.ts`: Server bootstrap (loads config, verifies DB, starts HTTP server)
- `src/modules/`: 11 module stubs (controller/service/routes), aligned to Figma UI tabs
- `src/types/`: Shared DTOs and response envelope types, aligned to Figma field names
- `src/utils/`: Shared helpers (date range, validators, DB pool)
- `src/services/`: Shared data access helpers (example queries, DB abstractions)
- `scripts/`: One-off scripts (partition creation, seeding test data)
- `../docs/`: API reference and endpoint mapping

## Notes for Developers
- All routes are mounted under `/api/v1` in `src/app.ts`.
- Controllers are stubs by design; actual logic goes into services.
- DTOs are centralized in `src/types` so responses match Figma field names.
- The shared DB pool and config system make the backend production-friendly and testable.

