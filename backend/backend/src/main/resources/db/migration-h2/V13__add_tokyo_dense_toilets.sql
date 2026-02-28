-- V13__add_tokyo_dense_toilets.sql
-- ピン密集時（クラスタリング）テスト用の超高密度データ（新宿駅南口周辺）

BEGIN;

INSERT INTO toilet (
  name, address, lat, lng, description, cleanliness,
  facility_category, public_use, equipment,
  source, source_url, last_verified
) VALUES
('新宿駅 南口公衆トイレ', '東京都新宿区新宿3-38-1', 35.689600, 139.700500, '新宿駅南口改札を出てすぐ。非常に混雑します。', 3, 'station', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'テストデータ（密集検証用）', NULL, '2026-02-28'),
('バスタ新宿 2Fトイレ', '東京都渋谷区千駄ヶ谷5-24-55', 35.688800, 139.700800, '高速バスターミナル内。広くて清潔です。', 5, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,WASHLET', 'テストデータ（密集検証用）', NULL, '2026-02-28'),
('新宿ミロード 3Fトイレ', '東京都新宿区西新宿1-1-3', 35.689200, 139.699800, '女性専用メイクルーム併設。', 4, 'commercial', true, 'WHEELCHAIR,WASHLET,GENDER_SEPARATED', 'テストデータ（密集検証用）', NULL, '2026-02-28'),
('ルミネ新宿 ルミネ1 4Fトイレ', '東京都新宿区西新宿1-1-5', 35.689400, 139.699500, 'ベビーチェア完備。おむつ替えに便利です。', 4, 'commercial', true, 'WHEELCHAIR,DIAPER,BABY_CHAIR,WASHLET', 'テストデータ（密集検証用）', NULL, '2026-02-28'),
('ルミネ新宿 ルミネ2 3Fトイレ', '東京都新宿区新宿3-38-2', 35.689000, 139.700200, '駅直結でアクセス良好ですが、休日は並びます。', 4, 'commercial', true, 'WHEELCHAIR,DIAPER,WASHLET', 'テストデータ（密集検証用）', NULL, '2026-02-28'),
('新宿駅 新南改札内トイレ', '東京都渋谷区千駄ヶ谷5-24-55', 35.689300, 139.700600, '改札内。新しくて快適です。', 5, 'station', false, 'WHEELCHAIR,DIAPER,OSTOMATE,WASHLET', 'テストデータ（密集検証用）', NULL, '2026-02-28');

-- Equipment テーブルへの反映（バックエンドの検索機能用）
INSERT INTO equipment (toilet_id, type)
SELECT id, 'WHEELCHAIR' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%WHEELCHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'DIAPER' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%DIAPER%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OSTOMATE' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%OSTOMATE%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'NURSING_ROOM' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%NURSING_ROOM%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'WASHLET' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%WASHLET%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'BABY_CHAIR' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%BABY_CHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'GENDER_SEPARATED' FROM toilet WHERE source = 'テストデータ（密集検証用）' AND equipment LIKE '%GENDER_SEPARATED%';

COMMIT;