-- 幻影の扉用カラム
ALTER TABLE users ADD COLUMN held_phantom_door_enemy_id VARCHAR(32);
ALTER TABLE users ADD COLUMN last_phantom_door_date DATE;