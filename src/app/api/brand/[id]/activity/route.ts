import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActivityLogs, type ActivityActor, type ActivityCategory } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") as ActivityCategory | "all") || "all";
  const actor = (searchParams.get("actor") as ActivityActor | "all") || "all";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    const result = await getActivityLogs(brandId, { category, actor, limit, offset });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
