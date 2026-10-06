CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organisations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venues (
  id text PRIMARY KEY,
  organisation_id uuid REFERENCES organisations(id) ON DELETE SET NULL,
  name text NOT NULL,
  center geography(Point,4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_floors (
  id uuid PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  level integer NOT NULL,
  label text NOT NULL,
  height_meters double precision NOT NULL DEFAULT 3.2,
  UNIQUE(venue_id,level)
);

CREATE TABLE IF NOT EXISTS venue_points (
  id text PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  floor integer NOT NULL,
  kind text NOT NULL,
  label text NOT NULL,
  x double precision NOT NULL,
  y double precision NOT NULL,
  z double precision NOT NULL DEFAULT 0,
  section text,
  row_label text,
  seat_label text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS venue_points_venue_floor_idx ON venue_points(venue_id,floor);
CREATE INDEX IF NOT EXISTS venue_points_kind_idx ON venue_points(kind);

CREATE TABLE IF NOT EXISTS venue_edges (
  id uuid PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  from_point_id text NOT NULL REFERENCES venue_points(id) ON DELETE CASCADE,
  to_point_id text NOT NULL REFERENCES venue_points(id) ON DELETE CASCADE,
  distance_meters double precision,
  accessible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id text PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  floor integer NOT NULL,
  label text NOT NULL,
  qr_value text UNIQUE,
  marker_asset_url text,
  marker_width_meters double precision,
  venue_x double precision NOT NULL,
  venue_y double precision NOT NULL,
  venue_z double precision NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz
);

CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section text NOT NULL,
  row_label text NOT NULL,
  seat_label text NOT NULL,
  holder_name text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS mapping_versions (
  id uuid PRIMARY KEY,
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  version integer NOT NULL,
  published boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id,version)
);

CREATE TABLE IF NOT EXISTS navigation_events (
  id bigserial PRIMARY KEY,
  venue_id text,
  event_name text NOT NULL,
  session_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
