import crypto from "crypto";

// Hashes API keys before storage.
// Storing only hashes keeps keys safe if the database is ever exposed.
export function keyHasher(rawKey: string) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

// Generates a random API key string to return once to the caller.
export function generateApiKey(prefix = "aeg") {
  const token = crypto.randomBytes(24).toString("hex");
  return `${prefix}_${token}`;
}

