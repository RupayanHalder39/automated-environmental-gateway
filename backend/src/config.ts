import dotenv from "dotenv";

// Load environment variables from .env at process start.
// This keeps secrets/config out of source control and makes local/dev/prod setups consistent.
dotenv.config();

// Server port: controls which port Express listens on.
export const PORT = Number(process.env.PORT) || 3000;

// PostgreSQL connection details: used by the shared DB pool in utils/db.ts
export const PG_HOST = process.env.PG_HOST || "";
export const PG_PORT = Number(process.env.PG_PORT) || 5432;
export const PG_USER = process.env.PG_USER || "";
export const PG_PASSWORD = process.env.PG_PASSWORD || "";
export const PG_DATABASE = process.env.PG_DATABASE || "";

