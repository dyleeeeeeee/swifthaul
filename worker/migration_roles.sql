-- Migration: Add role-based access control
-- Run: wrangler d1 execute swifthaul-db --remote --file=./migration_roles.sql

-- Add role column to admins (defaults to 'admin' for all existing accounts)
ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';

-- Add created_by column to parcels (nullable for pre-existing records)
ALTER TABLE parcels ADD COLUMN created_by TEXT REFERENCES admins(id);

-- After running this, create your super_admin via:
-- POST /api/auth/setup  { "email": "...", "name": "...", "password": "..." }
-- (endpoint auto-disables once a super_admin exists)
