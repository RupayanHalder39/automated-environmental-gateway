-- Create locations table (immutable UUIDs)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Add location_id to devices for relational integrity
ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Add multi-condition columns to alert_rules
ALTER TABLE alert_rules
  ADD COLUMN IF NOT EXISTS conditions_json JSONB,
  ADD COLUMN IF NOT EXISTS location_ids UUID[],
  ADD COLUMN IF NOT EXISTS action_ids TEXT[];

-- Example backfill (adjust to your existing data)
-- Map device.location_name -> locations.slug, then set devices.location_id
-- UPDATE devices d
-- SET location_id = l.id
-- FROM locations l
-- WHERE lower(regexp_replace(d.location_name, '[^a-z0-9]+', '-', 'g')) = l.slug;

-- Backfill alert_rules from legacy condition_json if needed
-- UPDATE alert_rules
-- SET conditions_json = jsonb_build_array(
--       jsonb_build_object(
--         'metric', sensor_type,
--         'operator', condition_json->>'op',
--         'threshold', (condition_json->>'value')::numeric
--       )
--     ),
--     location_ids = ARRAY[
--       (SELECT l.id FROM locations l
--        WHERE l.slug = lower(regexp_replace(condition_json->>'location', '[^a-z0-9]+', '-', 'g'))
--        LIMIT 1)
--     ],
--     action_ids = ARRAY[
--       CASE
--         WHEN condition_json->>'action' ILIKE '%warning%' THEN 'warning'
--         WHEN condition_json->>'action' ILIKE '%log%' THEN 'log'
--         ELSE 'notification'
--       END
--     ]
-- WHERE conditions_json IS NULL;
