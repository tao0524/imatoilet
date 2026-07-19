-- V23: デイリークエスト用テーブル作成

-- テーブル1: daily_quests（当日のクエストセット・1日1行）
CREATE TABLE daily_quests (
    id          SERIAL PRIMARY KEY,
    quest_date  DATE        NOT NULL UNIQUE,
    quest_type_1 VARCHAR(30) NOT NULL,
    quest_type_2 VARCHAR(30) NOT NULL,
    quest_type_3 VARCHAR(30) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- テーブル2: user_quest_progress（ユーザーごとの達成状況）
CREATE TABLE user_quest_progress (
    id           SERIAL PRIMARY KEY,
    user_id      VARCHAR(128)  NOT NULL REFERENCES users(id),
    quest_date   DATE          NOT NULL,
    slot         INTEGER       NOT NULL CHECK (slot BETWEEN 1 AND 3),
    completed    BOOLEAN       NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE (user_id, quest_date, slot)
);

-- インデックス: 「今日の自分の進捗を全部取得」用
CREATE INDEX idx_user_quest_progress_user_date
    ON user_quest_progress (user_id, quest_date);
