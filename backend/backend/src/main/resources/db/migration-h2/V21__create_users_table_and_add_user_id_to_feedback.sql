-- usersテーブル新設
CREATE TABLE users (
    id            VARCHAR(128) PRIMARY KEY,
    nickname      VARCHAR(50),
    total_exp     INTEGER NOT NULL DEFAULT 0,
    level         INTEGER NOT NULL DEFAULT 1,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- toilet_feedbackテーブルにuser_idカラム追加（NULLABLEで後方互換性を維持）
ALTER TABLE toilet_feedback
    ADD COLUMN user_id VARCHAR(128) REFERENCES users(id);

-- user_idでの検索用インデックス
CREATE INDEX idx_toilet_feedback_user_id ON toilet_feedback(user_id);
