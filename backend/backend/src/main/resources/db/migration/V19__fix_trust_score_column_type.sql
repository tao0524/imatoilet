-- V19__fix_trust_score_column_type.sql
-- trust_score カラムの型を NUMERIC から DOUBLE PRECISION に修正
-- 原因: V18で DECIMAL(5,1) で定義したが Hibernate の Double 型は DOUBLE PRECISION を期待する

ALTER TABLE toilet
    ALTER COLUMN trust_score TYPE DOUBLE PRECISION
    USING trust_score::DOUBLE PRECISION;
