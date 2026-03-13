import { Pool } from "pg";
import { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE } from "../config";

// Shared PostgreSQL pool.
// This pool is reused across all services to avoid opening a new connection per request.
export const db = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DATABASE,
});

// Simple startup check to ensure DB connectivity before serving requests.
export async function testConnection() {
  const result = await db.query("SELECT NOW() AS now");
  return result.rows[0];
}

