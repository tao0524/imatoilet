-- Fix column type mismatch: SMALLINT -> INTEGER (Hibernate expects int4)
ALTER TABLE users ALTER COLUMN story_chapter TYPE INTEGER;
ALTER TABLE users ALTER COLUMN story_scene TYPE INTEGER;
