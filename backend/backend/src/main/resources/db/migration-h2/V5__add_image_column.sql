-- V5__add_image_column.sql
-- 画像URLを保存するためのカラムを追加
-- URLは長くなる可能性があるため TEXT 型を採用

ALTER TABLE toilet ADD COLUMN IF NOT EXISTS image TEXT;