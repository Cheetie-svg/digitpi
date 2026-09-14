"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminProductsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
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

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .ilike("role", "vendor");

      const { data: products } = await supabase
        .from("products")
        .select("vendor_id, stock, price");

      const withCounts = (profiles || []).map((v) => {
        const theirs = (products || []).filter((p) => p.vendor_id === v.user_id);
        return {
          ...v,
          productCount: theirs.length,
          totalStock: theirs.reduce((s, p) => s + Number(p.stock ?? 0), 0),
        };
      });

      setVendors(withCounts);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">Products by vendor</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          Open a vendor to see catalogue, stock and supply prices
        </p>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden">
          {loading ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">No vendors</div>
          ) : (
            <div className="divide-y divide-white/5">
              {vendors.map((v) => (
                <div
                  key={v.user_id}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">
                      {v.full_name || v.username || "—"}
                    </p>
                    <p className="text-[12px] text-[#9BB5B4]">{v.email}</p>
                    <p className="text-[12px] text-[#8B9998] mt-1">
                      {v.productCount} products · {v.totalStock} stock units
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${v.user_id}`}
                    className="px-4 py-2 rounded-xl bg-[#0F6E76] text-sm font-medium"
                  >
                    Open catalogue →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}