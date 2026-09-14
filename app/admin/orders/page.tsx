"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

function statusStyle(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("return") || s.includes("replace") || s.includes("refund"))
    return "text-[#E4A73B]";
  if (s === "delivered" || s === "completed" || s === "reviewed")
    return "text-[#7EB6B8]";
  if (s === "cancelled") return "text-[#C64435]";
  return "text-[#C7D6D4]";
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    const s = (o.status || "").toLowerCase();
    if (filter === "completed")
      return ["delivered", "completed", "reviewed"].includes(s);
    if (filter === "active")
      return [
        "pending",
        "received",
        "ready for pickup",
        "assigned",
        "dispatched",
      ].includes(s);
    if (filter === "returns")
      return s.includes("return") || s.includes("replace") || s.includes("refund");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">All orders</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          From first order to latest · {filtered.length} shown
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["completed", "Completed"],
            ["returns", "Return / Replace"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === key ? "bg-[#0F6E76]" : "bg-white/10 text-[#C7D6D4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-5 gap-3 px-6 py-4 text-xs uppercase text-[#8B9998] border-b border-white/10">
              <div>Order no</div>
              <div>Product</div>
              <div>Date</div>
              <div>Status</div>
              <div>Amount</div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">No orders</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-5 gap-3 px-6 py-4 text-sm items-center"
                  >
                    <div className="font-mono font-medium">
                      #{shortId(o.id)}
                    </div>
                    <div>
                      <p>{o.product_name}</p>
                      <p className="text-[11px] text-[#8B9998]">
                        Qty {o.quantity}
                      </p>
                    </div>
                    <div className="text-[12px] text-[#9BB5B4]">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString()
                        : "—"}
                    </div>
                    <div className={`text-[12px] font-medium ${statusStyle(o.status)}`}>
                      {o.status || "Pending"}
                    </div>
                    <div className="text-[#7EB6B8]">
                      KSh {Number(o.total_amount || 0).toLocaleString()}
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