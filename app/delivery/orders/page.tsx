"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const [available, setAvailable] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const [{ data: openJobs }, { data: mine }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("status", "Ready for Pickup")
        .is("delivery_id", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("delivery_id", user.id)
        .in("status", ["Assigned", "Dispatched"])
        .order("created_at", { ascending: false }),
    ]);

    setAvailable(openJobs || []);
    setMyJobs(mine || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const updateRank = async (userId: string, delta: number) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rank_points")
      .eq("user_id", userId)
      .maybeSingle();

    const current = Number(profile?.rank_points ?? 50);
    const next = Math.min(100, Math.max(0, current + delta));
    await supabase
      .from("profiles")
      .update({ rank_points: next })
      .eq("user_id", userId);
  };

  const accept = async (orderId: string) => {
    setActionId(orderId);
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status: "Assigned",
        delivery_id: user.id,
      })
      .eq("id", orderId)
      .eq("status", "Ready for Pickup");

    if (error) {
      setMessage(error.message);
      setActionId(null);
      return;
    }

    await updateRank(user.id, 1.5);
    setActionId(null);
    router.push(`/delivery/order/${orderId}`);
  };

  const decline = async (orderId: string) => {
    setActionId(orderId);
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Keep order available for others; only penalise rank
    await updateRank(user.id, -2.0);
    setMessage("Declined — rank adjusted");
    setActionId(null);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-white">Delivery jobs</h1>
            <p className="text-[12px] text-[#9BB5B4]">
              Accept pickup work from DIGITπ
            </p>
          </div>

          {message && (
            <p className="text-center text-[12px] text-[#7EB6B8] px-5 mb-2">
              {message}
            </p>
          )}

          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
            
            <div>
              <p className="text-[11px] text-[#8B9998] uppercase mb-2">
                Available
              </p>
              {loading ? (
                <p className="text-[13px] text-[#8B9998]">Loading...</p>
              ) : available.length === 0 ? (
                <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 text-center text-[13px] text-[#8B9998]">
                  No jobs waiting
                </div>
              ) : (
                available.map((o) => (
                  <div
                    key={o.id}
                    className="bg-[#1B3338] border border-white/10 rounded-xl p-4 mb-3"
                  >
                    <p className="text-[11px] text-[#8B9998]">
                      #{shortId(o.id)}
                    </p>
                    <p className="text-[14px] font-semibold text-white mt-0.5">
                      {o.product_name}
                    </p>
                    <p className="text-[12px] text-[#9BB5B4] mt-1">
                      Qty {o.quantity} · {o.status}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => decline(o.id)}
                        disabled={actionId === o.id}
                        className="py-2 rounded-full bg-white/10 text-[#C64435] text-[12px] font-medium"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => accept(o.id)}
                        disabled={actionId === o.id}
                        className="py-2 rounded-full bg-[#0F6E76] text-white text-[12px] font-medium"
                      >
                        {actionId === o.id ? "..." : "Accept"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <p className="text-[11px] text-[#8B9998] uppercase mb-2">
                My active jobs
              </p>
              {myJobs.length === 0 ? (
                <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 text-center text-[13px] text-[#8B9998]">
                  None right now
                </div>
              ) : (
                myJobs.map((o) => (
                  <Link key={o.id} href={`/delivery/order/${o.id}`}>
                    <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 mb-3">
                      <p className="text-[11px] text-[#8B9998]">
                        #{shortId(o.id)}
                      </p>
                      <p className="text-[14px] font-semibold text-white mt-0.5">
                        {o.product_name}
                      </p>
                      <p className="text-[12px] text-[#7EB6B8] mt-1">
                        {o.status} · Open job →
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#1B3338] px-6 py-3 flex justify-between">
            <Link href="/delivery/profile" className="text-center">
              <div className="text-xl">👤</div>
              <div className="text-[10px] text-[#8B9998]">Profile</div>
            </Link>
            <Link href="/delivery/orders" className="text-center">
              <div className="text-xl">🚚</div>
              <div className="text-[10px] text-[#7EB6B8] font-medium">Jobs</div>
            </Link>
            <Link href="/delivery/completed" className="text-center">
              <div className="text-xl">✓</div>
              <div className="text-[10px] text-[#8B9998]">Completed</div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}