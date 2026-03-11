-- SwiftHaul D1 Schema
-- Run: wrangler d1 execute swifthaul-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS parcels (
  id               TEXT PRIMARY KEY,
  sender_name      TEXT NOT NULL,
  sender_address   TEXT NOT NULL,
  sender_country   TEXT NOT NULL,
  receiver_name    TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_country TEXT NOT NULL,
  weight_kg        REAL NOT NULL DEFAULT 0,
  dimensions       TEXT,
  service_type     TEXT NOT NULL DEFAULT 'STANDARD',
  declared_value   REAL DEFAULT 0,
  current_status   TEXT NOT NULL DEFAULT 'CREATED',
  eta              TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id         TEXT PRIMARY KEY,
  parcel_id  TEXT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  location   TEXT NOT NULL,
  description TEXT,
  timestamp  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parcels_status    ON parcels(current_status);
CREATE INDEX IF NOT EXISTS idx_parcels_created   ON parcels(created_at);
CREATE INDEX IF NOT EXISTS idx_events_parcel     ON tracking_events(parcel_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp  ON tracking_events(timestamp);

-- Seed admin (password: admin123)
-- bcrypt hash of "admin123" with 10 rounds
INSERT OR IGNORE INTO admins (id, email, name, password_hash)
VALUES (
  'admin-001',
  'admin@swifthaul.dev',
  'SwiftHaul Admin',
  '$2a$10$uhAvCsBh4/wxKSvZDcusMOSwLI81blXbrEtdayur3Jxl.U0Mz.oge'
);

-- Sample parcels for demo
INSERT OR IGNORE INTO parcels (id, sender_name, sender_address, sender_country, receiver_name, receiver_address, receiver_country, weight_kg, dimensions, service_type, declared_value, current_status, eta, created_at, updated_at)
VALUES
  ('SH-2024-DEMO01', 'Alice Johnson', '123 Main St, New York, NY 10001', 'United States', 'Bob Smith', '456 Oxford St, London W1D 1AN', 'United Kingdom', 2.5, '30x20x15', 'EXPRESS', 299.99, 'IN_TRANSIT', datetime('now', '+2 days'), datetime('now', '-3 days'), datetime('now', '-1 hour')),
  ('SH-2024-DEMO02', 'Carol Lee', '789 Rue de Rivoli, Paris 75001', 'France', 'David Kim', '321 Ginza, Tokyo 104-0061', 'Japan', 8.0, '50x40x30', 'STANDARD', 1200.00, 'DELIVERED', datetime('now', '-1 day'), datetime('now', '-10 days'), datetime('now', '-1 day')),
  ('SH-2024-DEMO03', 'Eve Brown', 'Alexanderplatz 1, Berlin 10178', 'Germany', 'Frank White', '88 Martin Place, Sydney 2000', 'Australia', 15.0, '60x50x40', 'FREIGHT', 3500.00, 'OUT_FOR_DELIVERY', datetime('now', '+1 day'), datetime('now', '-5 days'), datetime('now', '-2 hours'));

INSERT OR IGNORE INTO tracking_events (id, parcel_id, event_type, location, description, timestamp)
VALUES
  ('evt-001', 'SH-2024-DEMO01', 'CREATED',      'New York, USA',       'Shipment created and registered', datetime('now', '-3 days')),
  ('evt-002', 'SH-2024-DEMO01', 'PICKED_UP',    'New York, USA',       'Package collected from sender', datetime('now', '-3 days', '+4 hours')),
  ('evt-003', 'SH-2024-DEMO01', 'DEPARTED_HUB', 'JFK Airport, USA',    'Departed JFK sorting hub', datetime('now', '-2 days')),
  ('evt-004', 'SH-2024-DEMO01', 'IN_TRANSIT',   'Heathrow Hub, UK',    'Arrived Heathrow transit hub', datetime('now', '-1 day')),
  ('evt-005', 'SH-2024-DEMO02', 'CREATED',      'Paris, France',       'Shipment created', datetime('now', '-10 days')),
  ('evt-006', 'SH-2024-DEMO02', 'IN_TRANSIT',   'CDG Airport, France', 'International transit', datetime('now', '-8 days')),
  ('evt-007', 'SH-2024-DEMO02', 'DELIVERED',    'Tokyo, Japan',        'Package delivered to recipient', datetime('now', '-1 day'));
