-- 1. users テーブルの weapon_enhancement を 3 に、purify_stone を 5 に更新
UPDATE users SET weapon_enhancement = 3, purify_stone = 5;

-- 2. user_inventory テーブルの 4種類の結晶の quantity を 50 に更新
UPDATE user_inventory SET quantity = 50 WHERE material_key IN ('crystal_nature', 'crystal_steel', 'crystal_pure', 'crystal_chaos');

MERGE INTO user_inventory (user_id, material_key, quantity, updated_at)
KEY (user_id, material_key)
SELECT id, 'crystal_nature', 50, NOW() FROM users;

MERGE INTO user_inventory (user_id, material_key, quantity, updated_at)
KEY (user_id, material_key)
SELECT id, 'crystal_steel', 50, NOW() FROM users;

MERGE INTO user_inventory (user_id, material_key, quantity, updated_at)
KEY (user_id, material_key)
SELECT id, 'crystal_pure', 50, NOW() FROM users;

MERGE INTO user_inventory (user_id, material_key, quantity, updated_at)
KEY (user_id, material_key)
SELECT id, 'crystal_chaos', 50, NOW() FROM users;
