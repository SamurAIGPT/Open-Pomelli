import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrandApprovalQueue } from "@/lib/approvals";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  try {
    const queue = await getBrandApprovalQueue(brandId);
    return NextResponse.json(queue);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
