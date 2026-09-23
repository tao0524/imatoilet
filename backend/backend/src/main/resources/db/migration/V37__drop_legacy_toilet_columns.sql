-- V37: Entity/APIから先行削除済みの旧カラムをDBからも削除する
-- trust_score / feedback_countの元データを保持していたtoilet_feedbackはV36で削除済み。
-- created_byは旧ユーザー投稿者追跡用カラムである。
-- 本3カラムに依存するFK・index・constraintは存在しない。

ALTER TABLE toilet
    DROP COLUMN trust_score,
    DROP COLUMN feedback_count,
    DROP COLUMN created_by;
