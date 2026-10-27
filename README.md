# 🎬 Revid.ai Studio — AI Viral Video & Short-Form Generator

> **A beautifully designed, state-of-the-art AI video creation studio.** Built with Next.js (App Router), Tailwind CSS, Remotion, and Supabase tools. Turn text prompts, scripts, or topics into viral short-form videos (TikTok, Instagram Reels, YouTube Shorts) complete with animated karaoke subtitles, AI voiceovers, stock footage, and background music.

---

## ✨ Features

- **Prompt-to-Video Engine:** Input any idea, topic, or script, and the AI automatically generates an attention-grabbing hook, body scenes, and a call-to-action.
- **Remotion Video Composition:** Real-time in-browser video player with millisecond-accurate timeline scrubbing, previewing, and aspect-ratio adjustments.
- **Dynamic Animated Subtitles (Hormozi / TikTok Style):** Word-by-word highlighted captions with bounce animations and multiple styling presets (*Hormozi Gold*, *Neon Cyber*, *Beast Fire*, *Modern Clean*, *Comic Pop*).
- **Multi-Ratio Support:** Switch between `9:16` (Vertical TikTok/Reels/Shorts), `16:9` (Landscape YouTube), and `1:1` (Square Instagram Feed / LinkedIn).
- **Interactive Multi-Scene Timeline:** Click to seek scenes, edit narration text inline, swap visual loops, and adjust per-scene durations.
- **Curated Media Library:** High-energy video loops across tech, luxury, nature, abstract, and cinematic categories.
- **AI Voiceover & Background Music:** Multi-voice narrators and royalty-free soundtracks with automatic volume ducking under speech.
- **Viral Social Packaging & Export:** One-click generation of viral video captions, hashtags, and downloadable MP4 render manifests.
- **Supabase Integration:** Syncs video projects and export logs directly to Supabase with automatic local fallback support.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Video Engine:** [Remotion](https://www.remotion.dev/) (`@remotion/player`, `remotion`)
- **Database & Storage:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`, PostgreSQL)
- **Icons & Polish:** [Lucide React](https://lucide.dev/), `canvas-confetti`

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
cd apps/revid-ai-studio
npm install
```

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Set your Supabase and AI provider credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database URLs (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:your-password@your-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:your-password@your-host:5432/postgres"

# AI Generation Engine (Optional)
MUAPIAPP_API_KEY="your-muapi-key"
OPENAI_API_KEY="your-openai-key"
```

### 3. Run Supabase Database Migration (Optional)

Run the SQL migration in `supabase/schema.sql` inside your [Supabase SQL Editor](https://supabase.com/dashboard) to create the `video_projects` and `video_renders` tables. *(Note: The application includes full offline local storage support out of the box if Supabase is not yet configured).*

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the video studio.

---

## 🗄️ Database Architecture

The application uses two primary Supabase tables:

1. **`video_projects`**: Persists video storyboards, narration scripts, selected visuals, caption styling, audio settings, and aspect ratios.
2. **`video_renders`**: Tracks exported video files, rendered durations, and CDN asset URLs.

---

## 📦 Production Build

```bash
npm run build
npm start
```
