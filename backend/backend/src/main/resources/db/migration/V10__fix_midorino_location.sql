-- V10__fix_midorino_location.sql
BEGIN;
UPDATE toilet
SET lat = 36.0357
WHERE name = 'カスミ　みどりの駅前店';

UPDATE toilet
SET lat = 36.0320
WHERE name = 'みどりの駅';
COMMIT;
