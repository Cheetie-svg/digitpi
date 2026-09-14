"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .order("name", { ascending: true });

      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const priceOf = (p: any) =>
    Number(p.selling_price ?? p.retail_price ?? p.price ?? 0);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-white">Marketplace</h1>
              <p className="text-[11px] text-[#9BB5B4]">Tap an item for details</p>
            </div>
          </div>

          <div className="px-5 mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full bg-[#1B3338] border border-white/10 rounded-full px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#8B9998]"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {loading ? (
              <p className="text-center text-[#8B9998] text-[13px] py-10">
                Loading...
              </p>
            ) : filtered.length === 0 ? (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center text-[#8B9998] text-[13px]">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <Link key={p.id} href={`/buyer/product/${p.id}`}>
                    <div className="bg-[#1B3338] border border-white/10 rounded-xl p-3 h-full active:scale-[0.99] transition">
                      <div className="h-24 rounded-lg bg-[#0F6E76]/20 mb-2 overflow-hidden flex items-center justify-center">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#7EB6B8] text-xl">🔧</span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold text-white line-clamp-2 min-h-[2.5rem]">
                        {p.name}
                      </p>
                      <p className="text-[13px] font-bold text-[#7EB6B8] mt-1">
                        KSh {priceOf(p).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#8B9998] mt-1">
                        View details →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}