# OSM トイレデータ分析レポート

> 分析日: 2026-07-15
> データソース: `D:\Downloads\export.json`（Overpass API）
> OSMタイムスタンプ: 2026-07-14T22:50:18Z
> 件数: 91件

---

## 1-1. 全タグキーの一覧と出現回数

| タグキー | 出現回数 | 割合 |
|---|---|---|
| amenity | 91 | 100% |
| building | 26 | 28.6% |
| access | 25 | 27.5% |
| wheelchair | 12 | 13.2% |
| male | 12 | 13.2% |
| toilets:disposal | 11 | 12.1% |
| female | 11 | 12.1% |
| fee | 9 | 9.9% |
| indoor | 6 | 6.6% |
| check_date | 5 | 5.5% |
| unisex | 4 | 4.4% |
| level | 4 | 4.4% |
| toilets:wheelchair | 3 | 3.3% |
| changing_table | 3 | 3.3% |
| operator | 2 | 2.2% |
| toilets:position | 2 | 2.2% |
| source | 2 | 2.2% |
| name | 1 | 1.1% |

---

## 1-2. タグ値の分布

### wheelchair（12件 / 91件中）

| 値 | 件数 |
|---|---|
| yes | 12 |

※ `no` や `limited` は 0件。wheelchair タグがある場合は全て `yes`。

### fee（9件 / 91件中）

| 値 | 件数 |
|---|---|
| no | 9 |

※ `fee=yes` は 0件。fee タグがある場合は全て無料。

### changing_table（3件 / 91件中）

| 値 | 件数 |
|---|---|
| no | 2 |
| yes | 1 |

### access（25件 / 91件中）

| 値 | 件数 |
|---|---|
| yes | 24 |
| customers | 1 |

※ `customers` は id=13075312858（顧客のみ利用可能）

### name（1件 / 91件中）

| 値 | 件数 |
|---|---|
| 仮設トイレ | 1（id=5470895143） |

※ **91件中90件に name がない**。

### toilets:wheelchair（3件 / 91件中）

| 値 | 件数 |
|---|---|
| yes | 3 |

※ `wheelchair=yes` と重複するケースが多い。

### toilets:disposal（11件 / 91件中）

| 値 | 件数 |
|---|---|
| flush | 10 |
| chemical | 1 |

### description

該当なし（0件）

### supervised

該当なし（0件）

---

## 1-2 補足：その他の注目タグ

### building（26件）
- 全て `yes`。way タイプに多い（建物としてマッピングされたトイレ）

### female / male（11件 / 12件）
- 男女別トイレの情報。`female=yes` と `male=yes` がセットで付くことが多い

### unisex（4件）
- `yes`: 2件、`no`: 2件

### operator（2件）
- `常総市`: 1件、`つくば市`: 1件

### indoor（6件）
- `room`: 4件（建物内の個室トイレ）、`yes`: 2件

### level（4件）
- `0`: 2件、`1`: 2件（同一座標の複数階にトイレがある）

### check_date（5件）
- 2024-04-12, 2024-05-10, 2024-10-17, 2025-06-13, 2026-07-12

### source（2件）
- `GSImaps/std`: 2件（国土地理院地図由来）

---

## 1-3. node vs way の比較

| 項目 | node | way |
|---|---|---|
| 件数 | 57 | 34 |
| 平均タグ数 | 2.0 | 3.4 |
| center 座標 | N/A（lat/lon直接） | 34/34（100%あり） |

- way は全件 `center` 座標を持つ（`out center;` 指定による）
- way のほうが平均タグ数が多い（building タグが加算される影響）

---

## 2. バックエンドの現在のテーブル構造

### Toilet エンティティ（`Toilet.java`）

| フィールド名 | 型 | Nullable | バリデーション | 備考 |
|---|---|---|---|---|
| id | Long | NO（自動採番） | — | @GeneratedValue(IDENTITY) |
| name | String | NO | @NotBlank, max 100 | 名前は必須 |
| lat | Double | NO | @NotNull, -90〜90 | 緯度 |
| lng | Double | NO | @NotNull, -180〜180 | 経度 |
| address | String | YES | max 200 | 住所 |
| publicUse | Boolean | YES | — | 旧フラグ（コメントに「旧フラグ完全廃止」とあるが残存） |
| typePark | Boolean | YES | — | 旧フラグ |
| typeStation | Boolean | YES | — | 旧フラグ |
| typeMall | Boolean | YES | — | 旧フラグ |
| description | String | YES | max 500 | 説明 |
| facilityCategory | String | YES | 正規表現制約 | station/commercial/convenience/park/public/medical/hotel_tourism/other |
| locationCategory | String | YES | — | |
| usageConditions | String | YES | — | |
| atmosphere | String | YES | — | |
| cleanliness | Integer | YES | 1〜5 | 清潔度 |
| image | String | YES | max 2048, URL形式 | 画像URL |
| source | String | YES | max 100 | 出典 |
| sourceUrl | String | YES | max 2048 | 出典URL |
| lastVerified | LocalDate | YES | — | 最終確認日 |
| equipmentList | List\<Equipment\> | — | — | OneToMany, CASCADE ALL |
| reviews | List\<Review\> | — | — | OneToMany, CASCADE ALL |

### Equipment タイプ一覧（`EquipmentType.java`）

| 値 | 説明 |
|---|---|
| WHEELCHAIR | 車椅子対応 |
| DIAPER | オムツ交換 |
| OSTOMATE | オストメイト |
| WASHLET | ウォシュレット |
| NURSING_ROOM | 授乳室 |
| BABY_CHAIR | ベビーチェア |
| VISUAL_SUPPORT | 視覚障害者対応 |
| GENDER_SEPARATED | 男女別 |
| UNISEX | 男女共用 |
| FREE | 無料 |
| PAID | 有料 |
| OPEN_24H | 24時間 |
| PARKING | 駐車場 |

### Flyway マイグレーション履歴

最新: **V16__fix_public_use_values.sql**

| バージョン | 内容 |
|---|---|
| V1 | 初期スキーマ |
| V2 | equipment テーブル追加 |
| V3 | 検索インデックス追加 |
| V4 | サンプルデータ投入 |
| V5 | image カラム追加 |
| V6 | BABY_CHAIR equipment 追加 |
| V7 | Boolean フラグ削除 |
| V8 | source, source_url, last_verified カラム追加 |
| V9 | オープンデータ投入 |
| V10 | みどりの位置修正 |
| V11 | review テーブル追加 |
| V12 | 座標修正 |
| V13 | 東京密集トイレ追加 |
| V14 | 観光地トイレ追加 |
| V15 | 全国規模トイレ追加 |
| V16 | public_use 値修正（facilityCategory に連動） |
