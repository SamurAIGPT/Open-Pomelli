import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanBrandOpportunities } from "@/lib/opportunity-generator";

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
    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
