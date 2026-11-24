"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const LOW_STOCK = 5;

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const getStock = (p: any) => Number(p.stock ?? p.stock_quantity ?? 0);

  const getImages = (p: any): string[] => {
    if (Array.isArray(p.image_urls) && p.image_urls.length)
      return p.image_urls.filter(Boolean);
    if (p.image_url) return [p.image_url];
    return [];
  };

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrls([]);
    setShowForm(true);
    setMessage("");
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(String(p.price ?? p.unit_price ?? ""));
    setStock(String(getStock(p)));
    setImageUrls(getImages(p));
    setShowForm(true);
    setMessage("");
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setMessage(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrls((prev) => [...prev, data.publicUrl]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!name.trim()) {
      setMessage("Product name is required");
      return;
    }
    if (imageUrls.length === 0) {
      setMessage("At least one product photo is required");
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      vendor_id: user.id,
      image_url: imageUrls[0],
      image_urls: imageUrls,
    };

    let error;
    if (editing) {
      ({ error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id)
        .eq("vendor_id", user.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) {
      setMessage(error.message);
    } else {
      setShowForm(false);
      setEditing(null);
      await load();
    }
    setSaving(false);
  };

  const lowStock = products.filter((p) => {
    const s = getStock(p);
    return s > 0 && s <= LOW_STOCK;
  });
  const emptyStock = products.filter((p) => getStock(p) === 0);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/vendor/orders" className="text-sm text-[#7EB6B8]">
              ← Orders
            </Link>
            <h1 className="text-2xl font-bold mt-1">My Products</h1>
            <p className="text-sm text-[#9BB5B4]">
              Photos required · multiple allowed
            </p>
          </div>
          {!showForm && (
            <button
              onClick={openNew}
              className="px-5 py-2.5 rounded-xl bg-[#0F6E76] text-sm font-medium"
            >
              + Add product
            </button>
          )}
        </div>

        {/* Alerts */}
        {emptyStock.length > 0 && (
          <div className="rounded-xl bg-[#C64435]/15 border border-[#C64435]/40 px-4 py-3 text-sm text-[#C64435] mb-4">
            {emptyStock.length} product(s) out of stock
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="rounded-xl bg-[#E4A73B]/15 border border-[#E4A73B]/40 px-4 py-3 text-sm text-[#E4A73B] mb-4">
            {lowStock.length} product(s) low on stock (≤ {LOW_STOCK})
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 mb-8 space-y-4">
            <h2 className="font-semibold">
              {editing ? "Edit product" : "New product"}
            </h2>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {imageUrls.map((src, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#C64435] text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <label className="inline-block px-4 py-2 rounded-xl bg-[#0F6E76] text-sm cursor-pointer">
              {uploading ? "Uploading..." : "+ Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-xs text-[#8B9998]">
              First photo is the cover. Add more to promote the item.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Supply price to DIGITπ (KSh)"
                type="number"
                className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock quantity"
                type="number"
                className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full md:col-span-2 bg-[#142A2E] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
              />
            </div>

            {message && (
              <p className="text-sm text-[#C64435]">{message}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || uploading}
                className="px-5 py-2.5 rounded-xl bg-[#0F6E76] text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save product"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-10 text-center text-[#8B9998]">
            No products yet. Add your first item.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const s = getStock(p);
              const imgs = getImages(p);
              return (
                <button
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className="text-left rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden hover:border-[#0F6E76] transition"
                >
                  <div className="h-40 bg-[#0F6E76]/20 flex items-center justify-center overflow-hidden">
                    {imgs[0] ? (
                      <img
                        src={imgs[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-[#7EB6B8]">🔧</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium truncate">{p.name}</p>
                    <p
                      className={`text-sm mt-1 ${
                        s === 0
                          ? "text-[#C64435]"
                          : s <= LOW_STOCK
                          ? "text-[#E4A73B]"
                          : "text-[#9BB5B4]"
                      }`}
                    >
                      Stock: {s}
                      {imgs.length > 1 ? ` · ${imgs.length} photos` : ""}
                    </p>
                    <p className="text-[#7EB6B8] font-medium mt-1">
                      KSh {Number(p.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}