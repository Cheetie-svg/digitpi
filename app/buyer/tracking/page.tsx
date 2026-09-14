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
  if (s === "Ready for Pickup" || s === "Assigned") return 2;
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
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-white">Order tracking</h1>
            <p className="text-[12px] text-[#9BB5B4]">Live progress of your jobs</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {loading ? (
              <p className="text-center text-[#8B9998] text-[13px]">Loading...</p>
            ) : orders.length === 0 ? (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center text-[13px] text-[#8B9998]">
                No orders to track
              </div>
            ) : (
              orders.map((o) => {
                const idx = stageIndex(o.status);
                const open = openId === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOpenId(open ? null : o.id)}
                    className="w-full text-left bg-[#1B3338] border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-[11px] text-[#8B9998]">
                          #{shortId(o.id)}
                        </p>
                        <p className="text-[13px] font-semibold text-white">
                          {o.product_name}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#7EB6B8]">
                        {o.status}
                      </span>
                    </div>

                    <div className="flex gap-1 mt-3">
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
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                        {STAGES.map((s, i) => (
                          <p
                            key={s}
                            className={`text-[11px] ${
                              i <= idx ? "text-[#7EB6B8]" : "text-[#8B9998]"
                            }`}
                          >
                            {i <= idx ? "●" : "○"} {s}
                          </p>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <Link href="/buyer/returns">
                            <span className="text-[11px] text-[#E4A73B]">
                              Return / Replace
                            </span>
                          </Link>
                          {o.status === "Delivered" && (
                            <Link href={`/buyer/review/${o.id}`}>
                              <span className="text-[11px] text-[#7EB6B8]">
                                Review
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 bg-[#1B3338] px-6 py-3 flex justify-between">
            <Link href="/buyer/profile" className="text-center">
              <div className="text-xl">👤</div>
              <div className="text-[10px] text-[#8B9998]">Profile</div>
            </Link>
            <Link href="/buyer" className="text-center">
              <div className="text-xl">🏠</div>
              <div className="text-[10px] text-[#8B9998]">Home</div>
            </Link>
            <Link href="/buyer/tracking" className="text-center">
              <div className="text-xl">📦</div>
              <div className="text-[10px] text-[#7EB6B8] font-medium">Orders</div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}