"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

function displayStatus(status: string) {
  if (["Delivered", "Reviewed", "Completed"].includes(status)) {
    return { label: "Completed", color: "text-[#7EB6B8]" };
  }
  if (status === "Assigned" || status === "Dispatched") {
    return { label: "In transit", color: "text-[#E4A73B]" };
  }
  if (status === "Cancelled" || status === "Rejected") {
    return { label: "Rejected", color: "text-[#C64435]" };
  }
  return { label: status || "—", color: "text-[#9BB5B4]" };
}

export default function DeliveryCompletedPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
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
        .eq("delivery_id", user.id)
        .order("created_at", { ascending: false });

      setJobs(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-white">Completed jobs</h1>
            <p className="text-[12px] text-[#9BB5B4]">Your delivery history</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {loading ? (
              <p className="text-center text-[13px] text-[#8B9998]">Loading...</p>
            ) : jobs.length === 0 ? (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center text-[13px] text-[#8B9998]">
                No jobs yet
              </div>
            ) : (
              jobs.map((o) => {
                const st = displayStatus(o.status);
                return (
                  <Link key={o.id} href={`/delivery/order/${o.id}`}>
                    <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 mb-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[11px] text-[#8B9998]">
                            #{shortId(o.id)}
                          </p>
                          <p className="text-[13px] font-semibold text-white mt-0.5">
                            {o.product_name}
                          </p>
                        </div>
                        <span className={`text-[11px] font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 bg-[#1B3338] px-6 py-3 flex justify-between">
            <Link href="/delivery/profile" className="text-center">
              <div className="text-xl">👤</div>
              <div className="text-[10px] text-[#8B9998]">Profile</div>
            </Link>
            <Link href="/delivery/orders" className="text-center">
              <div className="text-xl">🚚</div>
              <div className="text-[10px] text-[#8B9998]">Jobs</div>
            </Link>
            <Link href="/delivery/completed" className="text-center">
              <div className="text-xl">✓</div>
              <div className="text-[10px] text-[#7EB6B8] font-medium">Completed</div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}