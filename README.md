# 🌸 Queefies

**Queefies** is a real-time, location-based social app for lesbians — like Sniffies, but for Queefers. Built with TypeScript, React, Node.js, and Socket.io.

## Features

- 🗺️ **Real-time map** — See other Queefers near you. Pins show their primary photo or a roast beef icon if no photo is set.
- 👤 **Anonymous device fingerprinting** — Sign in automatically based on your unique device. No account required.
- 📸 **Profile management** — Primary photo, photo/video albums, intro bio, body stats (age, height, body type, ethnicity, pronouns, looking for, tags).
- 💥 **Bang requests** — Send a chat invite to a nearby Queefer. Phone vibrates when you get one!
- 💬 **Real-time chat** — Accept a bang request to open a live chat session.
- ❤️ **Favorites** — Save and manage your favorite Queefers.
- 🔍 **Search** — Filter Queefers by body type, ethnicity, pronouns, what they're looking for, tags, and distance.
- 📳 **Proximity detection** — Your phone vibrates when another Queefer is within 100 meters.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Map | Leaflet, OpenStreetMap |
| Real-time | Socket.io (client + server) |
| Identity | FingerprintJS (device fingerprint) |
| Backend | Node.js, Express, Socket.io |
| Icons | Lucide React |

## Getting Started

### 1. Start the backend server

```bash
cd server
npm install
npx tsx watch index.ts
```

The server runs on `http://localhost:3001`.

### 2. Start the frontend

```bash
# From the project root
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

### Configuration

Copy `.env.example` to `.env` and update `VITE_SERVER_URL` if your server runs on a different URL/port.

```bash
cp .env.example .env
```

## Project Structure

```
queefies/
├── src/
│   ├── components/
│   │   ├── MapView.tsx          # Real-time Leaflet map with user pins
│   │   ├── ProfileEditor.tsx    # Profile editing (photo, stats, albums)
│   │   ├── UserProfileView.tsx  # View another user's profile
│   │   ├── ChatView.tsx         # Real-time chat UI
│   │   ├── SearchView.tsx       # Filter and search Queefers
│   │   ├── FavoritesView.tsx    # Favorites list
│   │   ├── BangRequestOverlay.tsx  # Incoming bang request modal
│   │   └── BottomNav.tsx        # Tab navigation
│   ├── hooks/
│   │   └── useQueefies.ts       # Main app hook (socket events, actions)
│   ├── store/
│   │   └── AppContext.tsx       # Global state (useReducer + Context)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── utils/
│       ├── fingerprint.ts       # Device fingerprint (FingerprintJS)
│       ├── geo.ts               # Geolocation + vibration helpers
│       └── socket.ts            # Socket.io singleton
└── server/
    └── index.ts                 # Express + Socket.io backend
```

## Privacy

All data is stored in-memory on the server — nothing is persisted to disk. Profile data is saved to your browser's localStorage for convenience. Location data is only shared while you are connected.
