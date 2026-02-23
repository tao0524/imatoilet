-- V4__insert_sample_data.sql
-- つくば駅周辺のリアルなトイレデータを投入（検索機能検証用）

BEGIN;

-- 既存のテストデータがあれば削除（ID 100未満をテストデータとみなす）
DELETE FROM equipment WHERE toilet_id < 100;
DELETE FROM toilet WHERE id < 100;

ALTER TABLE toilet ALTER COLUMN id RESTART WITH 1;
ALTER TABLE equipment ALTER COLUMN id RESTART WITH 1;

-- =========================================================
-- 1. Toiletテーブルへのデータ投入
-- ※ facility_category と equipment(CSV) をしっかり入れるのがポイント
-- =========================================================

INSERT INTO toilet (
  name, address, lat, lng, description, cleanliness, 
  facility_category, 
  public_use, wheelchair, diaper, open24h, 
  equipment -- フロントエンド用CSV
) VALUES 
-- 1. 駅周辺 (Station)
('つくば駅 多目的トイレ', '茨城県つくば市吾妻2丁目', 36.0833, 140.1120, 'TXつくば駅改札外、出口A3付近。広くて綺麗です。', 5, 'station', true, true, true, true, 'wheelchair,diaper,ostomate,washlet,open_24h'),
('つくば駅 北口公衆トイレ', '茨城県つくば市吾妻1丁目', 36.0840, 140.1125, 'バスターミナル近く。24時間利用可能。', 3, 'station', true, true, false, true, 'wheelchair,open_24h'),
('研究学園駅 バリアフリートイレ', '茨城県つくば市研究学園5丁目', 36.0815, 140.0820, '改札内と改札外にあります。', 4, 'station', true, true, true, true, 'wheelchair,diaper,washlet,open_24h'),

-- 2. 商業施設 (Commercial)
('BiViつくば 2Fトイレ', '茨城県つくば市吾妻1-8-10', 36.0828, 140.1115, '授乳室も併設されています。非常に清潔。', 5, 'commercial', true, true, true, false, 'wheelchair,diaper,nursing_room,washlet'),
('イーアスつくば フードコート横', '茨城県つくば市研究学園5-19', 36.0860, 140.0810, '家族連れに最適。オストメイト対応。', 4, 'commercial', true, true, true, false, 'wheelchair,diaper,ostomate,washlet,parking'),
('LALAガーデンつくば 東館', '茨城県つくば市小野崎278-1', 36.0750, 140.1050, '駐車場から近くて便利です。', 3, 'commercial', true, false, true, true, 'diaper,open_24h,parking'),

-- 3. 公園 (Park)
('つくば中央公園 トイレ', '茨城県つくば市吾妻2-7-5', 36.0855, 140.1130, '公園の中央付近。夜間も利用可。', 3, 'park', true, true, false, true, 'wheelchair,open_24h'),
('洞峰公園 管理棟トイレ', '茨城県つくば市二の宮2-20', 36.0580, 140.1250, '温水プール利用時にも便利。', 4, 'park', true, true, true, true, 'wheelchair,diaper,open_24h'),
('松見公園 公衆トイレ', '茨城県つくば市天久保1-4', 36.0950, 140.1100, '展望塔の近く。古いですが清掃されています。', 2, 'park', true, false, false, true, 'open_24h'),

-- 4. 医療・公共 (Public/Medical)
('筑波メディカルセンター病院', '茨城県つくば市天久保1-3-1', 36.0920, 140.1110, '正面玄関近く。オストメイト完備。', 5, 'medical', true, true, true, false, 'wheelchair,diaper,ostomate,washlet'),
('つくば市役所 本庁舎', '茨城県つくば市研究学園1-1-1', 36.0780, 140.0800, '誰でも利用可能な多目的トイレ。', 5, 'public', true, true, true, false, 'wheelchair,diaper,ostomate,visual_support'),

-- 5. 宿泊施設 (Hotel)
('ホテル日航つくば ロビー', '茨城県つくば市吾妻1-1364-1', 36.0825, 140.1135, '宿泊客以外も利用可（スタッフに要声掛け）。高級感あり。', 5, 'hotel_tourism', false, true, true, false, 'wheelchair,diaper,washlet'),
('オークラフロンティア ホテル', '茨城県つくば市吾妻1丁目', 36.0830, 140.1140, 'エントランス付近。', 4, 'hotel_tourism', false, true, false, false, 'wheelchair,washlet'),

-- 6. その他 (Other)
('セブンイレブン つくば吾妻店', '茨城県つくば市吾妻3丁目', 36.0880, 140.1150, '店員に声をかけてから利用してください。', 3, 'convenience', true, false, false, true, 'open_24h'),
('ENEOS つくば学園SS', '茨城県つくば市竹園1丁目', 36.0800, 140.1180, '給油のついでに利用可能。', 3, 'other', true, false, false, true, 'open_24h,parking');


-- =========================================================
-- 2. Equipmentテーブルへのデータ投入
-- ※ バックエンド検索(searchBySpecs)用。Toiletテーブルと整合性を取る。
-- =========================================================

INSERT INTO equipment (toilet_id, type)
SELECT id, 'WHEELCHAIR' FROM toilet WHERE equipment LIKE '%wheelchair%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'DIAPER' FROM toilet WHERE equipment LIKE '%diaper%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OSTOMATE' FROM toilet WHERE equipment LIKE '%ostomate%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'WASHLET' FROM toilet WHERE equipment LIKE '%washlet%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'NURSING_ROOM' FROM toilet WHERE equipment LIKE '%nursing_room%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OPEN_24H' FROM toilet WHERE equipment LIKE '%open_24h%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'PARKING' FROM toilet WHERE equipment LIKE '%parking%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'VISUAL_SUPPORT' FROM toilet WHERE equipment LIKE '%visual_support%';

COMMIT;