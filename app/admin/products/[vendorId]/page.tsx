"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function AdminVendorProductsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;
  const [vendor, setVendor] = useState<any>(null);
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
          .select("*")
          .eq("user_id", vendorId)
          .maybeSingle(),
        supabase
          .from("products")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("name", { ascending: true }),
      ]);

      setVendor(profile);
      setProducts(productData || []);
      setLoading(false);
    };
    if (vendorId) load();
  }, [vendorId, router]);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/products" className="text-sm text-[#7EB6B8]">
          ← All vendors
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {vendor?.full_name || vendor?.username || "Vendor"} catalogue
        </h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          Supply prices (what DIGITπ pays this vendor)
        </p>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-4 gap-3 px-6 py-4 text-xs uppercase text-[#8B9998] border-b border-white/10">
              <div>Product</div>
              <div>Stock</div>
              <div>Supply price</div>
              <div>Description</div>
            </div>
            {loading ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
            ) : products.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">
                No products listed
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {products.map((p) => {
                  const stock = Number(p.stock ?? p.stock_quantity ?? 0);
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-4 gap-3 px-6 py-4 text-sm"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div
                        className={
                          stock === 0
                            ? "text-[#C64435]"
                            : stock <= 5
                            ? "text-[#E4A73B]"
                            : "text-[#C7D6D4]"
                        }
                      >
                        {stock}
                        {stock === 0 ? " · Empty" : stock <= 5 ? " · Low" : ""}
                      </div>
                      <div className="text-[#7EB6B8] font-medium">
                        KSh{" "}
                        {Number(p.price ?? p.unit_price ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[12px] text-[#8B9998]">
                        {p.description || "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}