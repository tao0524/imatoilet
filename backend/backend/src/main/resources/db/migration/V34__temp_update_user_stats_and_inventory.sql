-- 1. users テーブルの weapon_enhancement を 3 に、purify_stone を 5 に更新
UPDATE users SET weapon_enhancement = 3, purify_stone = 5;

-- 2. user_inventory テーブルの 4種類の結晶の quantity を 50 に更新
UPDATE user_inventory SET quantity = 50 WHERE material_key IN ('crystal_nature', 'crystal_steel', 'crystal_pure', 'crystal_chaos');

-- 全ユーザーに対して4種類の結晶がなければ 50 で補給
INSERT INTO user_inventory (user_id, material_key, quantity, updated_at)
SELECT id, 'crystal_nature', 50, NOW() FROM users
ON CONFLICT (user_id, material_key) DO UPDATE SET quantity = 50, updated_at = NOW();

INSERT INTO user_inventory (user_id, material_key, quantity, updated_at)
SELECT id, 'crystal_steel', 50, NOW() FROM users
ON CONFLICT (user_id, material_key) DO UPDATE SET quantity = 50, updated_at = NOW();

INSERT INTO user_inventory (user_id, material_key, quantity, updated_at)
SELECT id, 'crystal_pure', 50, NOW() FROM users
ON CONFLICT (user_id, material_key) DO UPDATE SET quantity = 50, updated_at = NOW();

INSERT INTO user_inventory (user_id, material_key, quantity, updated_at)
SELECT id, 'crystal_chaos', 50, NOW() FROM users
ON CONFLICT (user_id, material_key) DO UPDATE SET quantity = 50, updated_at = NOW();
