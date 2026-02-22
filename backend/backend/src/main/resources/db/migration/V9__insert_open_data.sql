-- V9__insert_open_data.sql
-- つくば市バリアフリーマップ登録施設から取り込み
-- 出典: つくば市バリアフリーマップ (https://www.city.tsukuba.lg.jp/)
-- 対象: 多目的トイレあり かつ トイレのみ利用許可の施設

BEGIN;

INSERT INTO toilet (
  name, address, lat, lng, description, cleanliness,
  facility_category, public_use, equipment,
  source, source_url, last_verified
) VALUES
('ローソンつくば小茎店', '茨城県つくば市小茎294-1', 36.018, 140.1347, '多目的トイレあり。', 3, 'convenience', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ローソンつくば筑穂二丁目', '茨城県つくば市筑穂2-2-5', 36.0765, 140.0674, '多目的トイレあり。', 3, 'convenience', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ローソン新つくば妻木店', '茨城県つくば市妻木216-1', 36.0888, 140.1087, '多目的トイレあり。', 3, 'convenience', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ローソンつくば東新井店', '茨城県つくば市東新井24-14', 36.0829, 140.1155, '多目的トイレあり。', 3, 'convenience', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ホテルベストランド', '茨城県つくば市研究学園五丁目8番地4', 36.0812, 140.0861, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。バリアフリー対応の部屋が3室あり', 4, 'hotel_tourism', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ホテルマークワンつくば研究学園', '茨城県つくば市研究学園5丁目13番地5', 36.0776, 140.0855, '多目的トイレあり。スロープあり、オストメイト対応、障害者駐車場あり。障害者用駐車場利用', 4, 'hotel_tourism', true, 'WHEELCHAIR,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ホテルグランド東雲', '茨城県つくば市小野崎488-1', 36.0721, 140.1039, '多目的トイレあり。授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'hotel_tourism', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ヨークベニマル　つくば竹園店', '茨城県つくば市竹園１－３－１', 36.079, 140.1194, '多目的トイレあり。オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('イーアスつくば', '茨城県つくば市研究学園5丁目19番地', 36.0781, 140.0785, '多目的トイレあり。スロープあり、オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくばクレオスクエア', '茨城県つくば市吾妻1-6-1', 36.0805, 140.1093, '多目的トイレあり。スロープあり、オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('ＬＡＬＡガーデンつくば', '茨城県つくば市小野崎字千駄苅278-1', 36.0785, 140.1098, '多目的トイレあり。スロープあり、オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('株式会社とりせん研究学園店', '茨城県つくば市研究学園5-18-1', 36.0784, 140.0783, '多目的トイレあり。ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　筑波店', '茨城県つくば市北条内町裏５１４４', 36.222, 140.1976, '多目的トイレあり。ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　フードスクエア学園店', '茨城県つくば市竹園２丁目１２－１', 36.0796, 140.1179, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　テクノパーク桜店', '茨城県つくば市桜１丁目２２番地', 36.0451, 140.0933, '多目的トイレあり。ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　みどりの駅前店', '茨城県つくば市みどりの１丁目３－１', 36.0857, 140.058, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　フードスクエアつくばスタイル店', '茨城県つくば市研究学園５丁目１９番', 36.0769, 140.0797, '多目的トイレあり。オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　万博記念公園駅前店', '茨城県つくば市島名福田坪土地区画整理地48街区', 36.0557, 140.0305, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　フードスクエア学園の森店', '茨城県つくば市学園の森２丁目３４－４', 36.0811, 140.0809, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　筑波大学店', '茨城県つくば市天久保３丁目１－１０', 36.0991, 140.1074, '多目的トイレあり。オストメイト対応、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('カスミ　プルシェつくばキュート店', '茨城県つくば市吾妻１－６－１', 36.0809, 140.1109, '多目的トイレあり。授乳室あり、ベビーシートあり、障害者駐車場あり。', 3, 'commercial', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくば駅', '茨城県つくば市吾妻2-128', 36.0857, 140.1114, '多目的トイレあり。オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('研究学園駅', '茨城県つくば市研究学園5-9-1', 36.0851, 140.0787, '多目的トイレあり。オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('万博記念公園駅', '茨城県つくば市島名4386', 36.0589, 140.0367, '多目的トイレあり。スロープあり、オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('みどりの駅', '茨城県つくば市みどりの1-29-3', 36.082, 140.0519, '多目的トイレあり。オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('北１駐車場', '茨城県つくば市吾妻2-4-6', 36.0797, 140.1081, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('南２駐車場', '茨城県つくば市吾妻1-12-10', 36.0877, 140.1084, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('南１駐車場', '茨城県つくば市吾妻1-5-1', 36.0873, 140.112, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくば文化会館アルス（中央図書館）', '茨城県つくば市吾妻2-8', 36.0807, 140.1107, '多目的トイレあり。スロープあり、オストメイト対応、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくば市役所', '茨城県つくば市研究学園1-1-1', 36.0745, 140.0836, '多目的トイレあり。オストメイト対応、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('大穂窓口センター', '茨城県つくば市筑穂1-10-4', 36.0753, 140.0625, '多目的トイレあり。スロープあり、オストメイト対応、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('茎崎窓口センター', '茨城県つくば市小茎320', 36.0167, 140.1291, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('谷田部保健センター', '茨城県つくば市谷田部4774-18', 36.0505, 140.1278, '多目的トイレあり。スロープあり、授乳室あり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('桜保健センター', '茨城県つくば市流星台61-1', 36.0842, 140.0917, '多目的トイレあり。スロープあり、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくばカピオ', '茨城県つくば市竹園1-10-1', 36.0799, 140.1123, '多目的トイレあり。スロープあり、オストメイト対応、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('市民ホールやたべ', '茨城県つくば市谷田部4711', 36.0482, 140.126, '多目的トイレあり。スロープあり、授乳室あり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波交流センター', '茨城県つくば市北条5060', 36.2184, 140.2006, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('松代交流センター', '茨城県つくば市松代4-16-3', 36.0739, 140.1208, '多目的トイレあり。スロープあり、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('竹園交流センター', '茨城県つくば市竹園3-19-2', 36.0752, 140.1116, '多目的トイレあり。授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('二の宮交流センター', '茨城県つくば市二の宮4-6-2', 36.0756, 140.1196, '多目的トイレあり。スロープあり、授乳室あり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('大穂交流センター', '茨城県つくば市筑穂1-10-4', 36.0735, 140.0633, '多目的トイレあり。スロープあり、授乳室あり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,NURSING_ROOM,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('宝篋山小田休憩所', '茨城県つくば市小田4544', 36.2076, 140.166, '多目的トイレあり。', 4, 'public', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波山梅林休憩所トイレ', '茨城県つくば市沼田1435-56', 36.225, 140.0992, '多目的トイレあり。スロープあり。', 4, 'public', true, 'WHEELCHAIR', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('市営筑波山第1駐車場トイレ', '茨城県つくば市沼田1698番地1', 36.2301, 140.0976, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('市営筑波山第2駐車場トイレ', '茨城県つくば市筑波1222', 36.2247, 140.1014, '多目的トイレあり。スロープあり、オストメイト対応、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,OSTOMATE,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('市営筑波山第3駐車場トイレ', '茨城県つくば市筑波1108', 36.228, 140.1034, '多目的トイレあり。スロープあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波山御幸が原トイレ(女体山側)', '茨城県つくば市筑波1', 36.2209, 140.1086, '多目的トイレあり。スロープあり。', 4, 'public', true, 'WHEELCHAIR', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波山御幸が原トイレ(男体山側)', '茨城県つくば市筑波1', 36.2236, 140.1085, '多目的トイレあり。スロープあり、オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波山おもてなし館', '茨城県つくば市沼田1690-3', 36.2331, 140.1005, '多目的トイレあり。スロープあり、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('筑波窓口センター', '茨城県つくば市北条5060', 36.2243, 140.199, '多目的トイレあり。スロープあり、ベビーシートあり、障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('研究学園駅前公園', '茨城県つくば市学園南2丁目1', 36.0839, 140.0772, '多目的トイレあり。障害者駐車場あり。', 4, 'public', true, 'WHEELCHAIR,PARKING', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('つくば駅前広場', '茨城県つくば市吾妻1-121', 36.0792, 140.111, '多目的トイレあり。オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21'),
('研究学園駅前広場', '茨城県つくば市研究学園5-111', 36.083, 140.0822, '多目的トイレあり。オストメイト対応、ベビーシートあり。', 4, 'public', true, 'WHEELCHAIR,DIAPER,OSTOMATE', 'つくば市バリアフリーマップ', 'https://www.city.tsukuba.lg.jp/', '2026-02-21');

-- Equipment テーブルへの反映
INSERT INTO equipment (toilet_id, type)
SELECT id, 'WHEELCHAIR' FROM toilet WHERE source = 'つくば市バリアフリーマップ' AND equipment LIKE '%WHEELCHAIR%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'DIAPER' FROM toilet WHERE source = 'つくば市バリアフリーマップ' AND equipment LIKE '%DIAPER%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'OSTOMATE' FROM toilet WHERE source = 'つくば市バリアフリーマップ' AND equipment LIKE '%OSTOMATE%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'NURSING_ROOM' FROM toilet WHERE source = 'つくば市バリアフリーマップ' AND equipment LIKE '%NURSING_ROOM%';

INSERT INTO equipment (toilet_id, type)
SELECT id, 'PARKING' FROM toilet WHERE source = 'つくば市バリアフリーマップ' AND equipment LIKE '%PARKING%';

COMMIT;