import { db } from "../../utils/db";
import type { LocationDTO } from "../../types/location";
import { DEV_MODE } from "../../config";
import { listDevLocations } from "../../services/devData";

export async function listLocations(): Promise<LocationDTO[]> {
  if (DEV_MODE) return listDevLocations();

  const result = await db.query(
    `SELECT id, name, slug
     FROM locations
     ORDER BY name ASC`
  );

  return result.rows as LocationDTO[];
}
