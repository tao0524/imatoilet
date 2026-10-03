BEGIN;

ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source_key VARCHAR(100);
ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source_external_id VARCHAR(255);

-- Abort before modifying data if the exact OSM URLs would create an identity collision.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT source_key, source_external_id
            FROM toilet
            WHERE source_key IS NOT NULL AND source_external_id IS NOT NULL

            UNION ALL

            SELECT 'osm' AS source_key,
                   regexp_replace(
                       source_url,
                       '^https://www\.openstreetmap\.org/((node|way|relation)/[1-9][0-9]*)$',
                       '\1'
                   ) AS source_external_id
            FROM toilet
            WHERE source_key IS NULL
              AND source_external_id IS NULL
              AND source_url ~ '^https://www\.openstreetmap\.org/(node|way|relation)/[1-9][0-9]*$'
        ) prospective
        GROUP BY source_key, source_external_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot backfill external source identities: duplicate source_key/source_external_id detected';
    END IF;
END $$;

-- Only exact HTTPS OSM object URLs are trusted. Source display text is intentionally untouched.
UPDATE toilet
SET source_key = 'osm',
    source_external_id = regexp_replace(
        source_url,
        '^https://www\.openstreetmap\.org/((node|way|relation)/[1-9][0-9]*)$',
        '\1'
    )
WHERE source_key IS NULL
  AND source_external_id IS NULL
  AND source_url ~ '^https://www\.openstreetmap\.org/(node|way|relation)/[1-9][0-9]*$';

ALTER TABLE toilet
    ADD CONSTRAINT ck_toilet_external_identity_pair
    CHECK ((source_key IS NULL AND source_external_id IS NULL)
        OR (source_key IS NOT NULL AND source_external_id IS NOT NULL));

CREATE UNIQUE INDEX uq_toilet_external_identity
    ON toilet (source_key, source_external_id)
    WHERE source_key IS NOT NULL AND source_external_id IS NOT NULL;

COMMIT;
