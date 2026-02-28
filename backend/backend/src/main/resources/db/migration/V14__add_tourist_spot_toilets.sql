-- V14__add_tourist_spot_toilets.sql
-- 観光地（浅草、京都、鎌倉）のテストデータ追加
-- 多様なユーザー層（家族連れ、高齢者、外国人など）の検索ユースケース検証用

BEGIN;

INSERT INTO toilet (
  name, address, lat, lng, description, cleanliness,
  facility_category, public_use, equipment,
  source, source_url, last_verified
) VALUES
('浅草文化観光センター', '東京都台東区雷門2-18-9', 35.710600, 139.796600, '雷門の目の前。授乳室やおむつ替え台があり、赤ちゃん連れに非常に便利です。多言語対応。', 5, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,BABY_CHAIR,WASHLET', '観光地テストデータ', NULL, '2026-02-28'),
('浅草寺 境内公衆トイレ', '東京都台東区浅草2-3-1', 35.714700, 139.796700, '境内にある公衆トイレ。車椅子対応ですが、休日は非常に混雑します。', 3, 'hotel_tourism', true, 'WHEELCHAIR,DIAPER,WASHLET,GENDER_SEPARATED', '観光地テストデータ', NULL, '2026-02-28'),
('京都駅 中央口公衆トイレ', '京都府京都市下京区烏丸通塩小路下ル東塩小路町', 34.985400, 135.757700, '新幹線や各線の乗り換え前に便利。24時間利用可能で設備が充実しています。', 4, 'station', true, 'WHEELCHAIR,DIAPER,OSTOMATE,WASHLET,OPEN_24H,BABY_CHAIR', '観光地テストデータ', NULL, '2026-02-28'),
('清水寺 参道公衆トイレ', '京都府京都市東山区清水1-294', 34.994800, 135.785000, '清水の舞台へ向かう途中にあります。和式と洋式が混在しています。', 3, 'hotel_tourism', true, 'WHEELCHAIR,GENDER_SEPARATED', '観光地テストデータ', NULL, '2026-02-28'),
('鶴岡八幡宮 参拝者休憩所トイレ', '神奈川県鎌倉市雪ノ下2-1-31', 35.326000, 139.556400, '境内の休憩所に併設されています。ベビーチェア完備で家族連れも安心。', 4, 'hotel_tourism', true, 'WHEELCHAIR,DIAPER,BABY_CHAIR,GENDER_SEPARATED', '観光地テストデータ', NULL, '2026-02-28'),
('鎌倉駅 東口公衆トイレ', '神奈川県鎌倉市小町1-1-1', 35.319000, 139.550400, '観光の拠点。多目的トイレがありますが、観光シーズンは行列ができます。', 3, 'station', true, 'WHEELCHAIR,DIAPER,OSTOMATE', '観光地テストデータ', NULL, '2026-02-28');

-- Equipment テーブルへの反映（バックエンドの検索機能用）
INSERT INTO equipment (toilet_id, type)
SELECT id, 'WHEELCHAIR' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%WHEELCHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'DIAPER' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%DIAPER%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OSTOMATE' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%OSTOMATE%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'NURSING_ROOM' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%NURSING_ROOM%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'BABY_CHAIR' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%BABY_CHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'WASHLET' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%WASHLET%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'GENDER_SEPARATED' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%GENDER_SEPARATED%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OPEN_24H' FROM toilet WHERE source = '観光地テストデータ' AND equipment LIKE '%OPEN_24H%';

COMMIT;