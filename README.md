# 🚻 imatoilet

[日本語版はこちら](README.ja.md)

A toilet search web app for Japan — find accessible, clean, and well-equipped restrooms near you.

<!-- Replace with actual screenshot -->
<!-- ![imatoilet screenshot](docs/screenshot.png) -->

## 🔗 Demo

> 🚧 Coming soon — [Live Demo URL](#)

---

## ✨ Features

- 📍 Search toilets by location on an interactive Google Maps interface
- ♿ Filter by accessibility features (wheelchair, diaper changing, 24h, etc.)
- ✏️ Admin interface to add, edit, and delete toilet entries
- 📊 Data sourced from Tsukuba City open barrier-free map data

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 21 (Eclipse Temurin) |
| Framework | Spring Boot 3.5.9 |
| ORM | Spring Data JPA / Hibernate |
| DB Migration | Flyway 11.7.2 |
| Local DB | H2 (in-memory, dev profile) |
| Production DB | PostgreSQL |
| Build Tool | Apache Maven 3.9.12 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Maps | Google Maps JavaScript API |
| Image Hosting | Cloudinary (optional) |

---

## 🚀 Local Development

### Prerequisites

- Java 21
- Apache Maven 3.9.12 (direct install — **do not use `mvnw`**)
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/imatoilet.git
cd imatoilet
```

### 2. Set up backend environment variables

Create a `.env` file (not committed to Git) or set environment variables directly.
See `.env.example` in `toilet-frontend/` for reference.

### 3. Start the backend (H2 local dev)

```powershell
cd backend\backend
mvn clean spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Backend runs at: `http://localhost:8080`

#### H2 Console (local dev only)

| Field | Value |
|---|---|
| URL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:imatoiletdb` |
| Username | `sa` |
| Password | *(leave blank)* |

### 4. Start the frontend

```bash
cd toilet-frontend
cp .env.example .env   # Fill in your API keys
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🗄 Database Migrations

Flyway manages all schema changes. Migration files are split by environment:

| Directory | Purpose |
|---|---|
| `src/main/resources/db/migration/` | PostgreSQL (production) |
| `src/main/resources/db/migration-h2/` | H2 (local dev) |

> ⚠️ **Never modify existing V1–V10 files.** New migrations must be added as V11, V12, etc.

### Current migrations

| Version | Description |
|---|---|
| V1 | Initial schema |
| V2 | Add equipment table |
| V3 | Add search indexes |
| V4 | Insert sample data |
| V5 | Add image column |
| V6 | Add baby chair equipment |
| V7 | Drop boolean flags |
| V8 | Add source columns |
| V9 | Insert open data (Tsukuba City) |
| V10 | Fix Midorino station location coordinates |

---

## 🔐 Authentication

Admin operations (PUT / DELETE) require a token header:

```
X-Admin-Token: <your-admin-token>
```

Set `ADMIN_TOKEN` in your environment (defaults to `dev-admin-token-local` for local dev).

---

## 📁 Project Structure

```
imatoilet/
├── backend/backend/          # Spring Boot application
│   └── src/main/
│       ├── java/com/imatoilet/backend/
│       └── resources/
│           ├── application.properties        # Production (PostgreSQL)
│           ├── application-dev.properties    # Local dev (H2)
│           └── db/
│               ├── migration/                # PostgreSQL migrations
│               └── migration-h2/             # H2-compatible migrations
└── toilet-frontend/          # React + Vite frontend
    ├── .env.example
    └── src/
```

---

## 🌐 Deployment

### Backend (Railway / Render)

Set the following environment variables in your hosting platform:

```
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
ADMIN_TOKEN=...
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=8080
```

### Frontend (Vercel / Netlify)

Set the following environment variables:

```
VITE_API_BASE_URL=https://your-backend.railway.app/api/toilets
VITE_ADMIN_TOKEN=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAPS_MAP_ID=...
```

> 🚧 Live deployment URL: [Coming soon](#)

---

## 📄 License

MIT
