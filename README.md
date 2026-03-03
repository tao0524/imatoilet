# 🚻 imatoilet

[日本語版はこちら](README.ja.md)

> Find clean, accessible, and well-equipped restrooms anywhere in Japan — instantly.

<!-- Replace with actual screenshot -->
<!-- ![imatoilet screenshot](docs/screenshot.png) -->

## 🔗 Demo

[Live Demo URL](https://imatoilet.vercel.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📍 **Map-based search** | Browse toilets on an interactive Google Maps interface with AdvancedMarker and MarkerClusterer |
| 🗾 **Nationwide coverage** | Bounding Box search dynamically fetches toilets for any visible map area across Japan |
| ♿ **Accessibility filters** | Filter by 13+ criteria: wheelchair, diaper, 24h, ostomate, nursing room, washlet, free, and more |
| ⭐ **Reviews & ratings** | Users can post text reviews with cleanliness ratings for each toilet |
| ❤️ **Favorites** | Save frequently used toilets to a local favorites list |
| 🗺️ **Route guidance** | Get walking or driving directions from your current location to any toilet |
| ✏️ **CRUD for admins** | Token-authenticated admin interface to add, edit, and delete toilet entries |
| 📱 **PWA support** | Installable as a Progressive Web App on mobile devices |
| 🏙️ **Open data** | Seeded with Tsukuba City barrier-free open data and national tourist spot toilets |

---

## 🛠 Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Language | Java 21 (Eclipse Temurin) |
| Framework | Spring Boot 3.5.9 |
| ORM | Spring Data JPA / Hibernate |
| DB Migration | Flyway 11.7.2 |
| Local DB | H2 (in-memory, `dev` profile) |
| Production DB | PostgreSQL |
| Build Tool | Apache Maven 3.9.12 |
| Security | Spring Security + custom `AdminTokenFilter` |
| Testing | JUnit 5 + MockMvc |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| UI Components | MUI (Material-UI) v7 |
| Maps | Google Maps JavaScript API (`@react-google-maps/api`) |
| Marker Clustering | `@googlemaps/markerclusterer` |
| Image Hosting | Cloudinary (optional) |
| Testing | Vitest + Testing Library |

### Architecture

```
[React (Vite)]  ──REST API──>  [Spring Boot]  ──JPA──>  [PostgreSQL]
      │                                                   [H2 (dev)]
      │
  Google Maps JS API
  Cloudinary (images)
```

---

## 🚀 Local Development

### Prerequisites

- Java 21
- Apache Maven 3.9.12 (direct install — **do not use `mvnw`**)
- Node.js 18+
- Google Maps API Key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/imatoilet.git
cd imatoilet
```

### 2. Start the backend (H2 in-memory, dev profile)

```powershell
cd backend\backend
mvn clean spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Backend runs at: `http://localhost:8080`

**H2 Console** (local dev only):

| Field | Value |
|---|---|
| URL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:imatoiletdb` |
| Username | `sa` |
| Password | *(leave blank)* |

### 3. Configure frontend environment variables

```bash
cd toilet-frontend
cp .env.example .env
# Fill in VITE_GOOGLE_MAPS_API_KEY and other keys
```

### 4. Start the frontend

```bash
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🗄 Database Migrations

Flyway migrations run automatically on startup.
Migration scripts are located at:

```
backend/src/main/resources/db/migration/       # PostgreSQL (production)
backend/src/main/resources/db/migration-h2/    # H2 (local dev)
```

Key migrations:

| Version | Description |
|---|---|
| V1 | Initial schema (toilets, equipment) |
| V4 | Sample data |
| V9 | Tsukuba City open data |
| V11 | Review table |
| V13–V15 | Tokyo dense data, tourist spots, national scale data |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/toilets` | Search toilets (location, bounding box, keyword, filters) |
| `GET` | `/api/toilets/{id}` | Get toilet details |
| `POST` | `/api/toilets` | Create toilet *(admin token required)* |
| `PUT` | `/api/toilets/{id}` | Update toilet *(admin token required)* |
| `DELETE` | `/api/toilets/{id}` | Delete toilet *(admin token required)* |
| `GET` | `/api/toilets/{id}/reviews` | List reviews for a toilet |
| `POST` | `/api/toilets/{id}/reviews` | Post a new review |

### Search Parameters

| Parameter | Type | Description |
|---|---|---|
| `lat` / `lng` | `Double` | Center coordinates for radius search |
| `radius` | `Double` | Search radius in km (default: 5.0) |
| `minLat/maxLat/minLng/maxLng` | `Double` | Bounding box (nationwide search) |
| `keyword` | `String` | Keyword search on name/address |
| `facilityCategory` | `String` | `station`, `park`, `commercial`, `public`, etc. |
| `equipment` | `List<String>` | e.g. `WHEELCHAIR`, `DIAPER`, `OPEN_24H`, `OSTOMATE` |

---

## 🧪 Running Tests

```bash
# Backend
cd backend/backend
mvn test

# Frontend
cd toilet-frontend
npm run test
```

---

## 📁 Project Structure

```
imatoilet/
├── backend/backend/           # Spring Boot application
│   ├── src/main/java/         # Controllers, Services, Entities, Repositories
│   ├── src/main/resources/    # application.properties, Flyway migrations
│   └── src/test/              # Unit & integration tests
└── toilet-frontend/           # React + Vite application
    ├── src/
    │   ├── components/        # Shared UI components (SafeGoogleMap, ToiletCard, etc.)
    │   ├── hooks/             # Custom hooks (useToiletSearch)
    │   ├── pages/             # Route-level pages (Home, Search, Detail, Register, Favorites)
    │   └── utils.js           # Utility functions (distance calc, equipment normalization)
    └── public/                # PWA icons, manifest
```

---

## 📝 License

MIT

---

*Built with ❤️ as a portfolio project.*