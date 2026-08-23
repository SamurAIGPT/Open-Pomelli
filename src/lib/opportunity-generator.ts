import { prisma } from "./prisma";
import { calendarService, type UpcomingMarketingEvent } from "./calendar";
import { muapi } from "./muapi";
import { generateCampaign, type CampaignGoal } from "./campaign-generator";
import type { BrandDNA } from "@prisma/client";

const MATCH_WINDOW_DAYS = 90;

const EVENT_KEYWORDS: Record<string, string[]> = {
  "back-to-school-2026": ["school", "student", "backpack", "study", "laptop", "notebook", "stationery", "education", "course", "desk", "routine", "planner"],
  "labor-day-2026": ["outdoor", "bbq", "grill", "sale", "end of summer", "travel", "family", "getaway", "weekend"],
  "fall-equinox-2026": ["fall", "autumn", "cozy", "layer", "sweater", "warm", "harvest", "season", "comfort", "decor", "home"],
  "halloween-2026": ["costume", "candy", "spooky", "pumpkin", "party", "scary", "fun", "night", "treat", "apparel"],
  "diwali-2026": ["diwali", "light", "festive", "gift", "sweets", "home", "decor", "celebration", "gold", "jewelry", "tradition"],
  "singles-day-2026": ["deal", "discount", "shopping", "tech", "gadget", "lifestyle", "treat yourself", "flash sale", "fashion"],
  "thanksgiving-2026": ["family", "gather", "home", "kitchen", "cook", "gratitude", "food", "table", "celebrate", "feast"],
  "black-friday-2026": ["sale", "deal", "discount", "gift", "exclusive", "doorbuster", "limited", "save", "offer", "bundle"],
  "small-business-saturday-2026": ["local", "handmade", "small business", "artisan", "independent", "craft", "unique", "boutique"],
  "cyber-monday-2026": ["tech", "online", "deal", "discount", "software", "app", "digital", "gadget", "electronics", "e-commerce"],
  "winter-solstice-2026": ["winter", "cozy", "warm", "light", "snow", "hibernate", "comfort", "blanket", "tea", "coffee"],
  "christmas-2026": ["gift", "holiday", "family", "festive", "tree", "present", "december", "joy", "bundle", "stocking"],
  "boxing-day-2026": ["sale", "clearance", "deal", "discount", "post-holiday", "wrap up", "savings"],
  "new-years-eve-2026": ["celebrate", "party", "champagne", "night", "glam", "outfit", "countdown", "cheers"],
  "new-years-day-2027": ["resolution", "fresh start", "fitness", "wellness", "health", "goal", "habits", "productivity", "renew"],
  "lunar-new-year-2027": ["red", "luck", "family", "gift", "prosperity", "fortune", "spring", "celebrate"],
  "ramadan-2027": ["ramadan", "iftar", "family", "gift", "spirit", "gather", "community", "charity", "evening"],
  "valentines-day-2027": ["gift", "love", "romance", "chocolate", "jewelry", "flowers", "roses", "date", "sweetheart", "beauty"],
  "eid-al-fitr-2027": ["eid", "gift", "family", "celebrate", "feast", "festive", "apparel"],
  "spring-equinox-2027": ["spring", "fresh", "renew", "bloom", "floral", "clean", "outdoor", "bright", "energy"],
  "easter-2027": ["easter", "spring", "family", "gift", "pastel", "egg", "brunch", "sunday"],
  "earth-day-2027": ["sustainable", "eco", "recycled", "earth", "green", "organic", "planet", "ethical", "clean"],
  "mothers-day-2027": ["mom", "mother", "gift", "flowers", "jewelry", "self-care", "spa", "love", "care", "appreciation"],
  "fathers-day-2027": ["dad", "father", "gift", "grill", "tools", "tech", "gadget", "watch", "outdoors", "whiskey"],
  "summer-solstice-2027": ["summer", "sun", "outdoor", "vacation", "beach", "pool", "trip", "swim", "refresh"],
  "amazon-prime-day-2027": ["midyear", "mega sale", "flash sale", "deal", "discount", "exclusive", "bundle"],
};

const BROADLY_RELEVANT_CATEGORIES = new Set(["shopping", "seasonal"]);

function parseList(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export interface MatchScore {
  score: number;
  matchedKeywords: string[];
}

export function matchBrandToEvent(event: UpcomingMarketingEvent, brand: BrandDNA): MatchScore {
  const keywords = EVENT_KEYWORDS[event.id] ?? [];
  const tone = parseList(brand.toneOfVoice);
  const personality = parseList(brand.brandPersonality);
  const messages = parseList(brand.keyMessages);

  const brandCorpus = [
    brand.brandName,
    brand.industry,
    brand.tagline,
    brand.valueProposition,
    brand.targetAudience,
    brand.imageryStyle,
    brand.layoutStyle,
    ...tone,
    ...personality,
    ...messages,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = BROADLY_RELEVANT_CATEGORIES.has(event.category) ? 1.5 : 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    if (brandCorpus.includes(keyword.toLowerCase())) {
      score += 2.0;
      matchedKeywords.push(keyword);
    }
  }

  return { score, matchedKeywords };
}

export function calculatePriority(daysAway: number, matchScore: number): "high" | "medium" | "low" {
  const proximityWeight = daysAway <= 14 ? 3.5 : daysAway <= 30 ? 2.5 : daysAway <= 60 ? 1.5 : 0.5;
  const total = proximityWeight + matchScore;

  if (total >= 4.5) return "high";
  if (total >= 2.0) return "medium";
  return "low";
}

export function templateCreative(
  event: UpcomingMarketingEvent,
  brand: BrandDNA,
): { angle: string; suggestedOffer: string } {
  const name = brand.brandName || "your brand";
  let angle = `Spotlight ${name} for ${event.name}`;
  let suggestedOffer = "Special seasonal promotion";

  if (event.category === "shopping") {
    angle = `Launch an exclusive ${event.name} limited-time shopping event for ${name}`;
    suggestedOffer = "Limited-time bundle deal & free shipping";
  } else if (event.category === "seasonal") {
    angle = `Celebrate the ${event.name} with a curated seasonal refresh campaign`;
    suggestedOffer = "Seasonal collection discount";
  } else if (event.category === "cultural" || event.category === "holiday") {
    angle = `Deliver memorable ${event.name} gifting and celebration moments with ${name}`;
    suggestedOffer = "Festive gift guide & exclusive bonus gift";
  }

  return { angle, suggestedOffer };
}

export async function sharpenCreativeWithAI(
  event: UpcomingMarketingEvent,
  brand: BrandDNA,
): Promise<{ angle: string; suggestedOffer: string }> {
  try {
    if (!process.env.MUAPI_API_KEY) {
      return templateCreative(event, brand);
    }

    const tone = parseList(brand.toneOfVoice).join(", ") || "friendly, modern";
    const prompt = `You are a strategic creative director.
Brand: ${brand.brandName || "The Brand"}
Industry: ${brand.industry || "General"}
Tagline: ${brand.tagline || "—"}
Value Proposition: ${brand.valueProposition || "—"}
Tone of voice: ${tone}

Upcoming marketing event: "${event.name}" (${event.daysAway} days away, category: ${event.category}). Event description: "${event.description || ""}".

Generate:
1. "angle": 1 sharp, evocative, on-brand campaign hook sentence specifically connecting this brand to this event.
2. "suggestedOffer": 1 enticing, concrete promotion, bundle, or campaign offer (e.g. "20% off bundles with promo code SPOOKY20", "Curated Holiday Gift Box with complimentary tote").

Return STRICT JSON only, with no markdown fences, matching this exact shape:
{"angle": "...", "suggestedOffer": "..."}`;

    const text = await muapi.text(prompt, "gpt-5-nano");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return templateCreative(event, brand);
    const parsed = JSON.parse(m[0]);
    return {
      angle: String(parsed.angle || templateCreative(event, brand).angle),
      suggestedOffer: String(parsed.suggestedOffer || templateCreative(event, brand).suggestedOffer),
    };
  } catch (error) {
    console.warn("AI angle sharpening fallback to template:", error);
    return templateCreative(event, brand);
  }
}

export async function scanBrandOpportunities(brandId: string) {
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error(`Brand not found: ${brandId}`);

  const events = calendarService.upcomingEvents(MATCH_WINDOW_DAYS);
  const results = [];

  for (const event of events) {
    const { score } = matchBrandToEvent(event, brand);
    if (score <= 0) continue;

    const priority = calculatePriority(event.daysAway, score);
    const creative = await sharpenCreativeWithAI(event, brand);

    const opp = await prisma.opportunity.upsert({
      where: {
        brandId_eventId: {
          brandId: brand.id,
          eventId: event.id,
        },
      },
      create: {
        brandId: brand.id,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        category: event.category,
        angle: creative.angle,
        suggestedOffer: creative.suggestedOffer,
        priority,
        status: "new",
      },
      update: {
        eventName: event.name,
        eventDate: event.date,
        category: event.category,
        angle: creative.angle,
        suggestedOffer: creative.suggestedOffer,
        priority,
      },
    });

    results.push(opp);
  }

  return results;
}

export async function convertOpportunityToCampaign(brandId: string, opportunityId: string) {
  const [brand, opp] = await Promise.all([
    prisma.brandDNA.findUnique({ where: { id: brandId } }),
    prisma.opportunity.findUnique({ where: { id: opportunityId } }),
  ]);

  if (!brand) throw new Error("Brand not found");
  if (!opp) throw new Error("Opportunity not found");

  const goal: CampaignGoal = opp.category === "shopping" ? "sales" : "brand_awareness";
  const userPrompt = `Event: ${opp.eventName}. Strategic Angle: ${opp.angle}. Suggested Offer: ${opp.suggestedOffer || "Special promotion"}`;

  const concepts = await generateCampaign(brand, goal, userPrompt);

  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      goal,
      prompt: `[${opp.eventName}] ${opp.angle}`,
      eventId: opp.eventId,
      opportunityId: opp.id,
      concepts: JSON.stringify(concepts),
    },
  });

  await prisma.opportunity.update({
    where: { id: opp.id },
    data: { status: "converted" },
  });

  return campaign;
}
