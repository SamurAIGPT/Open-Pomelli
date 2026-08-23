import { NextRequest, NextResponse } from "next/server";
import { calendarService } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "120", 10);
  const category = searchParams.get("category");

  let events = calendarService.upcomingEvents(days);
  if (category) {
    events = events.filter((e) => e.category === category);
  }

  return NextResponse.json({ events });
}
