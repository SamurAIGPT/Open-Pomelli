import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateCampaign, type CampaignGoal } from "@/lib/campaign-generator";
import { logActivity } from "@/lib/activity";

const Body = z.object({
  brandId: z.string().min(1),
  goal: z.enum([
    "product_launch",
    "lead_generation",
    "brand_awareness",
    "engagement",
    "thought_leadership",
    "sales",
  ]),
  prompt: z.string().max(2000).optional().nullable(),
  eventId: z.string().optional().nullable(),
  opportunityId: z.string().optional().nullable(),
});

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const brand = await prisma.brandDNA.findUnique({ where: { id: parsed.data.brandId } });
  if (!brand) return NextResponse.json({ error: "brand not found" }, { status: 404 });

  try {
    const concepts = await generateCampaign(
      brand,
      parsed.data.goal as CampaignGoal,
      parsed.data.prompt ?? null,
    );
    const saved = await prisma.campaign.create({
      data: {
        brandId: brand.id,
        goal: parsed.data.goal,
        prompt: parsed.data.prompt ?? null,
        eventId: parsed.data.eventId ?? null,
        opportunityId: parsed.data.opportunityId ?? null,
        concepts: JSON.stringify(concepts),
      },
    });

    if (parsed.data.opportunityId) {
      await prisma.opportunity.update({
        where: { id: parsed.data.opportunityId },
        data: { status: "converted" },
      }).catch(() => {});
    }

    await logActivity({
      brandId: brand.id,
      actor: "user",
      action: "create_campaign",
      category: "campaign",
      detail: `Created ${parsed.data.goal} campaign with 4 on-brand concepts${
        parsed.data.eventId ? ` targeting event ${parsed.data.eventId}` : ""
      }`,
      metadata: {
        campaignId: saved.id,
        goal: saved.goal,
        prompt: saved.prompt,
        eventId: saved.eventId,
        opportunityId: saved.opportunityId,
        conceptsCount: concepts.length,
      },
    });

    return NextResponse.json({ id: saved.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
