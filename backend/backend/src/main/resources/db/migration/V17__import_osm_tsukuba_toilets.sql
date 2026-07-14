-- V17__import_osm_tsukuba_toilets.sql
-- Overpass API（つくば周辺 bounding box）から取得したOSMトイレデータのインポート
-- OSMタイムスタンプ: 2026-07-14T22:50:18Z
-- 元データ: 91件
-- indoor統合: -2件
-- 重複除外: -7件
-- 最終INSERT: 82件

BEGIN;

-- ============================================================
-- toilet テーブルへの INSERT
-- ============================================================

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0394346, 140.1370583, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/775502656', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0381565, 140.1383881, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/1077015412', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0317432, 140.0028046, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/2087802452', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1214886, 140.1535026, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/2211037745', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0954203, 140.1760601, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/2211048814', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0528638, 140.1291448, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3757157710', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0504143, 140.1320279, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3757157715', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.062407, 140.121571, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3794311093', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0618772, 140.1258613, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3843964042', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0593252, 140.1222208, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3856040395', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.216645, 139.987169, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3879214118', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1894489, 139.9437447, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/3977248553', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1518565, 140.1101894, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4162984792', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.21394, 140.0915904, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4181122131', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.2000488, 140.1110918, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4243791126', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.2094278, 140.1102544, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4243792888', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 35.9627495, 140.1777356, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4803115388', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 35.964173, 140.1747636, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4803122541', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1924331, 139.95081, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4811369816', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1995509, 139.9483451, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4811369817', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1014362, 140.1111627, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/4834208350', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1525622, 140.1185938, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5195384122', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0218161, 139.9888096, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5279146110', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0815944, 140.080902, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5298812184', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1665973, 140.1302048, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5316317422', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('仮設トイレ', 36.1949974, 140.0942707, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5470895143', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.2062619, 140.0807523, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5526427713', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1996616, 139.9483086, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5618914079', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1912494, 139.9524491, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/5618914093', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 35.9652671, 140.1310956, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/6182500589', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.02893, 140.0262471, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/6406984451', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0425332, 140.0290152, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/6406986868', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0639115, 140.1417681, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/6839486608', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.068206, 140.1302556, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/6924209401', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1884355, 139.9957481, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/7155846555', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1014478, 140.0657948, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/7415079673', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0791851, 140.0709827, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/7566104752', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 35.9754396, 140.1413385, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/9129455028', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1102981, 140.1002683, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/10083259972', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1101181, 140.0996534, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/10083279200', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.036018, 139.9849199, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/10750654605', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1644603, 140.1599442, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/11074628459', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.2128866, 140.0977281, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/11405084369', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1172719, 139.9741056, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/11818177790', '2024-04-12');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1124647, 139.980145, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/11892838841', '2024-05-10');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1887861, 139.9454085, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/12002374153', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1894439, 139.9438138, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/12084485094', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.187872, 139.9459672, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/12086516049', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1831916, 139.9557248, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/12172069387', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0184461, 139.9920957, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/12259923285', '2024-10-17');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1830081, 139.9584384, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/13072220030', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1821272, 139.9644549, null, false, 'commercial', null, 'OpenStreetMap', 'https://www.openstreetmap.org/node/13075312858', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.014449, 140.0984394, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/377924456', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1745428, 140.1038861, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/416042274', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0838016, 140.1112536, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/454879181', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1029786, 140.1129215, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/487097867', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1018929, 140.1131668, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/487097878', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 35.9633836, 140.1715152, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/536262458', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0229151, 139.9888432, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/546518657', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.01826, 139.9855953, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/547179561', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0854013, 140.0818598, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/557558599', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0540273, 140.1370432, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/636829532', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.096975, 140.0783145, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/673849707', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0405157, 140.02995, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/683935662', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0797903, 140.0797231, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/693002529', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1929625, 139.9930789, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/766167565', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0616967, 140.015255, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1079780371', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0774442, 140.1164146, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1116413574', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0825146, 140.1235984, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1116420574', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0824956, 140.1235529, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1116420575', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0913313, 140.1080364, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1118852535', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0969318, 140.1063366, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1160190116', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.2128164, 140.1735092, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1217581462', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0020821, 140.1153301, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1228559968', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0055726, 140.0297731, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1272425708', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1941493, 139.9452531, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1303643613', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1494049, 139.9921533, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1339209331', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.035051, 140.0772542, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1418330832', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1873544, 139.9640259, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1433747270', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.1840638, 139.9676208, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1507401863', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0866041, 140.1060818, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1509521768', '2026-07-14');

INSERT INTO toilet (name, lat, lng, address, public_use, facility_category, description, source, source_url, last_verified)
VALUES ('公衆トイレ', 36.0865897, 140.1060429, null, true, 'public', null, 'OpenStreetMap', 'https://www.openstreetmap.org/way/1509521769', '2026-07-14');

-- ============================================================
-- equipment テーブルへの INSERT
-- ============================================================

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/1077015412';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/3794311093';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/3856040395';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'DIAPER' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4803115388';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4803115388';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4811369816';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4811369817';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4834208350';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4834208350';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4834208350';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'UNISEX' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/4834208350';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/5279146110';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/5298812184';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/5316317422';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'UNISEX' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/5316317422';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/6839486608';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/node/11892838841';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/454879181';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/454879181';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/557558599';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/557558599';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'WHEELCHAIR' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/636829532';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/636829532';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'FREE' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/673849707';

INSERT INTO equipment (toilet_id, equipment_type)
SELECT t.id, 'GENDER_SEPARATED' FROM toilet t WHERE t.source_url = 'https://www.openstreetmap.org/way/673849707';

COMMIT;