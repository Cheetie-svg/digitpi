"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function BuyerHomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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

      const [{ data: profile }, { data: productData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, full_name")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      setUsername(profile?.username || profile?.full_name || "there");
      setProducts(productData || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    return (p.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const priceOf = (p: any) =>
    Number(p.selling_price ?? p.retail_price ?? p.price ?? 0);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#7EB6B8]">DIGITπ</p>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">
              Hi {username}
            </h1>
            <p className="text-sm text-[#9BB5B4] mt-1">
              Your trusted partner for verified hardware
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/buyer/profile"
              className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
            >
              Profile
            </Link>
            <Link
              href="/buyer/tracking"
              className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
            >
              Track orders
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marketplace"
            className="w-full max-w-xl bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#8B9998]"
          />
        </div>

        {/* Quick actions */}
        <p className="text-xs text-[#8B9998] uppercase mb-3">Need help fast</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link href="/buyer/assistant">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <p className="text-2xl mb-2">🤖</p>
              <h2 className="font-semibold">Assistant</h2>
              <p className="text-sm text-[#9BB5B4] mt-1">
                Water, plumbing & purchase help
              </p>
            </div>
          </Link>
          <Link href="/buyer/marketplace">
            <div className="rounded-2xl bg-[#0F6E76] p-5 hover:brightness-110 transition h-full">
              <p className="text-2xl mb-2">🛒</p>
              <h2 className="font-semibold">Marketplace</h2>
              <p className="text-sm text-white/80 mt-1">
                Browse verified hardware
              </p>
            </div>
          </Link>
          <Link href="/buyer/orders">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <p className="text-2xl mb-2">⇄</p>
              <h2 className="font-semibold">My Orders</h2>
              <p className="text-sm text-[#9BB5B4] mt-1">
                Cart, active & completed
              </p>
            </div>
          </Link>
        </div>

        {/* Recommended */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <Link href="/buyer/marketplace" className="text-sm text-[#7EB6B8]">
            See all →
          </Link>
        </div>

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-8 text-center text-[#8B9998]">
            No products to show yet
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.slice(0, 8).map((p) => {
              const imgs =
                Array.isArray(p.image_urls) && p.image_urls.length
                  ? p.image_urls
                  : p.image_url
                  ? [p.image_url]
                  : [];
              return (
                <Link key={p.id} href={`/buyer/product/${p.id}`}>
                  <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden hover:border-[#0F6E76] transition h-full">
                    <div className="h-36 bg-[#0F6E76]/20 flex items-center justify-center overflow-hidden">
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