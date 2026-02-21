-- V7__drop_boolean_flags.sql
-- Phase 2: Booleanフラグの完全廃止

BEGIN;

ALTER TABLE toilet DROP COLUMN IF EXISTS wheelchair;
ALTER TABLE toilet DROP COLUMN IF EXISTS diaper;
ALTER TABLE toilet DROP COLUMN IF EXISTS open24h;

COMMIT;