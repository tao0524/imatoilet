-- V15__add_national_scale_toilets.sql
-- アプリの全国スケール展開（ズームアウト時のクラスタリングや長距離検索）を検証するための遠方データ（北海道・福岡）

BEGIN;

INSERT INTO toilet (
  name, address, lat, lng, description, cleanliness,
  facility_category, public_use, equipment,
  source, source_url, last_verified
) VALUES
-- 北海道エリア
('札幌駅 南口公衆トイレ', '北海道札幌市北区北6条西4丁目', 43.068600, 141.350800, '寒冷地仕様で二重扉になっています。広くて清潔です。', 4, 'station', true, 'WHEELCHAIR,DIAPER,OSTOMATE,WASHLET', '全国スケールテストデータ', NULL, '2026-02-28'),
('道の駅 サーモンパーク千歳 トイレ', '北海道千歳市花園2丁目4-2', 42.837800, 141.662700, '長距離ドライブの休憩に最適。広大な駐車場と24時間利用可能な清潔なトイレがあります。', 5, 'public', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING,OPEN_24H', '全国スケールテストデータ', NULL, '2026-02-28'),

-- 福岡エリア
('福岡空港 国内線ターミナル トイレ', '福岡県福岡市博多区下臼井778-1', 33.585500, 130.448500, '多言語対応の案内板あり。旅行者や出張者に優しい最新設備が揃っています。', 5, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,WASHLET,NURSING_ROOM,BABY_CHAIR', '全国スケールテストデータ', NULL, '2026-02-28'),
('JR博多駅 筑紫口公衆トイレ', '福岡県福岡市博多区博多駅中央街1-1', 33.589800, 130.422000, '九州の玄関口。利用者が多いですが、定期的に清掃が行き届いています。', 4, 'station', true, 'WHEELCHAIR,DIAPER,WASHLET', '全国スケールテストデータ', NULL, '2026-02-28');


-- Equipment テーブルへの反映（バックエンドの検索機能用）
INSERT INTO equipment (toilet_id, type)
SELECT id, 'WHEELCHAIR' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%WHEELCHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'DIAPER' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%DIAPER%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OSTOMATE' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%OSTOMATE%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'NURSING_ROOM' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%NURSING_ROOM%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'BABY_CHAIR' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%BABY_CHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'WASHLET' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%WASHLET%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'PARKING' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%PARKING%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OPEN_24H' FROM toilet WHERE source = '全国スケールテストデータ' AND equipment LIKE '%OPEN_24H%';

COMMIT;