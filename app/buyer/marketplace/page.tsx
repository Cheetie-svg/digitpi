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

  const imagesOf = (p: any): string[] => {
    if (Array.isArray(p.image_urls) && p.image_urls.length) return p.image_urls;
    if (p.image_url) return [p.image_url];
    return [];
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/buyer" className="text-sm text-[#7EB6B8]">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold mt-1">Marketplace</h1>
            <p className="text-sm text-[#9BB5B4]">Tap an item for details</p>
          </div>
          <Link
            href="/buyer/orders"
            className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
          >
            My Orders
          </Link>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          className="w-full max-w-xl mb-8 bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#8B9998]"
        />

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-10 text-center text-[#8B9998]">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const imgs = imagesOf(p);
              return (
                <Link key={p.id} href={`/buyer/product/${p.id}`}>
                  <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden hover:border-[#0F6E76] transition h-full">
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
                      <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                        {p.name}
                      </p>
                      <p className="text-[#7EB6B8] font-bold mt-2">
                        KSh {priceOf(p).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#8B9998] mt-1">
                        View details →
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}