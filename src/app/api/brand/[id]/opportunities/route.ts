import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanBrandOpportunities } from "@/lib/opportunity-generator";

import { logActivity } from "@/lib/activity";

export const maxDuration = 180;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  let opportunities = await prisma.opportunity.findMany({
    where: { brandId },
    orderBy: { eventDate: "asc" },
  });

  // If no opportunities exist yet, run an initial scan
  if (opportunities.length === 0) {
    try {
      opportunities = await scanBrandOpportunities(brandId);
      await logActivity({
        brandId,
        actor: "system",
        action: "scan_opportunities",
        category: "calendar",
        detail: `Auto-scanned marketing calendar: found ${opportunities.length} matched opportunities`,
      });
    } catch (e) {
      console.error("Initial opportunity scan failed:", e);
    }
  }

  return NextResponse.json({ opportunities });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  try {
    const opportunities = await scanBrandOpportunities(brandId);
    await logActivity({
      brandId,
      actor: "user",
      action: "scan_opportunities",
      category: "calendar",
      detail: `Scanned 90-day marketing calendar: updated ${opportunities.length} campaign opportunities`,
    });
    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
