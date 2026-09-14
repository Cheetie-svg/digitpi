"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminInventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) console.error(error);
    setProducts(data || []);

    const map: Record<string, string> = {};
    (data || []).forEach((p) => {
      map[p.id] = String(p.selling_price ?? p.retail_price ?? "");
    });
    setPrices(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  // Group by product name → average vendor supply price
  const rows = useMemo(() => {
    const groups: Record<
      string,
      { name: string; supplies: number[]; items: any[] }
    > = {};

    products.forEach((p) => {
      const key = (p.name || "Unknown").trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = { name: p.name || "Unknown", supplies: [], items: [] };
      }
      groups[key].supplies.push(Number(p.price ?? p.unit_price ?? 0));
      groups[key].items.push(p);
    });

    return Object.values(groups).map((g) => {
      const avg =
        g.supplies.length > 0
          ? g.supplies.reduce((a, b) => a + b, 0) / g.supplies.length
          : 0;
      // Use first product row as marketplace anchor if shared selling price field exists
      const anchor = g.items[0];
      return {
        key: g.name,
        name: g.name,
        vendorCount: g.items.length,
        avgSupply: avg,
        anchorId: anchor?.id,
        currentSelling: anchor?.selling_price ?? anchor?.retail_price ?? "",
        totalStock: g.items.reduce(
          (s, p) => s + Number(p.stock ?? p.stock_quantity ?? 0),
          0
        ),
      };
    });
  }, [products]);

  const saveSelling = async (productId: string) => {
    if (!productId) return;
    setSavingId(productId);
    setMessage("");
    const value = Number(prices[productId] || 0);

    const { error } = await supabase
      .from("products")
      .update({ selling_price: value })
      .eq("id", productId);

    if (error) {
      const { error: err2 } = await supabase
        .from("products")
        .update({ retail_price: value })
        .eq("id", productId);
      if (err2) setMessage(err2.message);
      else setMessage("Selling price saved");
    } else {
      setMessage("Selling price saved");
      await load();
    }
    setSavingId(null);
  };

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">Inventory pricing</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          Average vendor supply price → set DIGITπ marketplace selling price
        </p>

        {message && (
          <p className="text-sm text-[#C7F0E8] mb-4">{message}</p>
        )}

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-5 gap-3 px-6 py-4 text-xs uppercase text-[#8B9998] border-b border-white/10">
              <div>Product</div>
              <div>Vendors</div>
              <div>Avg supply</div>
              <div>Stock</div>
              <div>Selling price</div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">
                No products yet
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {rows.map((r) => (
                  <div
                    key={r.key}
                    className="grid grid-cols-5 gap-3 px-6 py-4 text-sm items-center"
                  >
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[#9BB5B4]">{r.vendorCount}</div>
                    <div className="text-[#7EB6B8]">
                      KSh {Math.round(r.avgSupply).toLocaleString()}
                    </div>
                    <div>{r.totalStock}</div>
                    <div className="flex gap-2 items-center">
                      <input
                        value={prices[r.anchorId] ?? ""}
                        onChange={(e) =>
                          setPrices((prev) => ({
                            ...prev,
                            [r.anchorId]: e.target.value,
                          }))
                        }
                        type="number"
                        className="w-28 rounded-lg bg-[#142A2E] border border-white/10 px-2 py-1.5 text-sm outline-none"
                      />
                      <button
                        onClick={() => saveSelling(r.anchorId)}
                        disabled={savingId === r.anchorId}
                        className="px-3 py-1.5 rounded-lg bg-[#0F6E76] text-[12px]"
                      >
                        {savingId === r.anchorId ? "..." : "Set"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}