# OSM → toilet テーブル マッピング案（ドラフト）

> 作成日: 2026-07-15
> ステータス: **ドラフト（要ユーザー確認）**

---

## 基本マッピング

| # | toilet カラム | OSM タグ | 変換ロジック | 備考 |
|---|---|---|---|---|
| 1 | **name** | `name` | あれば採用。なければ **要検討**（下記参照） | 91件中90件に name がない |
| 2 | **lat** | `lat`（node）/ `center.lat`（way） | そのまま | 全件座標あり |
| 3 | **lng** | `lon`（node）/ `center.lon`（way） | そのまま | ※OSMは `lon`、バックエンドは `lng` |
| 4 | **address** | — | `null` | OSMデータに `addr:*` タグなし |
| 5 | **publicUse** | `fee` + `access` | 下記ロジック参照 | V16の facilityCategory 連動を踏襲 |
| 6 | **facilityCategory** | — | 全件 `"public"` | `amenity=toilets` は公衆トイレ（下記検討事項参照） |
| 7 | **locationCategory** | — | `null` | OSMから推定困難 |
| 8 | **usageConditions** | — | `null` | OSMから推定困難 |
| 9 | **atmosphere** | — | `null` | OSMから推定困難 |
| 10 | **description** | `description` | あればそのまま | 今回データでは 0件 |
| 11 | **cleanliness** | — | `null` | OSMに情報なし |
| 12 | **image** | — | `null` | OSMに情報なし |
| 13 | **source** | 固定値 | `"OpenStreetMap"` | |
| 14 | **sourceUrl** | `type` + `id` から生成 | `https://www.openstreetmap.org/{type}/{id}` | node/way に応じたURL |
| 15 | **lastVerified** | `check_date` または `osm3s.timestamp_osm_base` | `check_date` があればそれを優先、なければ `2026-07-14` | |

### Equipment マッピング

| OSM タグ | 条件 | EquipmentType | 該当件数 |
|---|---|---|---|
| `wheelchair` | `= "yes"` | WHEELCHAIR | 12件 |
| `toilets:wheelchair` | `= "yes"`（wheelchair タグ未設定の場合） | WHEELCHAIR | 追加 0件（全て wheelchair と重複） |
| `changing_table` | `= "yes"` | DIAPER | 1件 |
| `fee` | `= "no"` | FREE | 9件 |
| `female=yes` かつ `male=yes` | 両方あり | GENDER_SEPARATED | 11件 |
| `unisex` | `= "yes"` | UNISEX | 2件 |
| `toilets:disposal` | `= "flush"` | WASHLET | **要検討**（flush ≠ ウォシュレット、下記参照） |

### publicUse 変換ロジック

V16 マイグレーションに従い、`facilityCategory` が `"public"` → `publicUse = true` とする。

ただし例外として：
- `access = "customers"` の場合（1件）→ `publicUse = null` または `false`（**要確認**）

---

## 検討事項

### 1. name がない90件の命名方法

**問題**: 91件中90件に `name` がない。全て「公衆トイレ」にすると区別できない。

**案A**: 「公衆トイレ」で統一し、地図上の位置で区別（アプリ側で最寄り表示するなら問題ない）

**案B**: 逆ジオコーディングで住所・地名を取得して「〇〇公園 公衆トイレ」等にする（追加API呼び出しが必要）

**案C**: OSM ID を付与して「公衆トイレ (OSM:775502656)」（ユーザーには不親切）

**推奨**: **案A**（「公衆トイレ」で統一）。理由: アプリのUIは地図ベースなので、名前よりも位置情報で識別する。名前は後から逆ジオコーディングで改善可能。

### 2. facilityCategory を全件 "public" にしてよいか

**結論: 概ね妥当**。`amenity=toilets` は OSM では公衆トイレを意味する。

ただし以下の例外に注意:
- `indoor=room` + `level` タグ付き（4件）: 建物内のトイレ（ショッピングセンター等の可能性）→ `"commercial"` or `"other"` の可能性
- `access=customers`（1件）: 顧客限定 → `"commercial"` の可能性
- `name=仮設トイレ`（1件）: 仮設 → `"other"` の可能性

**推奨**: 全件 `"public"` で投入し、上記の例外は要確認フラグを立てる、または後で修正。

### 3. toilets:disposal=flush → WASHLET のマッピングは不適切

**問題**: `flush`（水洗式）は「ウォシュレット付き」を意味しない。OSM の `flush` は単に水洗トイレであることを示す。

**推奨**: `toilets:disposal` → WASHLET のマッピングは**行わない**。水洗かどうかの情報は現在のスキーマに該当カラムがなく、捨てる。

### 4. 既存データとの重複チェック

**問題**: バックエンドに既存の84件（サンプルデータ + オープンデータ）が存在。つくば市エリアのデータと重複する可能性がある。

**推奨**: インポート前に以下の重複チェックを行う:
- 既存データの lat/lng と OSM データの lat/lng を比較
- 半径 50m 以内に既存データがある場合は重複候補とする
- 重複候補はスキップまたはマージ（OSMデータで上書き）

### 5. indoor=room のトイレ（4件）の扱い

同一座標（`36.0866, 140.1060` 付近）に `level=0` と `level=1` の2件ずつ、計4件ある。これは建物内の同じ位置の1階・2階トイレ。

**推奨**: 同一座標の複数階トイレは**1件に統合**する（地図表示では重なるため）。4件 → 2件に削減。

### 6. access=customers（1件）の扱い

id=13075312858 は `access=customers`（顧客のみ利用可能）。

**推奨**: 
- `facilityCategory = "commercial"` または `"other"`
- `publicUse = false`
- `usageConditions` に「顧客のみ」等の注記

### 7. source タグの扱い

2件に `source=GSImaps/std`（国土地理院由来）がある。これはOSMのデータ出典であり、当アプリの `source` カラム（`"OpenStreetMap"`）とは別の意味。

**推奨**: アプリの `source` は `"OpenStreetMap"` で統一。OSM内の source タグは無視する。

---

## インポート件数の見積もり

| 項目 | 件数 |
|---|---|
| OSM 元データ | 91 |
| indoor 統合による削減 | -2 |
| 重複チェックによる削減 | 不明（要チェック） |
| **想定インポート件数** | **約 87〜89件** |

---

## マッピング未対応の OSM タグ（捨てる情報）

| OSM タグ | 理由 |
|---|---|
| `building` | 地図表示に不要 |
| `toilets:disposal` | 水洗/非水洗の区分はスキーマにない |
| `toilets:position` | 便器の形式はスキーマにない |
| `level` | フロア情報はスキーマにない（統合で対応） |
| `indoor` | 屋内/屋外の区分はスキーマにない |
| `operator` | 運営者はスキーマにない |
| `source`（OSM内） | アプリの source とは意味が異なる |

---

## 次のステップ（提案）

1. ユーザーが本マッピング案を確認・修正
2. 既存データとの重複チェック実施
3. Flyway マイグレーション（V17）でインポート SQL を作成
4. テスト環境で動作確認
