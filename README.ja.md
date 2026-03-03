# 🚻 imatoilet

[English](README.md)

> 日本全国のトイレを、今すぐ見つける。清潔さ・バリアフリー設備・場所から絞り込めるトイレ検索Webアプリ。

<!-- 実際のスクリーンショットに差し替えてください -->
<!-- ![imatoilet スクリーンショット](docs/screenshot.png) -->

## 🔗 デモ

> 🚧 公開準備中 — [デモURL](#)

---

## ✨ 主な機能

| 機能 | 説明 |
|---|---|
| 📍 **マップ検索** | Google Maps上でトイレをインタラクティブに表示。AdvancedMarker・MarkerClustererに対応 |
| 🗾 **全国スケール対応** | 地図の表示領域（Bounding Box）で動的にAPIを叩き、日本全国どこでも検索可能 |
| ♿ **バリアフリーフィルター** | 車椅子・おむつ台・24時間・オストメイト・授乳室・ウォシュレット・無料など13項目以上で絞り込み |
| ⭐ **レビュー・コメント** | 清潔度評価つきのテキストレビューを投稿可能 |
| ❤️ **お気に入り** | よく使うトイレをローカル保存してお気に入り一覧から参照 |
| 🗺️ **ルート案内** | 現在地からトイレまでの徒歩・車ルートをGoogle Mapsで表示 |
| ✏️ **管理者向けCRUD** | トークン認証による管理者専用のトイレ情報追加・編集・削除 |
| 📱 **PWA対応** | スマートフォンにアプリとしてインストール可能 |
| 🏙️ **オープンデータ活用** | つくば市バリアフリーマップのオープンデータおよび全国主要観光地のトイレ情報を収録 |

---

## 🛠 技術スタック

### バックエンド

| レイヤー | 技術 |
|---|---|
| 言語 | Java 21 (Eclipse Temurin) |
| フレームワーク | Spring Boot 3.5.9 |
| ORM | Spring Data JPA / Hibernate |
| DBマイグレーション | Flyway 11.7.2 |
| ローカルDB | H2（インメモリ・`dev`プロファイル） |
| 本番DB | PostgreSQL |
| ビルドツール | Apache Maven 3.9.12 |
| セキュリティ | Spring Security + カスタム `AdminTokenFilter` |
| テスト | JUnit 5 + MockMvc |

### フロントエンド

| レイヤー | 技術 |
|---|---|
| フレームワーク | React 19 + Vite |
| UIコンポーネント | MUI (Material-UI) v7 |
| 地図 | Google Maps JavaScript API（`@react-google-maps/api`） |
| マーカークラスタリング | `@googlemaps/markerclusterer` |
| 画像ホスティング | Cloudinary（オプション） |
| テスト | Vitest + Testing Library |

### アーキテクチャ

```
[React (Vite)]  ──REST API──>  [Spring Boot]  ──JPA──>  [PostgreSQL]
      │                                                   [H2 (dev)]
      │
  Google Maps JS API
  Cloudinary（画像）
```

---

## 🚀 ローカル開発環境のセットアップ

### 必要なもの

- Java 21
- Apache Maven 3.9.12（直接インストール — **`mvnw` は使用しないこと**）
- Node.js 18以上
- Google Maps APIキー

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/imatoilet.git
cd imatoilet
```

### 2. バックエンドを起動（H2インメモリ・devプロファイル）

```powershell
cd backend\backend
mvn clean spring-boot:run "-Dspring-boot.run.profiles=dev"
```

バックエンド起動URL: `http://localhost:8080`

**H2コンソール**（ローカル開発時のみ）:

| 項目 | 値 |
|---|---|
| アクセスURL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:imatoiletdb` |
| ユーザー名 | `sa` |
| パスワード | *（空欄）* |

### 3. フロントエンドの環境変数を設定

```bash
cd toilet-frontend
cp .env.example .env
# VITE_GOOGLE_MAPS_API_KEY などを記入してください
```

### 4. フロントエンドを起動

```bash
npm install
npm run dev
```

フロントエンド起動URL: `http://localhost:5173`

---

## 🗄 データベースマイグレーション

Flywayマイグレーションは起動時に自動実行されます。
マイグレーションスクリプトの格納場所:

```
backend/src/main/resources/db/migration/       # PostgreSQL（本番）
backend/src/main/resources/db/migration-h2/    # H2（ローカル開発）
```

主なマイグレーション:

| バージョン | 内容 |
|---|---|
| V1 | 初期スキーマ（toilets・equipment） |
| V4 | サンプルデータ投入 |
| V9 | つくば市オープンデータ投入 |
| V11 | レビューテーブル追加 |
| V13〜V15 | 東京密集データ・観光地・全国スケールデータ追加 |

---

## 🔌 APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---|---|---|
| `GET` | `/api/toilets` | トイレ検索（位置情報・Bounding Box・キーワード・フィルター） |
| `GET` | `/api/toilets/{id}` | トイレ詳細取得 |
| `POST` | `/api/toilets` | トイレ追加 *（管理者トークン必須）* |
| `PUT` | `/api/toilets/{id}` | トイレ更新 *（管理者トークン必須）* |
| `DELETE` | `/api/toilets/{id}` | トイレ削除 *（管理者トークン必須）* |
| `GET` | `/api/toilets/{id}/reviews` | レビュー一覧取得 |
| `POST` | `/api/toilets/{id}/reviews` | レビュー投稿 |

### 主な検索パラメータ

| パラメータ | 型 | 説明 |
|---|---|---|
| `lat` / `lng` | `Double` | 現在地座標（半径検索） |
| `radius` | `Double` | 検索半径（km、デフォルト: 5.0） |
| `minLat/maxLat/minLng/maxLng` | `Double` | Bounding Box（全国スケール検索） |
| `keyword` | `String` | 名称・住所のキーワード検索 |
| `facilityCategory` | `String` | `station`・`park`・`commercial`・`public` など |
| `equipment` | `List<String>` | `WHEELCHAIR`・`DIAPER`・`OPEN_24H`・`OSTOMATE` など |

---

## 🧪 テストの実行

```bash
# バックエンド
cd backend/backend
mvn test

# フロントエンド
cd toilet-frontend
npm run test
```

---

## 📁 ディレクトリ構成

```
imatoilet/
├── backend/backend/           # Spring Bootアプリケーション
│   ├── src/main/java/         # Controller・Service・Entity・Repository
│   ├── src/main/resources/    # application.properties・Flywayマイグレーション
│   └── src/test/              # ユニット・統合テスト
└── toilet-frontend/           # React + Viteアプリケーション
    ├── src/
    │   ├── components/        # 共有UIコンポーネント（SafeGoogleMap・ToiletCardなど）
    │   ├── hooks/             # カスタムフック（useToiletSearch）
    │   ├── pages/             # ルートページ（Home・Search・Detail・Register・Favorites）
    │   └── utils.js           # ユーティリティ（距離計算・設備情報正規化）
    └── public/                # PWAアイコン・マニフェスト
```

---

## 📝 ライセンス

MIT

---

*ポートフォリオとして個人開発しています。*