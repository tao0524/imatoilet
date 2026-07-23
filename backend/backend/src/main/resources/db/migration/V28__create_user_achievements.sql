-- V28: 称号・バッジシステム（user_achievements テーブル + users.active_title）

BEGIN;

-- 称号解放記録テーブル
CREATE TABLE user_achievements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(128) NOT NULL REFERENCES users(id),
    achievement_key VARCHAR(50)  NOT NULL,
    unlocked_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, achievement_key)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- ユーザーが選択中の称号（アバター画面で設定）
ALTER TABLE users ADD COLUMN active_title VARCHAR(50);

COMMIT;
