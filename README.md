# 🎬 Revid.ai Studio — AI Viral Video & Short-Form Content Generator

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![Remotion](https://img.shields.io/badge/Remotion-4.0-blue?style=for-the-badge&logo=remotion)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional, production-ready AI video creation studio and multi-track editor built with Next.js, Remotion, and PostgreSQL.**  
Turn text prompts, viral topics, or existing YouTube/TikTok URLs into high-performing short-form videos with word-level karaoke subtitles, AI voiceovers, stock footage, and background soundtracks.

[Features](#-key-features) • [Editor Workspace](#-11-revid-ai-video-editor-workspace) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Getting Started](#-getting-started) • [API Routes](#-api-routes) • [Database Architecture](#-database-architecture)

</div>

---

## ✨ Key Features

- **🚀 1:1 Revid.ai Video Editor Experience:** Full-featured in-browser video editor with a 3-track timeline, interactive playhead scrubber, timecode display, zoom scaling, and dynamic tool drawers.
- **⚡ Prompt-to-Video Engine:** Automatically generates high-retention hooks, body scenes, and calls-to-action tailored for short-form virality.
- **🔍 Viral Repurposing & Video Search Engine (`/search`, `/repurpose`):** Discover trending content across TikTok, YouTube Shorts, and Instagram Reels with viral metrics (views, likes, shares, virality scores) and remix them with one click.
- **🎞️ Real-Time Remotion Player:** Millisecond-accurate rendering engine running directly in the browser with 30fps smooth playback, frame-accurate seeking, and spacebar play/pause.
- **🎨 Dynamic Animated Subtitles (Karaoke / Hormozi Style):** Word-by-word synchronized highlighting with customizable animation presets (_Hormozi Gold_, _Neon Cyber_, _Beast Fire_, _Modern Clean_, _Comic Pop_).
- **📐 Multi-Aspect Ratio Switcher:** Effortlessly switch between `9:16` (Vertical TikTok/Reels/Shorts), `16:9` (Landscape YouTube/Desktop), and `1:1` (Square Instagram/LinkedIn).
- **🛡️ Social Safe Zones Guide:** Overlay toggle showing TikTok, Instagram Reels, and YouTube Shorts UI boundary safe areas to avoid hidden captions or icons.
- **🎵 Multi-Track Audio Engine:** Dedicated background soundtrack waveform lane (Track 1) with volume controls, audio replacement, and speech-to-captions generation.
- **🔐 Google OAuth & Zero-Credential Guest Mode:** Authenticate via NextAuth Google OAuth with automatic credit provisioning (50 free starter credits) and offline guest fallback.
- **☁️ Cloud Autosave & Undo/Redo:** Real-time persistence to PostgreSQL via Prisma ORM with undo/redo history stacks.

---

## 🖥️ 1:1 Revid.ai Video Editor Workspace

The video editor (`/editor/[id]`) mirrors the exact layout and interactions of Revid.ai:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎬 Revid.ai Header (Project Title, Cloud Saved Status, Undo/Redo, Aspect, Export) │
├───────────┬──────────────────────┬──────────────────────────────────────────┤
│           │                      │                                          │
│   TOOL    │   COLLAPSIBLE        │             CANVAS VIEWPORT              │
│   RAIL    │   SUBPANEL           │                                          │
│           │                      │    ┌───────────────────────────────┐     │
│  ✨ AI    │  📁 Media Library    │    │ 📷 revid.ai       [Safe Zones]│     │
│  📝 Script│  🎬 Stock Footage    │    │                               │     │
│  🔤 Text  │  🎵 Audio Waveforms  │    │      Remotion Composition     │     │
│  🎞️ Media │  💬 Captions Styler  │    │     (Monk / Video / Captions) │     │
│  🔊 Audio │  🤖 Script Prompter  │    │                               │     │
│  💬 Subs  │                      │    └───────────────────────────────┘     │
│           │                      │        8 Anchor Selection Handles        │
├───────────┴──────────────────────┴──────────────────────────────────────────┤
│ ✂️ Split Tool  |  ⏮️ ⏯️ ⏭️  00:12.16 / 02:01.34  |  🔍 Zoom 135%  | ⛶ Fullscreen│
├─────────────────────────────────────────────────────────────────────────────┤
│ MULTI-TRACK TIMELINE:                                                       │
│ [3] 💬 Subtitles Lane:  [ Hook Caption ] [ Scene 2 Text ] [ Outro Caption ] │
│ [2] 🎞️ Video Scene Lane: [ Clip 1 (5s) ] [ Clip 2 (8s) ] [ Clip 3 (4s) ]    │
│ [1] 🎵 Audio Track Lane: [ Solid Teal Waveform: 1793086207095-audio.mp3   ] │
│ ──────────────────────────────▼──────────────────────────────────────────── │
│                         [00:12.16] (Green Draggable Playhead Scrubber)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Timeline Controls & Keyboard Shortcuts

| Shortcut / Action                  | Function                                              |
| :--------------------------------- | :---------------------------------------------------- |
| **`Space`**                        | Play / Pause video playback                           |
| **`S`**                            | Split selected scene at playhead position             |
| **`Ctrl + Z` / `Cmd + Z`**         | Undo last modification                                |
| **`Ctrl + Y` / `Cmd + Shift + Z`** | Redo modification                                     |
| **Click / Drag Scrubber**          | Scrub anywhere across ruler or track lanes            |
| **Zoom Slider**                    | Adjust timeline width from 50% to 200% (default 135%) |

---

## 🛠️ Tech Stack

- **Frontend & Fullstack Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Video Composition & Playback Engine:** [Remotion](https://www.remotion.dev/) (`@remotion/player`, `remotion`)
- **Database & ORM:** [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-pg` & [Supabase PostgreSQL](https://supabase.com/)
- **Authentication:** [NextAuth.js v4](https://next-auth.js.org/) with Google OAuth Provider & Prisma Adapter
- **Icons & UI Utilities:** [Lucide React](https://lucide.dev/), `canvas-confetti`

---

## 📂 Project Structure

```
apps/revid-ai-studio/
├── prisma/
│   ├── schema.prisma             # Database schema (User, Project, Render, Session)
│   └── migrations/               # PostgreSQL migrations
├── public/
│   └── videos/                   # Curated background loops (clip-1.mp4, clip-2.mp4, etc.)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth Google OAuth & session endpoints
│   │   │   ├── generate-script/  # AI script & storyboard generation endpoint
│   │   │   ├── projects/         # Project persistence (GET, POST, PUT, DELETE)
│   │   │   ├── repurpose/        # Viral video search & remix scraper
│   │   │   └── user/credits/     # User credit balance and top-up endpoint
│   │   ├── editor/
│   │   │   ├── [id]/page.js      # Dynamic 1:1 Revid AI video editor page
│   │   │   └── new/page.js       # Auto-provisioning unique editor session
│   │   ├── repurpose/page.js     # Viral video repurposer workspace
│   │   ├── search/page.js        # Viral video search & trends catalog
│   │   ├── layout.js             # Root layout with Auth & Editor providers
│   │   └── page.js               # Landing page & dashboard
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorCanvas.jsx         # Video canvas with Remotion Player & handles
│   │   │   ├── EditorHeader.jsx         # Title, autosave status, export triggers
│   │   │   ├── EditorSubpanel.jsx       # Media, Audio, Script, Captions subpanel
│   │   │   ├── EditorTimeline.jsx       # 3-track timeline with draggable scrubber
│   │   │   ├── EditorToolRail.jsx       # Left navigation tool rail
│   │   │   ├── EditorTransportBar.jsx   # Play/Pause, Timecode, Split, Zoom
│   │   │   └── SafeZonesOverlay.jsx     # TikTok/Reels/Shorts safe zones guide
│   │   ├── video/
│   │   │   └── RevidVideoComposition.jsx# Remotion video composition engine
│   │   └── auth/
│   │       ├── LoginModal.jsx           # Google OAuth sign-in modal
│   │       └── TopUpCreditsModal.jsx    # Credit packages purchase modal
│   ├── context/
│   │   └── VideoEditorContext.jsx       # Master editor state management & history
│   └── lib/
│       ├── constants.js                 # Media catalog, caption styles, voices
│       ├── db.js                        # Database abstraction layer
│       └── prisma.js                    # Prisma client singleton with pg pool
├── next.config.mjs                      # Next.js configuration
├── package.json                         # Dependencies & scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js:** v18.17+ (v20+ recommended)
- **Package Manager:** npm or yarn
- **PostgreSQL Database:** Supabase or any standard PostgreSQL instance

### 2. Clone the Repository

```bash
git clone https://github.com/SamurAIGPT/revid-ai-studio.git
cd revid-ai-studio
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-32-char-secret"

# PostgreSQL Database (Supabase / Neon / Local Postgres)
DATABASE_URL="postgresql://postgres:password@your-db-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@your-db-host:5432/postgres"

# Google OAuth Credentials (Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Supabase Client & AI API Keys
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
OPENAI_API_KEY="your-openai-api-key"
```

### 5. Initialize the Database

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the studio.

---

## 📡 API Routes

| Endpoint                  | Method                 | Description                                                                     |
| :------------------------ | :--------------------- | :------------------------------------------------------------------------------ |
| `/api/generate-script`    | `POST`                 | Generates structured hooks, scene narrations, and duration targets from a topic |
| `/api/projects`           | `GET`, `POST`          | Fetches user's saved video projects or creates a new project                    |
| `/api/projects/[id]`      | `GET`, `PUT`, `DELETE` | Retrieves, saves/autosaves, or deletes a specific video project                 |
| `/api/repurpose/search`   | `GET`                  | Fetches trending videos from TikTok, YouTube Shorts, and Reels with metrics     |
| `/api/user/credits`       | `GET`, `POST`          | Checks current credit balance and handles credit top-ups                        |
| `/api/auth/[...nextauth]` | `GET`, `POST`          | NextAuth.js OAuth callback and session handling                                 |

---

## 🗄️ Database Architecture

The PostgreSQL schema managed by Prisma includes:

- **`User`**: User profile, Google avatar, available credits (default 50), custom API keys.
- **`Account` / `Session`**: NextAuth.js OAuth session and token persistence.
- **`video_projects`**: Full project storyboard, scenes JSON array, aspect ratio, caption styles, music settings, and timestamps.
- **`video_renders`**: Manifest logs of rendered video exports, output durations, and download URLs.
- **`saved_videos`**: Bookmarked viral clips scraped from TikTok, Reels, or Shorts for repurposing.
- **`credit_transactions`**: Audit trail of credit usage (video generations, exports, top-ups).

---

## 📦 Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the MIT License.
