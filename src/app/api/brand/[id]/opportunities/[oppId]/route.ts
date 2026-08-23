import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { convertOpportunityToCampaign } from "@/lib/opportunity-generator";
import { z } from "zod";

export const maxDuration = 180;

const PatchBody = z.object({
  status: z.enum(["new", "converted", "dismissed"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; oppId: string }> }
) {
  const { id: brandId, oppId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const opp = await prisma.opportunity.findFirst({
    where: { id: oppId, brandId },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  const updated = await prisma.opportunity.update({
    where: { id: oppId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ opportunity: updated });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; oppId: string }> }
) {
  const { id: brandId, oppId } = await params;

  try {
    const campaign = await convertOpportunityToCampaign(brandId, oppId);
    return NextResponse.json({ campaignId: campaign.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
