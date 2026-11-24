"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const STAGES = [
  "Pending",
  "Received",
  "Dispatched",
  "Delivered",
  "Reviewed",
];

function stageIndex(status: string) {
  const s = status || "Pending";
  if (s === "Ready for Pickup" || s === "Assigned" || s === "Accepted") return 2;
  const i = STAGES.indexOf(s);
  return i >= 0 ? i : 0;
}

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function TrackingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
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
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <Link href="/buyer" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Order tracking</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">Live progress of your jobs</p>

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-10 text-center text-[#8B9998]">
            No orders to track
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const idx = stageIndex(o.status);
              const open = openId === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="w-full text-left rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#8B9998]">#{shortId(o.id)}</p>
                      <p className="font-medium mt-0.5">{o.product_name}</p>
                    </div>
                    <span className="text-sm text-[#7EB6B8]">{o.status}</span>
                  </div>

                  <div className="flex gap-1.5 mt-4">
                    {STAGES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= idx ? "bg-[#0F6E76]" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  {open && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                      {STAGES.map((s, i) => (
                        <p
                          key={s}
                          className={`text-sm ${
                            i <= idx ? "text-[#7EB6B8]" : "text-[#8B9998]"
                          }`}
                        >
                          {i <= idx ? "●" : "○"} {s}
                        </p>
                      ))}
                      <div className="flex gap-3 mt-3">
                        <Link
                          href="/buyer/returns"
                          className="text-sm text-[#E4A73B]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Return / Replace
                        </Link>
                        {o.status === "Delivered" && (
                          <Link
                            href={`/buyer/review/${o.id}`}
                            className="text-sm text-[#7EB6B8]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Leave review
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}