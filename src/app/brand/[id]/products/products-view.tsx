"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductItem } from "@/lib/products";

export function ProductsView({
  brandId,
  initialProducts,
}: {
  brandId: string;
  initialProducts: ProductItem[];
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [images, setImages] = useState<string[]>([]);
  const [benefitsText, setBenefitsText] = useState("");
  const [claimsText, setClaimsText] = useState("");
  const [fidelityLock, setFidelityLock] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreateModal() {
    setEditingProduct(null);
    setName("");
    setSku("");
    setCategory("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setImages([]);
    setBenefitsText("");
    setClaimsText("");
    setFidelityLock(true);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(prod: ProductItem) {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku || "");
    setCategory(prod.category || "");
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCurrency(prod.currency);
    setImages(prod.images);
    setBenefitsText(prod.benefits.join("\n"));
    setClaimsText(prod.claims.join("\n"));
    setFidelityLock(prod.fidelityLock);
    setError(null);
    setModalOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/brand/${brandId}/products/upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImages((prev) => [...prev, json.url]);
    } catch (e) {
      setError(String(e));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim() || price === "") return;
    setSaving(true);
    setError(null);

    const benefits = benefitsText.split("\n").map((b) => b.trim()).filter(Boolean);
    const claims = claimsText.split("\n").map((c) => c.trim()).filter(Boolean);

    try {
      if (editingProduct) {
        const res = await fetch(`/api/brand/${brandId}/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            sku: sku.trim() || null,
            category: category.trim() || null,
            description: description.trim(),
            price: parseFloat(price),
            currency: currency.toUpperCase(),
            images,
            benefits,
            claims,
            fidelityLock,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
      } else {
        const res = await fetch(`/api/brand/${brandId}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            sku: sku.trim() || null,
            category: category.trim() || null,
            description: description.trim(),
            price: parseFloat(price),
            currency: currency.toUpperCase(),
            images,
            benefits,
            claims,
            fidelityLock,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
        setProducts((prev) => [data.product, ...prev]);
      }
      setModalOpen(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, prodName: string) {
    if (!confirm(`Are you sure you want to delete "${prodName}"?`)) return;
    try {
      const res = await fetch(`/api/brand/${brandId}/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(String(e));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-lg">
            📦
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {products.length} Registered Product{products.length === 1 ? "" : "s"}
            </h2>
            <p className="text-xs text-neutral-400">
              Reference items with locked claims prevent AI hallucination across campaigns.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200"
        >
          + Add Product
        </button>
      </div>

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-400">
            📦
          </div>
          <h3 className="mt-4 text-base font-medium text-white">No products registered yet</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            Add your flagship product with verified claims (e.g. materials, certifications, verified test stats) to begin generating high-fidelity on-brand campaigns.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((prod) => {
            const hasImages = prod.images && prod.images.length > 0;
            const primaryImage = hasImages ? prod.images[0] : null;

            return (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-700"
              >
                <div>
                  {/* Top Product Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                        {primaryImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">
                            No Photo
                          </div>
                        )}
                        {hasImages && prod.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] text-white">
                            +{prod.images.length - 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          {prod.category && (
                            <span className="rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                              {prod.category}
                            </span>
                          )}
                          {prod.sku && (
                            <span className="font-mono text-[10px] text-neutral-500">
                              SKU: {prod.sku}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-white">{prod.name}</h3>
                        <p className="font-mono text-xs font-medium text-emerald-400">
                          {prod.currency} {prod.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Fidelity Badge */}
                    <div>
                      {prod.fidelityLock ? (
                        <span
                          title="Anti-hallucination fidelity lock enabled"
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"
                        >
                          🔒 Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs leading-relaxed text-neutral-300 line-clamp-2">
                    {prod.description}
                  </p>

                  {/* Verified Claims Section */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span>🛡️</span> Verified Claims ({prod.claims.length})
                    </p>
                    {prod.claims.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {prod.claims.map((claim, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-[11px] text-emerald-200"
                          >
                            ✓ {claim}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] italic text-neutral-500">No verified claims added yet.</p>
                    )}
                  </div>

                  {/* Benefits Section */}
                  {prod.benefits.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Customer Benefits
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-300"
                          >
                            • {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-5 pt-3 border-t border-neutral-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/brand/${brandId}/campaigns/new?productId=${prod.id}`}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
                    >
                      Generate Campaign →
                    </Link>
                    {primaryImage && (
                      <Link
                        href={`/brand/${brandId}/photo-studio?productImageUrl=${encodeURIComponent(primaryImage)}`}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition"
                      >
                        Photo Studio →
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-xs text-neutral-400 hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="text-xs text-rose-500 hover:text-rose-400 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {editingProduct ? "Edit Product Facts" : "Add Product to Catalog"}
                </h3>
                <p className="text-xs text-neutral-400">
                  Factual specifications and verified claims prevent hallucinated claims.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AeroLite Running Shoes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SKU / Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AERO-RUN-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="129.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white text-center font-mono outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Footwear, Apparel, Skincare"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Comprehensive description of materials, purpose, and construction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                />
              </div>

              {/* Reference Photos Upload */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Reference Images ({images.length})
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-xs text-neutral-400 hover:border-neutral-500 hover:text-white">
                    {uploadingImage ? "…" : "+ Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Upload crisp packshots or reference photos used by Photo Studio and campaign creatives.
                </p>
              </div>

              {/* Verified Claims (One per line) */}
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1 flex items-center gap-1">
                  <span>🛡️</span> Verified Factual Claims (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g.&#10;100% GOTS Certified Organic Cotton&#10;Waterproof up to 10,000mm hydrostatic head&#10;Carbon Neutral Certified by ClimatePartner"
                  value={claimsText}
                  onChange={(e) => setClaimsText(e.target.value)}
                  className="w-full rounded-lg border border-emerald-900/50 bg-neutral-900 px-3 py-2 text-xs text-emerald-200 outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-neutral-500">
                  The AI is strictly constrained to these claims and will not invent specs or numbers.
                </p>
              </div>

              {/* Benefits (One per line) */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Customer Benefits (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g.&#10;All-day breathable comfort&#10;Lightweight packability for trail runs"
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                />
              </div>

              {/* Fidelity Lock Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                <div>
                  <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>🔒</span> Anti-Hallucination Fidelity Lock
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    When active, LLM creative prompts strictly enforce that no unlisted claims or stats can be generated.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={fidelityLock}
                  onChange={(e) => setFidelityLock(e.target.checked)}
                  className="h-4 w-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !description.trim() || price === ""}
                  className="rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
