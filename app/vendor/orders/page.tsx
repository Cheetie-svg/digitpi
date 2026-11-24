"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}
<Link
  href="/vendor/payout"
  className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
>
  Payout
</Link>
export default function VendorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const pending = orders.filter((o) => o.status === "Pending");
  const active = orders.filter((o) =>
    ["Received", "Ready for Pickup"].includes(o.status)
  );

  const markReceived = async (order: any) => {
    setActionId(order.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("orders")
      .update({ status: "Received" })
      .eq("id", order.id)
      .eq("vendor_id", user.id);

    // reduce stock if product linked
    if (order.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("stock, stock_quantity")
        .eq("id", order.product_id)
        .maybeSingle();
      if (product) {
        const current = Number(product.stock ?? product.stock_quantity ?? 0);
        const qty = Number(order.quantity || 1);
        const next = Math.max(0, current - qty);
        await supabase
          .from("products")
          .update({ stock: next })
          .eq("id", order.product_id);
      }
    }

    setActionId(null);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#7EB6B8]">Vendor</p>
            <h1 className="text-2xl font-bold mt-1">Orders</h1>
            <p className="text-sm text-[#9BB5B4]">New jobs from DIGITπ</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/vendor/products"
              className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
            >
              My Products
            </Link>
            <Link
              href="/vendor/profile"
              className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Pending */}
        <h2 className="text-xs text-[#8B9998] uppercase mb-3">Pending</h2>
        {loading ? (
          <p className="text-[#8B9998] mb-8">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-8 text-center text-[#8B9998] mb-8">
            No pending orders right now
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {pending.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-[#8B9998]">#{shortId(o.id)}</p>
                  <p className="font-medium mt-0.5">{o.product_name}</p>
                  <p className="text-sm text-[#9BB5B4]">Qty {o.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/vendor/order/${o.id}`}>
                    <button className="px-4 py-2 rounded-xl border border-white/10 text-sm">
                      Details
                    </button>
                  </Link>
                  <button
                    onClick={() => markReceived(o)}
                    disabled={actionId === o.id}
                    className="px-4 py-2 rounded-xl bg-[#0F6E76] text-sm font-medium disabled:opacity-60"
                  >
                    {actionId === o.id ? "..." : "Receive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active */}
        <h2 className="text-xs text-[#8B9998] uppercase mb-3">Active</h2>
        {active.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-8 text-center text-[#8B9998]">
            Nothing in packing yet
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
              <Link key={o.id} href={`/vendor/order/${o.id}`}>
                <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition mb-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-[#8B9998]">#{shortId(o.id)}</p>
                      <p className="font-medium mt-0.5">{o.product_name}</p>
                    </div>
                    <span className="text-sm text-[#7EB6B8]">{o.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}