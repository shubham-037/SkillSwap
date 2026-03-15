# SkillSwap — Peer-to-Peer Skill Exchange Platform

A modern, serverless web application for exchanging skills peer-to-peer. Teach what you know, learn what you love. Built for the modern web with high performance and real-time synchronization at its core.

## 🚀 Vision
SkillSwap democratizes education by allowing users to trade skills directly. No tuition, no barriers—just pure knowledge exchange.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript |
| **Styling** | Tailwind CSS (Glassmorphic UI) |
| **Database** | Firebase Firestore (Real-time NoSQL) |
| **Auth** | Firebase Authentication |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

## ✨ Features

- **Real-time Discovery** — Search for partners based on skills you want to learn or teach.
- **Smart Connections** — Send and manage match requests in real-time.
- **Instant Chat** — Direct messaging powered by Firestore for millisecond latency.
- **Session Scheduling** — Integrated calendar to book and track your learning exchanges.
- **Live Dashboard** — Real-time stats on your matches, skills, and upcoming sessions.
- **Resilient Design** — Advanced error handling for connectivity and database indexing.

## 🚦 Quick Start

### 1. Requirements
- Node.js 18+
- A Google Firebase Project

### 2. Environment Setup
Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation & Run

```bash
cd client
npm install
npm run dev
```

The app will be live at `http://localhost:3000`.

## 📂 Project Structure

```
├── client/
│   ├── src/
│   │   ├── app/            # Next.js App Router (Pages & Layouts)
│   │   ├── components/     # Reusable UI Components
│   │   ├── lib/            # Firebase config, Zustand stores, and utilities
│   │   └── types/          # Global TypeScript interfaces
```

## 📜 Firestore Security Rules
Ensure your Firestore rules allow authenticated users to read/write their own data and match records.

## 📈 Roadmap
- [ ] AI-powered matchmaking
- [ ] In-app video calling (WebRTC)
- [ ] Gamified credit system
- [ ] Skill verification badges
