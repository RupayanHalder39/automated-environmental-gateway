// UserService: optional settings and user management

import { db } from "../../utils/db";

async function ensureTables() {
  // Creates minimal tables if they do not exist.
  // This keeps the module functional without migrations during early development.
  await db.query(
    `CREATE TABLE IF NOT EXISTS users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       full_name TEXT NOT NULL,
       email TEXT NOT NULL UNIQUE,
       organization TEXT,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
     )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS user_settings (
       user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
       email_notifications BOOLEAN DEFAULT true,
       push_notifications BOOLEAN DEFAULT true,
       sms_alerts BOOLEAN DEFAULT false,
       weekly_reports BOOLEAN DEFAULT true,
       data_retention_days INTEGER DEFAULT 90,
       auto_backup BOOLEAN DEFAULT true,
       debug_mode BOOLEAN DEFAULT false
     )`
  );
}

export async function listUsers() {
  await ensureTables();
  const result = await db.query(`SELECT * FROM users ORDER BY created_at DESC`);
  return result.rows;
}

export async function getUserById(id: string) {
  await ensureTables();
  const result = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function createUser(payload: any) {
  await ensureTables();
  const result = await db.query(
    `INSERT INTO users (full_name, email, organization)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [payload.fullName, payload.email, payload.organization]
  );

  const userId = result.rows[0].id;
  await db.query(`INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [userId]);
  return result.rows[0];
}

export async function updateUser(id: string, payload: any) {
  await ensureTables();
  const result = await db.query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         email = COALESCE($3, email),
         organization = COALESCE($4, organization),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, payload.fullName, payload.email, payload.organization]
  );
  return result.rows[0] ?? null;
}

export async function disableUser(id: string) {
  await ensureTables();
  const result = await db.query(
    `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updateNotificationSettings(payload: any) {
  await ensureTables();
  const result = await db.query(
    `UPDATE user_settings
     SET email_notifications = COALESCE($2, email_notifications),
         push_notifications = COALESCE($3, push_notifications),
         sms_alerts = COALESCE($4, sms_alerts),
         weekly_reports = COALESCE($5, weekly_reports)
     WHERE user_id = $1
     RETURNING *`,
    [payload.userId, payload.emailNotifications, payload.pushNotifications, payload.smsAlerts, payload.weeklyReports]
  );
  return result.rows[0] ?? null;
}

export async function updateSystemSettings(payload: any) {
  await ensureTables();
  const result = await db.query(
    `UPDATE user_settings
     SET data_retention_days = COALESCE($2, data_retention_days),
         auto_backup = COALESCE($3, auto_backup),
         debug_mode = COALESCE($4, debug_mode)
     WHERE user_id = $1
     RETURNING *`,
    [payload.userId, payload.dataRetentionDays, payload.autoBackup, payload.debugMode]
  );
  return result.rows[0] ?? null;
}

