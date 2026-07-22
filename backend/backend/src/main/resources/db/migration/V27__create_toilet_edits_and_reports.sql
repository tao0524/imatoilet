-- V27: 情報修正履歴テーブル + 通報テーブル作成

BEGIN;

-- 編集履歴テーブル
CREATE TABLE toilet_edits (
    id         BIGSERIAL PRIMARY KEY,
    toilet_id  BIGINT       NOT NULL REFERENCES toilet(id) ON DELETE CASCADE,
    user_id    VARCHAR(128) NOT NULL REFERENCES users(id),
    field_name VARCHAR(50)  NOT NULL,
    old_value  TEXT,
    new_value  TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_toilet_edits_toilet_id ON toilet_edits(toilet_id);
CREATE INDEX idx_toilet_edits_user_id   ON toilet_edits(user_id);

-- 通報テーブル
CREATE TABLE toilet_reports (
    id          BIGSERIAL PRIMARY KEY,
    toilet_id   BIGINT       NOT NULL REFERENCES toilet(id) ON DELETE CASCADE,
    user_id     VARCHAR(128) NOT NULL REFERENCES users(id),
    category    VARCHAR(30)  NOT NULL,
    comment     TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_toilet_reports_toilet_id ON toilet_reports(toilet_id);
CREATE INDEX idx_toilet_reports_status    ON toilet_reports(status);

COMMIT;
