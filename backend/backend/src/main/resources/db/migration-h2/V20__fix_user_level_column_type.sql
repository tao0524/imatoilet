-- V20: Fix user_level column type from SMALLINT to INTEGER in toilet_feedback table
ALTER TABLE toilet_feedback ALTER COLUMN user_level INTEGER;
