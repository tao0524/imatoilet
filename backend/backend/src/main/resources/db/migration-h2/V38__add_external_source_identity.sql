ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source_key VARCHAR(100);
ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source_external_id VARCHAR(255);

UPDATE toilet
SET source_key = 'osm',
    source_external_id = REGEXP_REPLACE(
        source_url,
        '^https://www\.openstreetmap\.org/((node|way|relation)/[1-9][0-9]*)$',
        '\1'
    )
WHERE source_key IS NULL
  AND source_external_id IS NULL
  AND REGEXP_LIKE(source_url, '^https://www\.openstreetmap\.org/(node|way|relation)/[1-9][0-9]*$');

ALTER TABLE toilet
    ADD CONSTRAINT ck_toilet_external_identity_pair
    CHECK ((source_key IS NULL AND source_external_id IS NULL)
        OR (source_key IS NOT NULL AND source_external_id IS NOT NULL));

CREATE UNIQUE INDEX uq_toilet_external_identity
    ON toilet (source_key, source_external_id);
