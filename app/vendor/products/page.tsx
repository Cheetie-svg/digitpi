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
    if (Array.isArray(p.image_urls) && p.image_urls.length) {
      return p.image_urls.filter(Boolean);
    }
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

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/vendor/profile"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-white">My Products</h1>
              <p className="text-[11px] text-[#9BB5B4]">
                Multiple photos allowed
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            {!showForm && (
              <button
                onClick={openNew}
                className="w-full bg-[#0F6E76] text-white rounded-full py-3 text-[14px] font-medium"
              >
                + Add product
              </button>
            )}

            {showForm && (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-[13px] font-semibold text-white">
                  {editing ? "Edit product" : "New product"}
                </p>

                {/* Photo strip */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((src, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img
                        src={src}
                        alt={`Photo ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C64435] text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <label className="inline-block px-4 py-2 rounded-full bg-[#0F6E76] text-white text-[12px] cursor-pointer">
                  {uploading ? "Uploading..." : "+ Add photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-[11px] text-[#8B9998]">
                  First photo is the cover. Add more to promote the item.
                </p>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none resize-none"
                />
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Supply price to DIGITπ"
                  type="number"
                  className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none"
                />
                <input
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Stock quantity"
                  type="number"
                  className="w-full bg-[#142A2E] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none"
                />

                {message && (
                  <p className="text-[12px] text-[#C64435]">{message}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="py-2.5 rounded-full border border-white/10 text-[13px] text-[#C7D6D4]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || uploading}
                    className="py-2.5 rounded-full bg-[#0F6E76] text-white text-[13px]"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-center text-[13px] text-[#8B9998]">Loading...</p>
            ) : products.length === 0 ? (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center text-[13px] text-[#8B9998]">
                No products yet
              </div>
            ) : (
              products.map((p) => {
                const s = getStock(p);
                const imgs = getImages(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => openEdit(p)}
                    className="w-full text-left bg-[#1B3338] border border-white/10 rounded-xl p-3 flex gap-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0F6E76]/20 flex-shrink-0">
                      {imgs[0] ? (
                        <img
                          src={imgs[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#7EB6B8]">
                          🔧
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {p.name}
                      </p>
                      <p
                        className={`text-[12px] mt-0.5 ${
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
                      <p className="text-[12px] text-[#7EB6B8] mt-0.5">
                        KSh {Number(p.price ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}