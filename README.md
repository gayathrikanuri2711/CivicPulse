# CivicPulse AI — Unified Civic Intelligence & Municipal Governance Platform

CivicPulse AI is an AI-powered municipal accountability, civic reporting, and disaster-resilience platform initially designed for Visakhapatnam (Vizag), Greater Visakhapatnam Municipal Corporation (GVMC), Andhra Pradesh, India.

> **Core Philosophy:** Every complaint matters. Every repair is verified. Every recurring problem is remembered.

---

## Key Capabilities

1. **Multimodal Citizen Reporting:**
   - Image capture / upload of civic hazards.
   - Telugu and English voice recording with real-time waveform visualization.
   - Text descriptions with automatic AI classification and translation.
   - Precise GPS geocoding and manual pin adjustment for Vizag localities (Beach Road, Siripuram, MVP Colony, Gajuwaka, Madhurawada).

2. **Gemini AI Intelligence Engine:**
   - Multimodal image and audio understanding.
   - Automated 1-5 severity and risk scoring.
   - 50-metre geospatial duplicate detection preventing duplicate work orders while aggregating citizen support.
   - Automated Resolution Auditor: AI comparison of before-and-after photographs for repair verification.

3. **GVMC Administrative GIS Hub:**
   - Desktop-first dashboard with real-time KPI overview (SLA breaches, open/resolved count, department workloads).
   - Interactive GIS map with severity-coded pins and duplicate clusters.
   - Department and contractor work order dispatch.
   - Infrastructure digital registry and recurring issue hotspot detection.

4. **Contractor Field Portal:**
   - Dedicated task interface for field workers.
   - Work order inspection, SLA timers, and GPS navigation.
   - Before-and-after photo upload for AI resolution auditing.

5. **Offline-First & Disaster Resilience:**
   - IndexedDB report queue with automatic background synchronization upon network recovery.
   - Emergency hazard reporting (Cyclone/Flooding/Fallen Trees) with priority routing.

---

## Project Structure

```
Hackathon/
├── client/              # React 18/19, Vite, Tailwind CSS, Lucide React, PWA
│   ├── src/
│   │   ├── components/  # Reusable UI components (VoiceRecorder, StatusBadge, LocationPicker, etc.)
│   │   ├── context/     # Auth, Offline Queue, and Notification contexts
│   │   ├── pages/       # Citizen, Admin, and Contractor role pages
│   │   ├── services/    # Client API, Firebase Auth, Offline sync
│   │   └── types/       # Client-side typing
├── server/              # Node.js, Express, TypeScript, REST APIs
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Gemini AI, Geospatial deduplication, Firestore
│   │   ├── middleware/  # Auth verification, file uploads, rate limiting
│   │   └── routes/      # Clean modular REST routes
├── shared/              # Shared TypeScript definitions & domain constants
└── .env.example         # Template for environment secrets
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 1. Environment Configuration
Copy `.env.example` in both `client/` and `server/`:
```bash
# Server configuration
cp .env.example server/.env

# Client configuration
cp .env.example client/.env
```

### 2. Install Dependencies
```bash
# From workspace root
cd client && npm install
cd ../server && npm install
```

### 3. Run Locally in Development Mode
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

---

## Roles & Demo Mode
CivicPulse AI includes a role switcher in development mode:
- **Citizen:** Minimal mobile-first experience (Home, Report Issue, My Complaints, Profile).
- **GVMC Administrator:** Full municipal operations command center.
- **Contractor / Field Worker:** Work order completion and evidence upload portal.

---

## Security & Privacy Notice
- API keys (Google Gemini, Firebase Admin Service Account) are held securely on the backend server.
- Citizen exact coordinates are protected with privacy-aware handling.
- Demo mode provides high-fidelity demonstration records for Vizag wards without exposing or fabricating official municipal systems.

