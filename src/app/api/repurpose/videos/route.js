import { NextResponse } from "next/server";

const MUAPI_URL = process.env.MU_API_BASE_URL || "https://api.muapi.ai";
const MUAPI_KEY = process.env.MUAPIAPP_API_KEY || "";

// Authentic Repurpose Posts matching Revid.ai exactly from the screenshot
const REPURPOSE_SEED_POSTS = [
  {
    id: "ig-strat-1",
    platform: "instagram",
    title: "Think like a strategist: Content Pillars",
    authorName: "Kallaway",
    authorHandle: "kallaway",
    views: 76000,
    likes: 10400,
    comments: 132,
    shares: 890,
    duration: 38,
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-1.mp4",
    publishedDate: "2 days ago",
    hashtags: ["startup", "strategy", "content", "growth"],
    scenes: [
      {
        id: "sc-rep-1",
        badge: "STRATEGY 💡",
        narration: "Stop posting random content. You need to think like a strategist with 3 clear content pillars.",
        visualId: "clip-1",
        durationSeconds: 6,
      },
      {
        id: "sc-rep-2",
        badge: "PILLAR #1",
        narration: "Pillar one: Authority. Teach the exact mechanics of what you did to win.",
        visualId: "clip-2",
        durationSeconds: 6,
      },
      {
        id: "sc-rep-3",
        badge: "PILLAR #2",
        narration: "Pillar two: Relatability. Show the honest struggle and behind the scenes mistakes.",
        visualId: "clip-3",
        durationSeconds: 7,
      },
      {
        id: "sc-rep-4",
        badge: "ACTION 🔥",
        narration: "Save this blueprint right now and comment PILLARS for our template.",
        visualId: "clip-1",
        durationSeconds: 5,
      },
    ],
  },
  {
    id: "tt-pitch-2",
    platform: "tiktok",
    title: "A Nike sweatsuit and a $3M pitch. 🎤💰\nNO PROBLEM RECORDING",
    authorName: "AlexHormozi",
    authorHandle: "alexhormozi",
    views: 126000,
    likes: 20100,
    comments: 975,
    shares: 2400,
    duration: 178, // 2:58
    coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-2.mp4",
    publishedDate: "3 days ago",
    hashtags: ["startup", "sales", "pitch", "business"],
    scenes: [
      {
        id: "sc-rep-21",
        badge: "THE PITCH 🎤",
        narration: "I walked into the venture meeting wearing a thirty dollar Nike sweatsuit to raise three million dollars.",
        visualId: "clip-2",
        durationSeconds: 6,
      },
      {
        id: "sc-rep-22",
        badge: "THE LESSON",
        narration: "When your numbers speak for themselves, you do not need to hide behind a luxury suit.",
        visualId: "clip-3",
        durationSeconds: 7,
      },
      {
        id: "sc-rep-23",
        badge: "CLOSING",
        narration: "Focus on building an undeniable offer. The capital will follow the value.",
        visualId: "clip-1",
        durationSeconds: 6,
      },
    ],
  },
  {
    id: "tt-intern-3",
    platform: "tiktok",
    title: "Last night one of the interns got drunk and bought a puppy on the street for $800 on the company credit card...",
    authorName: "TechBroConfessions",
    authorHandle: "techbroconfessions",
    views: 305000,
    likes: 20400,
    comments: 81,
    shares: 4300,
    duration: 7, // 0:07
    coverUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-3.mp4",
    publishedDate: "1 day ago",
    hashtags: ["startup", "office", "humor", "tech"],
    scenes: [
      {
        id: "sc-rep-31",
        badge: "STORYTIME 🐶",
        narration: "Last night one of our startup interns bought a street puppy for eight hundred dollars on the corporate card.",
        visualId: "clip-3",
        durationSeconds: 4,
      },
      {
        id: "sc-rep-32",
        badge: "UPDATE",
        narration: "And now he is our official Chief Barketing Officer.",
        visualId: "clip-1",
        durationSeconds: 3,
      },
    ],
  },
  {
    id: "tt-dinner-4",
    platform: "tiktok",
    title: "Dinner with the founders after closing Series A",
    authorName: "FounderVibe",
    authorHandle: "foundervibe",
    views: 779000,
    likes: 124000,
    comments: 635,
    shares: 11200,
    duration: 19, // 0:19
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-1.mp4",
    publishedDate: "May 12, 2026",
    hashtags: ["startup", "founder", "seriesA", "dinner"],
    scenes: [
      {
        id: "sc-rep-41",
        badge: "CELEBRATION 🥂",
        narration: "Two years of living on instant ramen, and tonight we celebrated our first profitable quarter.",
        visualId: "clip-1",
        durationSeconds: 6,
      },
      {
        id: "sc-rep-42",
        badge: "GRATITUDE",
        narration: "Remember why you started. Every late night code commit was worth this table.",
        visualId: "clip-2",
        durationSeconds: 7,
      },
    ],
  },
  {
    id: "yt-monetize-5",
    platform: "youtube",
    title: "CHANNEL बनाओ 3 महीने में $ MONETISE",
    authorName: "Pushkar Raj Thakur",
    authorHandle: "pushkarrajthakur",
    views: 1000000,
    likes: 34000,
    comments: 6000,
    shares: 15000,
    duration: 620,
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-2.mp4",
    publishedDate: "4 days ago",
    hashtags: ["startup", "youtube", "monetization", "growth"],
    scenes: [
      {
        id: "sc-rep-51",
        badge: "MONETIZE 📈",
        narration: "Learn the exact formula to monetize any faceless channel in under 90 days.",
        visualId: "clip-2",
        durationSeconds: 6,
      },
      {
        id: "sc-rep-52",
        badge: "STEP 1",
        narration: "Pick high-CPM niches like finance, AI software, or enterprise SaaS.",
        visualId: "clip-3",
        durationSeconds: 6,
      },
    ],
  },
  {
    id: "yt-hook-6",
    platform: "youtube",
    title: "Hook Masterclass: How The Top 1% Write Viral Openers",
    authorName: "The Fortune Teller",
    authorHandle: "thefortuneteller",
    views: 289000,
    likes: 14000,
    comments: 484,
    shares: 3200,
    duration: 480,
    coverUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-3.mp4",
    publishedDate: "1 week ago",
    hashtags: ["startup", "hooks", "viral", "copywriting"],
    scenes: [
      {
        id: "sc-rep-61",
        badge: "HOOK SECRET 🎯",
        narration: "The first three seconds dictate eighty percent of your short video retention.",
        visualId: "clip-3",
        durationSeconds: 5,
      },
      {
        id: "sc-rep-62",
        badge: "CONTRAST",
        narration: "State an undeniable contradiction that breaks the viewer's mental autopilot.",
        visualId: "clip-1",
        durationSeconds: 6,
      },
    ],
  },
  {
    id: "yt-aichannel-7",
    platform: "youtube",
    title: "DAY 7 AI Channel: From $0.00 to $927.63 Automated Revenue",
    authorName: "Matt Par",
    authorHandle: "mattpar",
    views: 2000000,
    likes: 63000,
    comments: 1200,
    shares: 9800,
    duration: 540,
    coverUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
    videoUrl: "/videos/clip-1.mp4",
    publishedDate: "2 weeks ago",
    hashtags: ["startup", "ai", "passiveincome", "revenue"],
    scenes: [
      {
        id: "sc-rep-71",
        badge: "RESULTS 💰",
        narration: "Seven days ago we launched a completely automated AI short video channel.",
        visualId: "clip-1",
        durationSeconds: 5,
      },
      {
        id: "sc-rep-72",
        badge: "BREAKDOWN",
        narration: "Here is the exact dashboard proof showing nine hundred and twenty seven dollars in earnings.",
        visualId: "clip-2",
        durationSeconds: 7,
      },
    ],
  },
];

// Helper to poll MuAPI if task is asynchronous
async function pollMuapiPrediction(requestId, maxWaitMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const resp = await fetch(`${MUAPI_URL}/api/v1/predictions/${requestId}/result`, {
        headers: { "x-api-key": MUAPI_KEY },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) return data;
        if (data.outputs || data.results || data.videos) {
          return data.outputs || data.results || data.videos;
        }
      }
    } catch {}
  }
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      platforms = ["youtube", "instagram", "tiktok"],
      query = "startup",
      min_likes = 10000,
      max_duration = 900,
      count = 12,
    } = body;

    let liveItems = [];

    // Attempt MuAPI live search if key is configured
    if (MUAPI_KEY && !MUAPI_KEY.includes("placeholder")) {
      try {
        const platformToSearch = platforms[0] || "tiktok";
        const muResp = await fetch(`${MUAPI_URL}/api/v1/social-search-posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": MUAPI_KEY,
          },
          body: JSON.stringify({
            platform: platformToSearch,
            query: query || "startup",
            limit: count,
          }),
        });

        if (muResp.ok) {
          const muData = await muResp.json();
          let rawList = null;

          if (muData.request_id) {
            rawList = await pollMuapiPrediction(muData.request_id);
          } else if (Array.isArray(muData)) {
            rawList = muData;
          } else if (muData.results?.videos || muData.videos) {
            rawList = muData.results?.videos || muData.videos;
          }

          if (rawList && Array.isArray(rawList) && rawList.length > 0) {
            liveItems = rawList.map((item, idx) => ({
              id: item.id || `live-${idx}`,
              platform: item.platform || platformToSearch,
              title: item.title || item.text || item.description || "Trending Viral Post",
              authorName: item.authorName || item.author || "Creator",
              authorHandle: item.authorHandle || "creator",
              views: Number(item.views || item.view_count || 120000),
              likes: Number(item.likes || item.like_count || 15000),
              comments: Number(item.comments || item.comment_count || 320),
              duration: Number(item.duration || 30),
              coverUrl: item.coverUrl || item.thumbnail || REPURPOSE_SEED_POSTS[0].coverUrl,
              videoUrl: item.videoUrl || "/videos/clip-1.mp4",
              publishedDate: "Just now",
              hashtags: [query.replace("#", "") || "viral"],
              scenes: [
                {
                  id: `sc-live-${idx}-1`,
                  badge: "REMIX ⚡",
                  narration: item.title || "Remix this trending concept with your own unique angle.",
                  visualId: "clip-1",
                  durationSeconds: 5,
                },
                {
                  id: `sc-live-${idx}-2`,
                  badge: "VALUE",
                  narration: "Deliver your highest impact insight and call to action.",
                  visualId: "clip-2",
                  durationSeconds: 6,
                },
              ],
            }));
          }
        }
      } catch (muErr) {
        console.warn("MuAPI live search fallback to seed:", muErr);
      }
    }

    // Combine live results with seed posts
    const allPosts = [...liveItems, ...REPURPOSE_SEED_POSTS];

    // Filter by platforms
    let filtered = allPosts.filter((p) => platforms.includes(p.platform));

    // Filter by min likes
    if (min_likes > 0) {
      filtered = filtered.filter((p) => p.likes >= min_likes);
    }

    // Filter by max duration (in seconds)
    if (max_duration > 0) {
      filtered = filtered.filter((p) => p.duration <= max_duration);
    }

    // Filter by query/topic if provided
    if (query && query !== "startup" && query !== "all") {
      const q = query.toLowerCase().replace("#", "");
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.hashtags.some((t) => t.toLowerCase().includes(q))
      );
      if (filtered.length === 0) {
        // Fallback to all if strict filter has no match
        filtered = allPosts;
      }
    }

    return NextResponse.json({
      success: true,
      videos: filtered,
      total: filtered.length,
    });
  } catch (err) {
    console.error("Repurpose API error:", err);
    return NextResponse.json({ error: "Failed to fetch repurpose videos" }, { status: 500 });
  }
}
