-- V8__add_source_columns.sql
-- データ出典管理カラムの追加
-- 面接・デモで「データ品質を意識した設計」をアピールするための拡張

BEGIN;

ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE toilet ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE toilet ADD COLUMN IF NOT EXISTS last_verified DATE;

-- 既存のV4サンプルデータに出典を設定
UPDATE toilet
SET source = 'サンプルデータ（要確認）',
    source_url = NULL,
    last_verified = '2026-02-21'
WHERE source IS NULL;

COMMIT;