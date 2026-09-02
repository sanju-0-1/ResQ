# 🛡️ ResQ — Emergency Assistance Mobile App & Server MVP

**ResQ** is an inclusive mobile safety and emergency-assistance application designed for everyone experiencing physical harassment or safety threats to quickly request help from verified nearby volunteer responders and trusted contacts.

---

## 🎯 Core Principles & Safety Guidelines

1. **De-escalation & Witness Assistance**: The application prioritizes user safety, de-escalation, reaching safe public spaces, contacting official emergency services (911/112), and acting as witnesses.
2. **Strict Non-Violence Rules**: Responders are strictly instructed **NEVER** to physically confront attackers, carry weapons, encourage retaliation, or engage in vigilante actions.
3. **Multi-Tiered Location Privacy**:
   - Requester location is masked until a verified responder explicitly accepts the emergency request.
   - Live location streaming stops automatically as soon as the emergency is marked resolved or cancelled.
4. **Anti-Abuse Protections**: Cooldown timers, rate limiting, document hashing, and admin moderation protect the network against fake requests and harassment.

---

## 📁 Repository Structure (Monorepo)

```
resq/
├── server/
│   ├── src/
│   │   ├── config/          # Database & Environment configuration
│   │   ├── controllers/     # Express HTTP API handlers
│   │   ├── middleware/      # JWT Auth, Role RBAC, Rate Limiters, Anti-Abuse
│   │   ├── models/          # Mongoose models (User, ResponderProfile, Emergency, etc.)
│   │   ├── routes/          # REST Endpoint definitions
│   │   ├── services/        # 2dsphere Geo matching & Push/Socket alerts
│   │   ├── sockets/         # Socket.IO handlers for live status & encrypted chat
│   │   ├── utils/           # Haversine geo math, JWT helpers, API responses
│   │   └── app.ts           # Server entry point
│   ├── .env.example
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── components/      # EmergencyButton, SafetyCard, StatusBadge, TopHeader
│   │   ├── navigation/      # RootNavigator & Tab bar navigation
│   │   ├── screens/         # Auth, SOS Hub, Responder Dashboard, Admin Queue
│   │   ├── services/        # Axios API, Socket client, Location service, Storage
│   │   ├── store/           # AuthContext & EmergencyContext
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Theme tokens & Safety rules
│   └── App.tsx
│
└── README.md
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm** or **yarn**
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI.

---

### 1. Setup Backend Server (`server/`)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

#### `.env` Configuration Options
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/resq

JWT_SECRET=resq_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=resq_super_secret_refresh_key_2026
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

DEFAULT_EMERGENCY_RADIUS_METERS=5000
EMERGENCY_EXPIRATION_MINUTES=30
EMERGENCY_COOLDOWN_SECONDS=60
```

#### Run Backend Server in Development Mode
```bash
npm run dev
```
> Server starts on `http://localhost:5000` (API endpoint: `http://localhost:5000/api`)

#### Execute Automated Verification Suite
```bash
npm run test
```
> Runs end-to-end database, authentication, geospatial search, and emergency status workflow verification.

---

### 2. Setup Mobile Application (`mobile/`)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npm run start
```

---

## 🛰️ Backend REST API Reference

### 🔐 Authentication & Accounts
- `POST /api/auth/register` — Register a new user (`normal`, `resq`, `admin`).
- `POST /api/auth/login` — Sign in with email, username, or phone.
- `POST /api/auth/refresh` — Issue new access token using refresh token.
- `POST /api/auth/logout` — Logout user session.

### 👤 Profile & Responders
- `GET /api/users/me` — Retrieve current authenticated user details.
- `POST /api/responders/apply` — Submit ResQ volunteer verification.
- `GET /api/responders/status` — Get responder approval and availability status.
- `PATCH /api/responders/availability` — Toggle online/offline status (🟢 / 🔴).

### 🚨 Emergency System & Geospatial Matching
- `POST /api/emergencies` — Trigger 🆘 **NEED HELP** emergency request (geospatial 2dsphere indexing).
- `GET /api/emergencies/nearby` — Get nearby emergency requests within 5km for online responders.
- `POST /api/emergencies/:id/accept` — Accept emergency request.
- `PATCH /api/emergencies/:id/status` — Update incident status (`assistance_in_progress`, `resolved`, `cancelled`).
- `POST /api/emergencies/:id/cancel` — Cancel emergency request.

### 💬 Temporary Emergency Chat
- `GET /api/emergencies/:id/messages` — Fetch temporary chat messages.
- `POST /api/emergencies/:id/messages` — Send temporary incident message.

### 👥 Trusted Contacts & Safety
- `GET /api/trusted-contacts` — List trusted emergency contacts.
- `POST /api/trusted-contacts` — Add trusted contact.
- `DELETE /api/trusted-contacts/:id` — Delete trusted contact.

### 🛡️ Admin Moderation
- `GET /api/admin/stats` — Retrieve system metrics.
- `GET /api/admin/verifications` — View responder verification queue.
- `PATCH /api/admin/verifications/:id` — Approve or reject responder verification.
- `GET /api/admin/reports` — View submitted safety & abuse reports.
- `PATCH /api/admin/users/:userId/moderation` — Moderate, suspend, or ban users.

---

## 🔒 Security & Privacy Implementation

- **Password Safety**: Hashed using `bcryptjs` with 10 salt rounds.
- **Verification Documents**: Government ID documents are hashed (`idDocumentHash`) and hidden from public endpoints.
- **Geospatial Privacy**: Location coordinates are masked until a verified responder accepts the emergency.
- **Rate Limiting & Cooldowns**: `express-rate-limit` prevents spam emergency triggers.
- **Security Headers**: `helmet` and `cors` configuration active.
