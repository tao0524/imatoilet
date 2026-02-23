-- V3__add_search_indexes.sql
-- 検索パフォーマンス向上のためのインデックス追加

-- 1. 施設カテゴリ検索用 (WHERE facility_category = ?)
CREATE INDEX IF NOT EXISTS idx_toilet_facility_category 
ON toilet (facility_category);

-- 2. 清潔度フィルタリング用 (WHERE cleanliness >= ?)
CREATE INDEX IF NOT EXISTS idx_toilet_cleanliness 
ON toilet (cleanliness);

-- 3. 緯度経度用
CREATE INDEX IF NOT EXISTS idx_toilet_lat_lng 
ON toilet (lat, lng);

-- 4. 設備テーブルのタイプ検索用 (JOIN時の高速化)
CREATE INDEX IF NOT EXISTS idx_equipment_type 
ON equipment (type);

CREATE INDEX IF NOT EXISTS idx_equipment_toilet_id
ON equipment (toilet_id);
