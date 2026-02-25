# 🚻 imatoilet!

日本全国のトイレを検索できるWebアプリです。バリアフリー対応・清潔さ・設備情報をもとに、近くの公共トイレを素早く見つけられます。

<!-- 実際のスクリーンショットに差し替えてください -->
<!-- ![imatoilet スクリーンショット](docs/screenshot.png) -->

[English](README.md)

## 🔗 デモ

> 🚧 公開準備中 — [デモURL](#)

---

## ✨ 主な機能

- 📍 Google マップ上でインタラクティブにトイレを検索
- ♿ バリアフリー設備（車椅子対応・おむつ交換台・24時間利用可など）でフィルタリング
- ✏️ 管理者向けのトイレ情報の追加・編集・削除
- 📊 つくば市バリアフリーマップのオープンデータを収録

---

## 🛠 技術スタック

### バックエンド
| レイヤー | 技術 |
|---|---|
| 言語 | Java 21 (Eclipse Temurin) |
| フレームワーク | Spring Boot 3.5.9 |
| ORM | Spring Data JPA / Hibernate |
| DBマイグレーション | Flyway 11.7.2 |
| ローカルDB | H2（インメモリ・devプロファイル） |
| 本番DB | PostgreSQL |
| ビルドツール | Apache Maven 3.9.12 |

### フロントエンド
| レイヤー | 技術 |
|---|---|
| フレームワーク | React + Vite |
| 地図 | Google Maps JavaScript API |
| 画像ホスティング | Cloudinary（オプション） |

---

## 🚀 ローカル開発環境のセットアップ

### 必要なもの

- Java 21
- Apache Maven 3.9.12（直接インストール — **`mvnw` は使用しないこと**）
- Node.js 18以上

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/imatoilet.git
cd imatoilet
```

### 2. バックエンドの環境変数を設定

`.env` ファイルを作成してください（Gitにはコミットしないこと）。
`toilet-frontend/.env.example` を参考にしてください。

### 3. バックエンドを起動（H2ローカル開発）

```powershell
cd backend\backend
mvn clean spring-boot:run "-Dspring-boot.run.profiles=dev"
```

バックエンド起動URL: `http://localhost:8080`

#### H2コンソール（ローカル開発時のみ）

| 項目 | 値 |
|---|---|
| アクセスURL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:imatoiletdb` |
| ユーザー名 | `sa` |
| パスワード | *（空欄）* |

### 4. フロントエンドを起動

```bash
cd toilet-frontend
cp .env.example .env   # APIキーを記入してください
npm install
npm run dev
```

フロントエンド起動URL: `http://localhost:5173`

---

## 🗄 データベースマイグレーション

FlywayでDBのスキーマ変更を管理しています。環境ごとにマイグレーションファイルを分けています。

| ディレクトリ | 用途 |
|---|---|
| `src/main/resources/db/migration/` | PostgreSQL（本番） |
| `src/main/resources/db/migration-h2/` | H2（ローカル開発） |

> ⚠️ **既存のV1〜V10ファイルは絶対に書き換えないこと。** 新しいマイグレーションはV11、V12として追加してください。

### マイグレーション一覧

| バージョン | 内容 |
|---|---|
| V1 | 初期スキーマ作成 |
| V2 | 設備テーブル追加 |
| V3 | 検索用インデックス追加 |
| V4 | サンプルデータ投入 |
| V5 | 画像カラム追加 |
| V6 | ベビーチェア設備追加 |
| V7 | 旧ブーリアンフラグ削除 |
| V8 | ソース情報カラム追加 |
| V9 | オープンデータ投入（つくば市） |
| V10 | みどりの駅の緯度座標修正 |

---

## 🔐 認証

管理者操作（PUT / DELETE）にはトークンヘッダーが必要です：

```
X-Admin-Token: <管理者トークン>
```

環境変数 `ADMIN_TOKEN` で設定してください（ローカル開発時のデフォルト値: `dev-admin-token-local`）。

---

## 📁 ディレクトリ構成

```
imatoilet/
├── backend/backend/          # Spring Boot アプリケーション
│   └── src/main/
│       ├── java/com/imatoilet/backend/
│       └── resources/
│           ├── application.properties        # 本番用（PostgreSQL）
│           ├── application-dev.properties    # ローカル開発用（H2）
│           └── db/
│               ├── migration/                # PostgreSQL用マイグレーション
│               └── migration-h2/             # H2互換マイグレーション
└── toilet-frontend/          # React + Vite フロントエンド
    ├── .env.example
    └── src/
```

---

## 🌐 デプロイ

### バックエンド（Railway / Render）

ホスティング環境で以下の環境変数を設定してください：

```
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
ADMIN_TOKEN=...
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=8080
```

### フロントエンド（Vercel / Netlify）

以下の環境変数を設定してください：

```
VITE_API_BASE_URL=https://your-backend.railway.app/api/toilets
VITE_ADMIN_TOKEN=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAPS_MAP_ID=...
```

> 🚧 公開URL: [準備中](#)

---

## 📄 ライセンス

MIT
