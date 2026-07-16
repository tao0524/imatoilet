-- V18__add_toilet_feedback.sql
-- toilet_feedbackテーブル新設 + toiletテーブルへのカラム追加

BEGIN;

-- 1. toilet_feedback テーブル作成
CREATE TABLE IF NOT EXISTS toilet_feedback (
    id          BIGSERIAL PRIMARY KEY,
    toilet_id   BIGINT NOT NULL REFERENCES toilet(id) ON DELETE CASCADE,
    feeling     VARCHAR(20) NOT NULL,
    issue_tags  VARCHAR(200),
    user_level  SMALLINT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. インデックス（直近30件取得の高速化）
CREATE INDEX IF NOT EXISTS idx_toilet_feedback_toilet_id_created_at
    ON toilet_feedback(toilet_id, created_at DESC);

-- 3. toiletテーブルへのカラム追加
ALTER TABLE toilet
    ADD COLUMN IF NOT EXISTS trust_score  DECIMAL(5,1),
    ADD COLUMN IF NOT EXISTS feedback_count INT NOT NULL DEFAULT 0;

COMMIT;
