import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeBrand } from "@/lib/brand-analyzer";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

const Body = z.object({ url: z.string().url() });

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const dna = await analyzeBrand(parsed.data.url);
    const saved = await prisma.brandDNA.create({
      data: {
        url: parsed.data.url,
        brandName: dna.brandName,
        industry: dna.industry,
        tagline: dna.tagline,
        valueProposition: dna.valueProposition,
        toneOfVoice: JSON.stringify(dna.toneOfVoice),
        brandPersonality: JSON.stringify(dna.brandPersonality),
        targetAudience: dna.targetAudience,
        keyMessages: JSON.stringify(dna.keyMessages),
        primaryColors: JSON.stringify(dna.primaryColors),
        secondaryColors: JSON.stringify(dna.secondaryColors),
        fonts: JSON.stringify(dna.fonts),
        logoUrl: dna.logoUrl,
        screenshotUrl: dna.screenshotUrl,
        imageryStyle: dna.imageryStyle,
        layoutStyle: dna.layoutStyle,
        rawJson: JSON.stringify(dna),
      },
    });

    await logActivity({
      brandId: saved.id,
      actor: "user",
      action: "import_brand",
      category: "brand",
      detail: `Imported and measured Brand DNA from ${parsed.data.url} ("${saved.brandName || "Brand"}")`,
      metadata: {
        brandId: saved.id,
        url: saved.url,
        industry: saved.industry,
      },
    });

    return NextResponse.json({ id: saved.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
