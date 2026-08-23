export type EventCategory = "shopping" | "holiday" | "cultural" | "seasonal";

export interface MarketingEvent {
  id: string;
  name: string;
  date: string;
  country?: string;
  category: EventCategory;
  description?: string;
}

export interface UpcomingMarketingEvent extends MarketingEvent {
  daysAway: number;
}

export const SEED_MARKETING_EVENTS: MarketingEvent[] = [
  // 2026 - Q3 & Q4
  { id: "back-to-school-2026", name: "Back to School Season", date: "2026-08-01", country: "US", category: "shopping", description: "Peak student and academic shopping period" },
  { id: "labor-day-2026", name: "Labor Day", date: "2026-09-07", country: "US", category: "holiday", description: "End of summer holiday sales and outdoor events" },
  { id: "fall-equinox-2026", name: "Fall Equinox (Autumn begins)", date: "2026-09-22", category: "seasonal", description: "Autumn wardrobe and seasonal lifestyle refresh" },
  { id: "halloween-2026", name: "Halloween", date: "2026-10-31", category: "cultural", description: "Spooky themed campaigns, costumes, and party goods" },
  { id: "diwali-2026", name: "Diwali (Festival of Lights)", date: "2026-11-08", category: "cultural", description: "Festive gifting, home decor, and celebratory purchases" },
  { id: "singles-day-2026", name: "Singles' Day (11.11)", date: "2026-11-11", category: "shopping", description: "Global mega shopping festival" },
  { id: "thanksgiving-2026", name: "Thanksgiving", date: "2026-11-26", country: "US", category: "holiday", description: "Family gatherings, festive feasts, and gratitude" },
  { id: "black-friday-2026", name: "Black Friday", date: "2026-11-27", category: "shopping", description: "The biggest shopping event of the year" },
  { id: "small-business-saturday-2026", name: "Small Business Saturday", date: "2026-11-28", country: "US", category: "shopping", description: "Support local and independent brands" },
  { id: "cyber-monday-2026", name: "Cyber Monday", date: "2026-11-30", category: "shopping", description: "Online tech and e-commerce flash sales" },
  { id: "winter-solstice-2026", name: "Winter Solstice", date: "2026-12-21", category: "seasonal", description: "First day of winter, cozy warmth, holiday rush" },
  { id: "christmas-2026", name: "Christmas Day", date: "2026-12-25", category: "holiday", description: "Peak gift-giving and festive celebration" },
  { id: "boxing-day-2026", name: "Boxing Day Sales", date: "2026-12-26", category: "shopping", description: "Post-holiday clearance and seasonal deals" },
  { id: "new-years-eve-2026", name: "New Year's Eve", date: "2026-12-31", category: "holiday", description: "Celebration, countdown, and party campaigns" },

  // 2027 - Q1 & Q2
  { id: "new-years-day-2027", name: "New Year's Day & Fresh Start", date: "2027-01-01", category: "holiday", description: "Resolutions, fitness, wellness, and self-improvement" },
  { id: "lunar-new-year-2027", name: "Lunar New Year (Year of the Goat)", date: "2027-02-06", category: "cultural", description: "Spring festival, prosperity, red packets, and family" },
  { id: "ramadan-2027", name: "Ramadan begins", date: "2027-02-08", category: "cultural", description: "Month of reflection, generosity, and nightly gatherings" },
  { id: "valentines-day-2027", name: "Valentine's Day", date: "2027-02-14", category: "holiday", description: "Romantic gifts, jewelry, dining, and treats" },
  { id: "eid-al-fitr-2027", name: "Eid al-Fitr", date: "2027-03-09", category: "cultural", description: "Celebration, festive gifting, and new clothes" },
  { id: "spring-equinox-2027", name: "Spring Equinox (Spring begins)", date: "2027-03-20", category: "seasonal", description: "Spring cleaning, renewal, and fresh outdoor energy" },
  { id: "easter-2027", name: "Easter", date: "2027-03-28", category: "holiday", description: "Spring treats, family lunches, and pastel themes" },
  { id: "earth-day-2027", name: "Earth Day", date: "2027-04-22", category: "cultural", description: "Sustainability, eco-friendly initiatives, and green products" },
  { id: "mothers-day-2027", name: "Mother's Day", date: "2027-05-09", country: "US", category: "holiday", description: "Gifts of appreciation for moms and maternal figures" },
  { id: "fathers-day-2027", name: "Father's Day", date: "2027-06-20", country: "US", category: "holiday", description: "Gifts for dads, outdoor gear, tech, and relaxation" },
  { id: "summer-solstice-2027", name: "Summer Solstice (Summer begins)", date: "2027-06-21", category: "seasonal", description: "Summer vacation, travel, sunshine, and festivals" },
  { id: "amazon-prime-day-2027", name: "Summer Midyear Mega Sale", date: "2027-07-14", category: "shopping", description: "Mid-year flash discounts and member exclusives" },
];

export function daysUntil(dateIso: string): number {
  const eventDate = Date.parse(`${dateIso}T00:00:00Z`);
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((eventDate - todayUtc) / 86_400_000);
}

export class CalendarService {
  private readonly events: MarketingEvent[];

  constructor(customEvents: MarketingEvent[] = []) {
    this.events = [...SEED_MARKETING_EVENTS, ...customEvents];
  }

  upcomingEvents(days = 120): UpcomingMarketingEvent[] {
    return this.events
      .map((event) => ({ ...event, daysAway: daysUntil(event.date) }))
      .filter((event) => event.daysAway >= 0 && event.daysAway <= days)
      .sort((a, b) => a.daysAway - b.daysAway);
  }

  allEvents(): UpcomingMarketingEvent[] {
    return this.events
      .map((event) => ({ ...event, daysAway: daysUntil(event.date) }))
      .sort((a, b) => a.daysAway - b.daysAway);
  }

  getEvent(id: string): MarketingEvent | null {
    return this.events.find((event) => event.id === id) ?? null;
  }
}

export const calendarService = new CalendarService();
