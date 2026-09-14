"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);

    if (!name || !price || !stock) {
      setError("Please fill in name, price and stock");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("products").insert({
        vendor_id: user.id,
        name,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        is_active: true,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // Success → go back to products list
      router.push("/vendor/products");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/vendor/products" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Add Product</h1>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
            
            {/* Photo Upload (placeholder for now) */}
            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">Product Photo</p>
              <div className="bg-white rounded-xl border-2 border-dashed border-[#DCE4E3] p-6 text-center">
                <span className="text-3xl">📷</span>
                <p className="text-[12px] text-[#6B7A79] mt-2">
                  Photo upload coming soon
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#8B9998] uppercase">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-white rounded-xl px-4 py-3 text-[14px] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#8B9998] uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 bg-white rounded-xl px-4 py-3 text-[14px] outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#8B9998] uppercase">Your Price (KSh)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 bg-white rounded-xl px-4 py-3 text-[14px] outline-none"
              />
              <p className="text-[11px] text-[#8B9998] mt-1">
                This is the price you sell to DIGITπ
              </p>
            </div>

            <div>
              <label className="text-[11px] text-[#8B9998] uppercase">Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full mt-1 bg-white rounded-xl px-4 py-3 text-[14px] outline-none"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#C64435] text-center">{error}</p>
            )}

          </div>

          {/* Save Button */}
          <div className="px-5 pb-6">
            <button
              onClick={handleSave}
              disabled={loading || !name || !price || !stock}
              className={`w-full py-3.5 rounded-full text-[14px] font-medium transition ${
                name && price && stock && !loading
                  ? "bg-[#0F6E76] text-white active:scale-95"
                  : "bg-[#B8C2C1] text-white cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}