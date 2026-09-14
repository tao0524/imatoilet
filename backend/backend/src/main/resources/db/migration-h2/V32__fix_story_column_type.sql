-- Fix column type mismatch: SMALLINT -> INTEGER (Hibernate expects int4) (H2用)
ALTER TABLE users
ALTER COLUMN story_chapter SET DATA TYPE INTEGER;

ALTER TABLE users
ALTER COLUMN story_scene SET DATA TYPE INTEGER;
