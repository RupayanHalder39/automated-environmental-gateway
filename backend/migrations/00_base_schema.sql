-- Base schema for Automated Environmental Gateway
-- Includes locations, devices, sensors, alert_rules, alerts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  device_code TEXT UNIQUE NOT NULL,
  name TEXT,
  location_name TEXT,
  location_id UUID REFERENCES locations(id),
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  sensor_code TEXT UNIQUE NOT NULL,
  device_id INTEGER REFERENCES devices(id),
  sensor_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sensor_type TEXT,
  condition_json JSONB,
  conditions_json JSONB,
  location_ids UUID[],
  action_ids TEXT[],
  severity TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES alert_rules(id),
  sensor_id INTEGER REFERENCES sensors(id),
  device_id INTEGER REFERENCES devices(id),
  triggered_at TIMESTAMP DEFAULT NOW(),
  status TEXT,
  severity TEXT,
  message TEXT,
  context_json JSONB,
  resolved_at TIMESTAMP
);

-- Seed locations
INSERT INTO locations (id, name, slug) VALUES
  ('b7d6a4b2-73f6-4f2d-9d8a-5a4e5bb8e9a1', 'Salt Lake', 'salt-lake'),
  ('b1e6f9a9-b9d8-4d9d-9a0b-2e50c2a6b7dd', 'New Town', 'new-town')
ON CONFLICT (id) DO NOTHING;

-- Seed a device tied to Salt Lake
INSERT INTO devices (device_code, name, location_name, location_id, latitude, longitude, status)
VALUES ('GW-001', 'Gateway 001', 'Salt Lake', 'b7d6a4b2-73f6-4f2d-9d8a-5a4e5bb8e9a1', 22.5726, 88.4197, 'online')
ON CONFLICT (device_code) DO NOTHING;
