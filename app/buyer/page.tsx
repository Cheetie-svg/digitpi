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
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <p className="text-[12px] text-[#7EB6B8]">DIGITπ</p>
            <h1 className="text-[18px] font-bold text-white mt-0.5">
              Hi {username}
            </h1>
            <p className="text-[12px] text-[#9BB5B4] mt-0.5">
              Your trusted partner for verified hardware
            </p>
          </div>

          <div className="px-5 mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search marketplace"
              className="w-full bg-[#1B3338] border border-white/10 rounded-full px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#8B9998]"
            />
          </div>

          <div className="px-5 mb-4">
            <p className="text-[11px] text-[#8B9998] uppercase mb-2">
              Need help fast
            </p>
            <div className="flex justify-between gap-2">
              <Link href="/buyer/assistant" className="flex-1">
                <div className="bg-[#1B3338] border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">🤖</div>
                  <p className="text-[11px] font-medium text-white">Assistant</p>
                </div>
              </Link>
              <Link href="/buyer/marketplace" className="flex-1">
                <div className="bg-[#0F6E76] rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">🛒</div>
                  <p className="text-[11px] font-medium text-white">Marketplace</p>
                </div>
              </Link>
              <Link href="/buyer/orders" className="flex-1">
                <div className="bg-[#1B3338] border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1 text-[#7EB6B8]">⇄</div>
                  <p className="text-[11px] font-medium text-white">My Orders</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-white">
                Recommended for you
              </p>
              <Link href="/buyer/marketplace" className="text-[11px] text-[#7EB6B8]">
                See all
              </Link>
            </div>

            {loading ? (
              <p className="text-center text-[13px] text-[#8B9998] py-8">
                Loading...
              </p>
            ) : filtered.length === 0 ? (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center">
                <p className="text-[13px] text-[#8B9998]">No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.slice(0, 6).map((p) => (
                  <Link key={p.id} href="/buyer/marketplace">
                    <div className="bg-[#1B3338] border border-white/10 rounded-xl p-3 h-full">
                      <div className="h-16 rounded-lg bg-[#0F6E76]/30 mb-2 flex items-center justify-center text-[#7EB6B8] text-lg">
                        🔧
                      </div>
                      <p className="text-[12px] font-semibold text-white line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-[12px] font-bold text-[#7EB6B8] mt-1">
                        KSh {priceOf(p).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#1B3338] px-6 py-3 flex justify-between items-center">
            <Link
              href="/buyer/profile"
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#8B9998]">Profile</span>
            </Link>
            <Link href="/buyer" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] text-[#7EB6B8] font-medium">Home</span>
            </Link>
            <Link
              href="/buyer/tracking"
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-xl">📦</span>
              <span className="text-[10px] text-[#8B9998]">Orders</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}