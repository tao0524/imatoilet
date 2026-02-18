-- V6__add_baby_chair_equipment.sql
-- EquipmentType enum に BABY_CHAIR を追加
-- DBのequipmentテーブルは type を VARCHAR(50) で格納しているため
-- テーブル定義の変更は不要。アプリ側のEnumに追加するだけで有効になる。
--
-- このMigrationでは以下を行う:
--   1. equipment.type のCHECK制約が存在する場合は拡張する
--   2. 既存データに影響なし（新規INSERT時からBABY_CHAIRが使用可能になる）

-- equipment テーブルの type カラムに CHECK 制約がある場合のみ更新が必要。
-- V2で作成したテーブルは CHECK 制約なし（VARCHAR(50)のみ）のため、
-- 追加のDDL変更は不要。このファイルはFlywayのバージョン記録のためのマーカー。

-- 念のため確認用コメント: 現在有効なEquipmentType一覧
-- WHEELCHAIR, DIAPER, OSTOMATE, WASHLET, NURSING_ROOM,
-- BABY_CHAIR (★今回追加), VISUAL_SUPPORT, GENDER_SEPARATED,
-- UNISEX, FREE, PAID, OPEN_24H, PARKING

SELECT 1; -- Flywayが空ファイルをエラーにするため、ダミーSELECTを置く