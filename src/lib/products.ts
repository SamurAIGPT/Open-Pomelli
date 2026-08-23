import { prisma } from "./prisma";
import type { Product as PrismaProduct } from "@prisma/client";

export interface ProductItem {
  id: string;
  brandId: string;
  name: string;
  sku: string | null;
  description: string;
  price: number;
  currency: string;
  category: string | null;
  images: string[];
  benefits: string[];
  claims: string[];
  fidelityLock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function parseProduct(p: PrismaProduct): ProductItem {
  return {
    id: p.id,
    brandId: p.brandId,
    name: p.name,
    sku: p.sku,
    description: p.description,
    price: p.price,
    currency: p.currency,
    category: p.category,
    images: parseJsonList(p.images),
    benefits: parseJsonList(p.benefits),
    claims: parseJsonList(p.claims),
    fidelityLock: p.fidelityLock,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function parseJsonList(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface CreateProductInput {
  brandId: string;
  name: string;
  sku?: string | null;
  description: string;
  price: number;
  currency?: string;
  category?: string | null;
  images?: string[];
  benefits?: string[];
  claims?: string[];
  fidelityLock?: boolean;
}

export async function createProduct(input: CreateProductInput): Promise<ProductItem> {
  const row = await prisma.product.create({
    data: {
      brandId: input.brandId,
      name: input.name,
      sku: input.sku ?? null,
      description: input.description,
      price: input.price,
      currency: input.currency ?? "USD",
      category: input.category ?? null,
      images: JSON.stringify(input.images ?? []),
      benefits: JSON.stringify(input.benefits ?? []),
      claims: JSON.stringify(input.claims ?? []),
      fidelityLock: input.fidelityLock ?? true,
    },
  });
  return parseProduct(row);
}

export async function getProductsByBrand(brandId: string): Promise<ProductItem[]> {
  const rows = await prisma.product.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(parseProduct);
}

export async function getProductById(id: string): Promise<ProductItem | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? parseProduct(row) : null;
}

export async function updateProduct(
  id: string,
  input: Partial<CreateProductInput>
): Promise<ProductItem> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.sku !== undefined) data.sku = input.sku;
  if (input.description !== undefined) data.description = input.description;
  if (input.price !== undefined) data.price = input.price;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.category !== undefined) data.category = input.category;
  if (input.images !== undefined) data.images = JSON.stringify(input.images);
  if (input.benefits !== undefined) data.benefits = JSON.stringify(input.benefits);
  if (input.claims !== undefined) data.claims = JSON.stringify(input.claims);
  if (input.fidelityLock !== undefined) data.fidelityLock = input.fidelityLock;

  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return parseProduct(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

/**
 * Builds a strict anti-hallucination product fidelity directive.
 * When fidelityLock is active, the LLM is explicitly forbidden from inventing
 * unverified claims, fictional certifications, or unverified specs.
 */
export function buildProductFidelityPrompt(product: ProductItem): string {
  const claimsList =
    product.claims.length > 0
      ? product.claims.map((c) => `• [VERIFIED CLAIM]: "${c}"`).join("\n")
      : "• (No explicit verified claims listed)";

  const benefitsList =
    product.benefits.length > 0
      ? product.benefits.map((b) => `• [CUSTOMER BENEFIT]: "${b}"`).join("\n")
      : "• (No explicit benefits listed)";

  const lockDirective = product.fidelityLock
    ? `
=== STRICT PRODUCT FIDELITY LOCK (ANTI-HALLUCINATION ENFORCED) ===
1. You MUST anchor all marketing hooks, value propositions, and body copy strictly to the listed VERIFIED CLAIMS and BENEFITS.
2. NEVER invent unverified specifications, certifications, laboratory test numbers, clinical claims, or warranties.
3. Every factual assertion made in the creative MUST be directly verifiable from the claims below.
`
    : `
=== PRODUCT CONTEXT ===
Incorporate the following product details into the campaign concepts:
`;

  return `
${lockDirective}
- Target Product: ${product.name} ${product.sku ? `(SKU: ${product.sku})` : ""}
- Price Point: ${product.currency} ${product.price.toFixed(2)}
- Description: ${product.description}

VERIFIED CLAIMS:
${claimsList}

CUSTOMER BENEFITS:
${benefitsList}
==================================================================
`;
}
